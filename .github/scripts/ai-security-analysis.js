const fs = require("fs");
const path = require("path");

const { OpenAI } = require("openai");
const { WebClient } = require("@slack/web-api");

const SECURITY_REPORTS_DIR = path.resolve(process.cwd(), "security-reports");
const MAX_FINDINGS_PER_TOOL = 10;
const ALLOWED_RISKS = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW", "PASS"]);

function log(message, ...args) {
  console.log(`[ai-security-analysis] ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`[ai-security-analysis] ${message}`, ...args);
}

function readJsonFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    warn(`${label} not found at ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    warn(`Failed to parse ${label} at ${filePath}: ${error.message}`);
    return null;
  }
}

function walkDirectory(directoryPath, visitor) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(fullPath, visitor);
      continue;
    }

    visitor(fullPath, entry.name);
  }
}

function findFiles(directoryPath, predicate) {
  const matches = [];

  walkDirectory(directoryPath, (fullPath, fileName) => {
    if (predicate(fullPath, fileName)) {
      matches.push(fullPath);
    }
  });

  return matches;
}

function normalizeSeverity(value, fallback = "LOW") {
  const severity = String(value || fallback).toUpperCase();

  if (severity === "ERROR" || severity === "HIGH") return "HIGH";
  if (
    severity === "WARNING" ||
    severity === "MEDIUM" ||
    severity === "MODERATE"
  )
    return "MEDIUM";
  if (
    severity === "NOTE" ||
    severity === "INFO" ||
    severity === "INFORMATIONAL"
  )
    return "LOW";
  if (severity === "CRITICAL") return "CRITICAL";
  if (severity === "LOW") return "LOW";

  return fallback;
}

function severityRank(severity) {
  switch (normalizeSeverity(severity)) {
    case "CRITICAL":
      return 5;
    case "HIGH":
      return 4;
    case "MEDIUM":
      return 3;
    case "LOW":
      return 2;
    default:
      return 1;
  }
}

function sortFindings(findings) {
  return [...findings].sort((left, right) => {
    const severityDelta =
      severityRank(right.severity) - severityRank(left.severity);

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return String(left.title || "").localeCompare(String(right.title || ""));
  });
}

function extractTrivyFindings(report) {
  const findings = [];

  const results = Array.isArray(report?.Results) ? report.Results : [];
  for (const result of results) {
    const vulnerabilities = Array.isArray(result?.Vulnerabilities)
      ? result.Vulnerabilities
      : [];

    for (const vulnerability of vulnerabilities) {
      findings.push({
        vulnerabilityId: vulnerability?.VulnerabilityID || "Unknown",
        severity: normalizeSeverity(vulnerability?.Severity, "LOW"),
        package: vulnerability?.PkgName || result?.Target || "Unknown",
        installedVersion: vulnerability?.InstalledVersion || "Unknown",
        fixedVersion: vulnerability?.FixedVersion || "Unknown",
        description: vulnerability?.Description || "No description provided.",
      });
    }
  }

  return sortFindings(findings).slice(0, MAX_FINDINGS_PER_TOOL);
}

function extractSarifToolName(report) {
  const runs = Array.isArray(report?.runs) ? report.runs : [];

  for (const run of runs) {
    const toolName =
      run?.tool?.driver?.name || run?.tool?.driver?.fullName || "";
    if (toolName) {
      return String(toolName).toLowerCase();
    }
  }

  return "";
}

function extractSemgrepFindings(report) {
  const toolName = extractSarifToolName(report);

  if (toolName && !toolName.includes("semgrep")) {
    warn(`Skipping SARIF report because it is not Semgrep output: ${toolName}`);
    return [];
  }

  const findings = [];
  const runs = Array.isArray(report?.runs) ? report.runs : [];

  for (const run of runs) {
    const sarifResults = Array.isArray(run?.results) ? run.results : [];

    for (const result of sarifResults) {
      const location = result?.locations?.[0]?.physicalLocation || {};
      const region = location?.region || {};

      findings.push({
        ruleId: result?.ruleId || result?.rule?.id || "Unknown",
        severity: normalizeSeverity(
          result?.properties?.severity || result?.level || "LOW",
          "LOW",
        ),
        file: location?.artifactLocation?.uri || "Unknown",
        line: region?.startLine || region?.endLine || "Unknown",
        message: result?.message?.text || "No message provided.",
      });
    }
  }

  return sortFindings(findings).slice(0, MAX_FINDINGS_PER_TOOL);
}

function collectFindings() {
  const trivyReportPath = findFiles(
    SECURITY_REPORTS_DIR,
    (fullPath, fileName) => fileName === "trivy-results.json",
  )[0];
  const semgrepReportPath =
    findFiles(
      SECURITY_REPORTS_DIR,
      (fullPath, fileName) => fileName === "semgrep-results.sarif",
    )[0] ||
    findFiles(
      SECURITY_REPORTS_DIR,
      (fullPath, fileName) => fileName === "results.sarif",
    )[0];

  const trivyReport = trivyReportPath
    ? readJsonFile(trivyReportPath, "Trivy report")
    : null;
  const semgrepReport = semgrepReportPath
    ? readJsonFile(semgrepReportPath, "Semgrep SARIF report")
    : null;

  const trivyFindings = trivyReport ? extractTrivyFindings(trivyReport) : [];
  const semgrepFindings = semgrepReport
    ? extractSemgrepFindings(semgrepReport)
    : [];

  log(
    `Loaded ${trivyFindings.length} Trivy findings and ${semgrepFindings.length} Semgrep findings.`,
  );

  return { trivyFindings, semgrepFindings };
}

function summarizeFindings(trivyFindings, semgrepFindings) {
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const finding of [...trivyFindings, ...semgrepFindings]) {
    const severity = normalizeSeverity(finding.severity, "LOW");
    if (counts[severity] !== undefined) {
      counts[severity] += 1;
    }
  }

  return counts;
}

function computeFallbackAnalysis(trivyFindings, semgrepFindings) {
  const counts = summarizeFindings(trivyFindings, semgrepFindings);
  const combinedFindings = [
    ...trivyFindings.map((finding) => ({
      title: `${finding.vulnerabilityId} in ${finding.package}`,
      severity: finding.severity,
      detail: `${finding.package} ${finding.installedVersion} -> ${finding.fixedVersion}`,
    })),
    ...semgrepFindings.map((finding) => ({
      title: `${finding.ruleId} in ${finding.file}`,
      severity: finding.severity,
      detail: `Line ${finding.line}: ${finding.message}`,
    })),
  ];

  const orderedFindings = sortFindings(combinedFindings).slice(0, 5);
  const highestSeverity =
    orderedFindings[0]?.severity ||
    (counts.CRITICAL
      ? "CRITICAL"
      : counts.HIGH
        ? "HIGH"
        : counts.MEDIUM
          ? "MEDIUM"
          : counts.LOW
            ? "LOW"
            : "PASS");

  return {
    overallRisk: ALLOWED_RISKS.has(highestSeverity) ? highestSeverity : "PASS",
    blockDeployment: false,
    summary: orderedFindings.length
      ? `Fallback analysis reviewed ${trivyFindings.length} Trivy findings and ${semgrepFindings.length} Semgrep findings. Highest observed severity: ${highestSeverity}.`
      : "No security findings were available for analysis.",
    topFindings: orderedFindings.map(
      (finding) => `${finding.title} - ${finding.detail}`,
    ),
    recommendation: orderedFindings.length
      ? "Review the highest severity findings before merging or deploying."
      : "No action required. Security artifact analysis completed successfully.",
  };
}

async function analyzeWithOpenAI(trivyFindings, semgrepFindings) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    warn("OPENAI_API_KEY is missing; using fallback analysis.");
    return computeFallbackAnalysis(trivyFindings, semgrepFindings);
  }

  const client = new OpenAI({ apiKey });
  const systemPrompt = [
    "You are a security review assistant.",
    "Return ONLY valid JSON with this exact schema:",
    '{"overallRisk":"CRITICAL|HIGH|MEDIUM|LOW|PASS","blockDeployment":true,"summary":"","topFindings":[],"recommendation":""}',
    "Do not include markdown, code fences, or any extra keys.",
  ].join(" ");

  const userPrompt = JSON.stringify(
    {
      repository: process.env.GITHUB_REPOSITORY || "unknown",
      commitSha: process.env.GITHUB_SHA || "unknown",
      trivyFindings,
      semgrepFindings,
    },
    null,
    2,
  );

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = JSON.parse(content);
    return sanitizeAnalysis(parsed, trivyFindings, semgrepFindings);
  } catch (error) {
    warn(
      `OpenAI analysis failed; falling back to deterministic analysis: ${error.message}`,
    );
    return computeFallbackAnalysis(trivyFindings, semgrepFindings);
  }
}

function sanitizeAnalysis(analysis, trivyFindings, semgrepFindings) {
  const fallback = computeFallbackAnalysis(trivyFindings, semgrepFindings);
  const overallRisk = ALLOWED_RISKS.has(
    String(analysis?.overallRisk || "").toUpperCase(),
  )
    ? String(analysis.overallRisk).toUpperCase()
    : fallback.overallRisk;

  const topFindings = Array.isArray(analysis?.topFindings)
    ? analysis.topFindings
        .filter(
          (finding) => typeof finding === "string" && finding.trim().length > 0,
        )
        .slice(0, 10)
    : fallback.topFindings;

  const summary =
    typeof analysis?.summary === "string" && analysis.summary.trim().length > 0
      ? analysis.summary.trim()
      : fallback.summary;

  const recommendation =
    typeof analysis?.recommendation === "string" &&
    analysis.recommendation.trim().length > 0
      ? analysis.recommendation.trim()
      : fallback.recommendation;

  const blockDeployment = Boolean(analysis?.blockDeployment);

  return {
    overallRisk,
    blockDeployment,
    summary,
    topFindings,
    recommendation,
  };
}

function getRiskColor(overallRisk) {
  switch (overallRisk) {
    case "CRITICAL":
      return "#dc2626";
    case "HIGH":
      return "#ea580c";
    case "MEDIUM":
      return "#ca8a04";
    case "LOW":
    case "PASS":
    default:
      return "#16a34a";
  }
}

function formatList(items, emptyMessage) {
  if (!items.length) {
    return emptyMessage;
  }

  return items.map((item) => `• ${item}`).join("\n");
}

function buildSlackMessage(analysis) {
  const repository = process.env.GITHUB_REPOSITORY || "unknown/repository";
  const commitSha = process.env.GITHUB_SHA || "unknown";
  const commitUrl = `https://github.com/${repository}/commit/${commitSha}`;
  const pullRequestUrl = process.env.PR_URL || "";
  const deploymentRecommendation = analysis.blockDeployment
    ? "Block deployment recommended by AI, but deployment is not automatically blocked."
    : "Deployment is not blocked by the AI analysis layer.";

  const headerText = `AI Security Analysis: ${analysis.overallRisk}`;
  const topFindingsText = formatList(
    analysis.topFindings,
    "• No top findings were highlighted by the model.",
  );

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: headerText,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Risk Level*\n${analysis.overallRisk}`,
        },
        {
          type: "mrkdwn",
          text: `*Deployment Recommendation*\n${deploymentRecommendation}`,
        },
        {
          type: "mrkdwn",
          text: `*Repository*\n${repository}`,
        },
        {
          type: "mrkdwn",
          text: `*Commit SHA*\n${commitSha}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary*\n${analysis.summary}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top Findings*\n${topFindingsText}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Remediation Steps*\n${analysis.recommendation}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Recommendation*\n${analysis.recommendation}`,
      },
    },
  ];

  if (pullRequestUrl) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Pull request: <${pullRequestUrl}|Open PR>`,
        },
      ],
    });
  }

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "View Commit",
        },
        url: commitUrl,
      },
    ],
  });

  return {
    attachments: [
      {
        color: getRiskColor(analysis.overallRisk),
        blocks,
      },
    ],
    text: `${headerText} - ${analysis.summary}`,
  };
}

async function sendSlackReport(analysis) {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;

  if (!slackBotToken || !slackChannelId) {
    warn("Slack configuration is incomplete; skipping Slack notification.");
    return;
  }

  const client = new WebClient(slackBotToken);

  try {
    await client.chat.postMessage({
      channel: slackChannelId,
      ...buildSlackMessage(analysis),
    });

    log("Slack notification sent.");
  } catch (error) {
    warn(`Slack notification failed: ${error.message}`);
  }
}

async function main() {
  log(`Reading security reports from ${SECURITY_REPORTS_DIR}`);

  const { trivyFindings, semgrepFindings } = collectFindings();
  const analysis = await analyzeWithOpenAI(trivyFindings, semgrepFindings);

  if (analysis.blockDeployment === true) {
    warn(
      "AI recommends blocking deployment, but deployment is not automatically blocked.",
    );
  }

  log(`Final risk level: ${analysis.overallRisk}`);
  log(`Summary: ${analysis.summary}`);

  await sendSlackReport(analysis);
}

main().catch((error) => {
  warn(`Unexpected error in AI security analysis: ${error.message}`);
});
