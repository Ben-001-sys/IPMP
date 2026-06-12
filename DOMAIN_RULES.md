# IPMP Domain Rules

## Purpose

This document defines the business rules, domain constraints, and invariants that must be preserved throughout the Inventory & Pricing Management Platform (IPMP).

These rules take precedence over implementation convenience.

Any proposed change that violates these rules requires explicit architectural review and approval.

---

# Core Domain Principle

## Product Is The Master Entity

A Product is the primary business entity within IPMP.

Every item requested creates or references a Product.

Departments do not create separate products.

Departments enrich the same Product throughout its lifecycle.

The Product remains the single source of truth from request through sale.

---

# Product Lifecycle Rules

Every Product progresses through a defined lifecycle.

Typical lifecycle stages include:

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

Lifecycle history must always remain traceable.

Lifecycle records must never be deleted.

---

# Traceability Rules

Every significant action must be traceable.

Actions must record:

- User
- Department
- Timestamp
- Action Type

Where applicable:

- Comment
- Reason
- Previous Value
- New Value

The system must allow auditors to understand:

- Who performed the action
- When it occurred
- Why it occurred

---

# Audit Rules

Audit history is mandatory.

Business-critical records must never be permanently removed.

Soft deletion should be preferred over hard deletion.

Historical decisions must remain visible.

Examples include:

- Purchase Order approvals
- Disagreements
- Rejections
- Inventory adjustments
- Pricing changes

---

# Department Ownership Rules

Every business action belongs to:

- A User
- A Department

Department ownership must always be identifiable.

Ownership must not be lost during workflow transitions.

---

# Procurement Rules

## Requested Items (RI)

Every Requested Item must record:

- Source
- Request Reason
- Requesting Department
- Created Date

Allowed sources include:

- Department Request
- POS Integration
- E-commerce Integration
- Supplier Integration
- Manual Entry

---

## Purchase List (PL)

A Purchase List item must reference its originating request.

Origin information must never be lost.

---

## Purchase Order (PO)

Purchase Orders support:

- Draft
- Pending Review
- Published
- In Progress
- Completed

Additional statuses may be added through approved ADRs.

---

## Pending Review Rules

Once a Purchase Order enters Pending Review:

New items cannot be added.

Only the following modifications are allowed:

- Quantity corrections
- Item rejection

---

## Review Rules

Reviewers may:

- Approve
- Disagree
- Comment
- Recommend

Disagreements require a reason.

---

## Publishing Rules

If a disagreement exists:

The Procurement Manager must provide a response before publishing.

Unanswered disagreements block publication.

---

## Rejected Item Rules

Rejected items must remain visible.

Associated data must be preserved:

- Comments
- Disagreements
- Responses
- Reasons
- Timestamps
- Authors

Rejected history must never be deleted.

---

# Acquisition Rules

Actual purchasing outcomes must be recorded.

Examples:

- Actual Quantity
- Actual Cost
- Supplier Used
- Availability Issues
- Alternative Products
- Purchasing Notes

Acquired Lists represent actual acquisitions, not planned purchases.

---

# Inventory Verification Rules

Warehouse Inventory verifies acquired products.

Verification must record:

- Expected Quantity
- Received Quantity
- Condition
- Discrepancies
- Notes

---

## Goods Received List Rules

Only verified quantities become inventory.

Unverified inventory must never affect stock levels.

GRL is the inventory source of truth.

---

# Merchandising Rules

Products become sales-ready only after merchandising requirements are completed.

Merchandising may maintain:

- Product Details
- Specifications
- Attributes
- Categories
- Images
- Documentation

---

# Pricing Rules

Pricing changes must remain auditable.

The system must preserve:

- Previous Price
- New Price
- User
- Timestamp
- Reason

Historical pricing data must not be lost.

---

# Permission Rules

Users may only perform actions permitted by:

- Role
- Department

Permission checks must be enforced server-side.

Client-side permissions alone are insufficient.

---

# Data Integrity Rules

Duplicate business entities should be avoided.

A Product should not be recreated simply because it enters a new workflow stage.

Relationships must preserve lineage.

Lineage must remain reconstructable.

---

# AI Rules

AI-generated content is supplemental.

AI must never replace:

- Approval decisions
- Audit records
- Financial records
- Inventory verification

Human users remain accountable for business decisions.

---

# Non-Negotiable Invariants

The following must never be violated:

1. Product remains the master entity.
2. Audit history is preserved.
3. Workflow history is preserved.
4. Department ownership is preserved.
5. User attribution is preserved.
6. Inventory is based on verified quantities.
7. Approval history is preserved.
8. Financial changes remain auditable.
9. Permission enforcement remains intact.
10. Product lineage remains traceable.