# IPMP - Project Overview

## Project Name

Inventory & Pricing Management Platform (IPMP)

---

# Purpose

IPMP is a business operations platform designed to manage the complete lifecycle of products across multiple departments.

The system centralizes procurement, inventory, merchandising, pricing, sales support, and operational workflows into a single source of truth.

Its primary objective is to improve collaboration, accountability, traceability, and operational efficiency throughout the organization.

---

# Business Vision

Every item requested within the system represents the creation of a Product.

A Product begins its lifecycle when it is requested and matures as different departments contribute information, decisions, approvals, inventory records, pricing, and merchandising content.

Departments do not create separate products.

Departments enrich the same Product throughout its lifecycle.

The Product remains the primary business entity from initial request through procurement, inventory verification, merchandising, and eventual sale.

---

# Core Departments

The system currently supports:

* Procurement
* Warehouse Inventory
* Merchandising
* Marketing
* Sales
* Customer Experience & Support
* Finance
* Administration

Additional departments may be added as the platform evolves.

---

# Product Lifecycle

A Product progresses through multiple business stages:

Requested Item (RI)

↓

Purchase List (PL)

↓

Purchase Order (PO)

↓

Acquired List (AL)

↓

Awaiting Verification (AV)

↓

Goods Received List (GRL)

↓

Merchandising

↓

Marketing

↓

Sales Ready

Throughout this lifecycle, the Product accumulates information from different departments while maintaining a single identity and complete historical traceability.

---

# Procurement Workflow

## Requested Items (RI)

The entry point for products entering the system.

Sources include:

* Department requests
* POS low-stock triggers
* POS out-of-stock triggers
* E-commerce inventory triggers
* Supplier API recommendations
* Manual requests

Each request creates or references a Product and records:

* Source
* Request reason
* Requesting department
* Creation date
* Lifecycle status

---

## Purchase List (PL)

Procurement review and staging area.

Procurement staff evaluate Requested Items and determine whether they should proceed toward purchasing.

Department-submitted requests may be automatically forwarded to the Purchase List according to business rules.

---

## Purchase Order (PO)

Formal purchasing workflow.

Supports:

* Draft status
* Pending Review status
* Multi-department review
* Disagreements and recommendations
* Purchasing execution
* Audit history

Review participants include:

* Procurement Manager
* Marketing Manager
* Sales Manager
* Customer Experience Manager

All comments, disagreements, responses, and decisions must remain permanently traceable.

---

## Acquired List (AL)

Represents the actual items and quantities acquired during purchasing.

The Acquired List becomes the handoff point to Warehouse Inventory for verification.

---

# Warehouse Verification Workflow

## Awaiting Verification (AV)

Warehouse Inventory receives:

* Acquired List
* Physical inventory

Warehouse staff verify:

* Product identity
* Quantity
* Condition
* Specifications
* Delivery accuracy

---

## Goods Received List (GRL)

Represents officially verified inventory.

Only verified quantities are considered valid inventory.

The GRL serves as the organization's inventory source of truth.

---

# Merchandising Workflow

Merchandising enriches Products after inventory verification.

Responsibilities include:

* Product details
* Specifications
* Attributes
* Images
* Categories
* Documentation
* Product descriptions

Products become sales-ready after required merchandising information has been completed.

---

# AI Capabilities

The platform supports AI-assisted content generation.

AI may generate:

* Product descriptions
* Product tags
* Marketing content
* Promotional content
* Blog content

Generated content depends on the quality and completeness of product information maintained by the business.

---

# Finance & Pricing

The platform supports:

* Procurement cost tracking
* Inventory valuation
* Revenue reporting
* Profitability analysis
* Margin calculations
* Pricing management

Financial records must remain auditable and traceable.

---

# Core Principles

## Product Is The Master Entity

The Product is the primary business object within the system.

All departments contribute to the Product lifecycle.

---

## Single Source of Truth

Business information should exist in one authoritative location.

Avoid duplicate records and conflicting data.

---

## Traceability

All actions must be traceable from request through sale.

Historical records must be preserved.

---

## Auditability

Business-critical actions must maintain:

* User attribution
* Department attribution
* Timestamps
* Comments
* Approvals
* Disagreements
* Responses

---

## Permission-Based Access

Users may only perform actions allowed by their assigned roles and departments.

---

## Department Accountability

Ownership and responsibility for actions must always be clear.

---

# Technology Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* AG Grid
* TanStack Query

Backend:

* NestJS
* Prisma
* PostgreSQL

Infrastructure:

* Docker
* GitHub Actions
* Staging Environment
* Production Environment

---

# Non-Negotiable Rules

The system must preserve:

* Product lifecycle integrity
* Workflow traceability
* Audit history
* Approval history
* Inventory accuracy
* Financial accountability
* Permission enforcement
* Department ownership
* Historical records

No feature, workflow, or architectural change should violate these principles.
