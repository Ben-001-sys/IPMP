# IPMP Project Overview

## Project Name

Inventory & Pricing Management Platform (IPMP)

---

# Purpose

IPMP is an internal business management platform designed to centralize and streamline the operational workflows of multiple business departments.

The system replaces spreadsheet-driven processes with a structured workflow-driven platform that provides traceability, accountability, auditability, and operational visibility across the organization.

The platform manages the complete lifecycle of products from the moment they are requested until they are sold to customers.

The system acts as a single source of truth for product, procurement, inventory, pricing, and operational data.

---

# Business Objectives

The primary goals of IPMP are:

* Centralize business operations.
* Improve inter-department collaboration.
* Provide complete product traceability.
* Improve procurement efficiency.
* Improve inventory accuracy.
* Standardize approval workflows.
* Support financial reporting and profitability analysis.
* Enable AI-assisted merchandising and marketing.
* Reduce manual spreadsheet usage.

---

# Core Departments

The system supports multiple departments working together through shared workflows.

## Procurement

Responsible for:

* Product sourcing
* Supplier management
* Purchase planning
* Purchasing execution
* Acquisition tracking

## Warehouse Inventory

Responsible for:

* Goods receiving
* Inventory verification
* Inventory management
* Stock allocation
* Inventory reconciliation

## Merchandising

Responsible for:

* Product enrichment
* Product specifications
* Product attributes
* Product images
* Product categorization

## Marketing

Responsible for:

* Product content generation
* Promotional content
* Marketing campaigns
* Product visibility

## Sales

Responsible for:

* Product sales
* Revenue generation
* Demand visibility

## Customer Experience & Support

Responsible for:

* Customer requests
* Customer feedback
* Product demand insights

## Finance

Responsible for:

* Cost tracking
* Revenue tracking
* Profitability analysis
* Financial reporting

## Administration

Responsible for:

* User management
* Permissions
* System configuration
* Governance

---

# Product Lifecycle

The central concept of IPMP is the Product Lifecycle.

Every item requested within the system creates a Product.

A product begins in its earliest stage as a request and gradually matures as departments contribute information throughout its lifecycle.

Departments do not create separate products.

Departments enrich the same product over time.

Examples of lifecycle contributions include:

* Request information
* Procurement information
* Supplier data
* Purchase details
* Acquisition records
* Verification records
* Inventory information
* Product specifications
* Product attributes
* Images
* Pricing
* Marketing content

A product is considered sale-ready only after merchandising requirements have been completed.

This lifecycle model provides complete traceability from request to sale.

---

# Core Procurement Workflow

The procurement workflow consists of four major stages:

## Requested Items (RI)

Entry point for products entering the system.

Sources include:

* Internal departments
* POS integrations
* E-commerce integrations
* Supplier integrations
* Manual requests

## Purchase List (PL)

Staging area for procurement review.

Items are evaluated and prepared for purchasing.

## Purchase Order (PO)

Formal procurement document.

Supports:

* Draft workflow
* Multi-department review
* Approval tracking
* Disagreement management
* Purchasing execution

## Acquired List (AL)

Represents actual purchased items and quantities.

Acts as the handoff point to Warehouse Inventory.

---

# Warehouse Verification Workflow

The warehouse workflow validates acquired inventory.

## Awaiting Verification (AV)

Acquired items awaiting verification.

Warehouse staff verify:

* Product identity
* Quantity
* Condition
* Specifications

## Goods Received List (GRL)

Official record of verified inventory.

Only verified quantities are considered valid stock.

The GRL serves as the organization's inventory source of truth.

---

# Merchandising Workflow

After inventory verification:

Merchandising staff enrich products with:

* Specifications
* Attributes
* Product details
* Product images
* Product categories
* Product descriptions

The system supports AI-assisted content generation using merchandising data.

Products become sale-ready after merchandising completion.

---

# Key Architectural Principles

## Product as the Master Entity

A Product is the primary business entity.

Departments enrich products throughout their lifecycle.

Products are not recreated between workflows.

## Single Source of Truth

Information should exist in one authoritative location.

Duplicate business records should be avoided.

## Workflow Traceability

Every workflow action must be traceable.

Users, timestamps, comments, approvals, and changes must be recorded.

## Auditability

Business-critical actions must be auditable.

Historical records must be preserved.

## Department Accountability

Actions are associated with departments and users.

Ownership must always be clear.

## Permission-Based Access

Users may only perform actions allowed by their role and department.

---

# System Requirements

The platform must preserve:

* Product lifecycle integrity
* Workflow traceability
* Audit history
* Approval history
* Inventory accuracy
* Financial accountability
* Department ownership
* Permission enforcement

These principles should guide all architecture, development, and operational decisions.

---

# Technology Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
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

# Success Criteria

IPMP is successful when:

* Product information remains traceable from request to sale.
* Departments operate through standardized workflows.
* Inventory accuracy improves.
* Procurement activities are auditable.
* Financial reporting is reliable.
* Operational visibility increases across the organization.
* Manual spreadsheet processes are eliminated or significantly reduced.
