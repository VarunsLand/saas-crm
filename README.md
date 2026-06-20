# SaaS CRM

## Project Overview

**What it is:** A comprehensive, modern Software as a Service Customer Relationship Management (SaaS CRM) platform designed to track the full lifecycle of a client—from initial lead to paying customer.

**Target Users:** Small to medium business owners, sales teams, and service providers who need a fast, intuitive system to manage their pipeline and financials without the bloat of legacy CRMs.

**Core Purpose:** To provide a single source of truth for leads, customers, communications, and financial tracking (revenue and expenses), enabling businesses to turn prospects into profits efficiently.

**Key Business Workflows:**
- Lead Capture & Pipeline Management
- Conversion (Lead → Customer)
- Financial Tracking (Revenue logging & Expense tracking)
- Task & Follow-up Scheduling
- 360° Customer Journey Activity Logging

## Feature Inventory

### 1. Authentication
- **Purpose:** Secure multi-tenant access to the CRM.
- **Main Pages:** `/login`, `/register`
- **Main APIs:** `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Database Models Used:** `User`, `Tenant`

### 2. Leads Management & Pipeline
- **Purpose:** Track potential clients through a customizable Kanban board.
- **Main Pages:** `/leads`, `/pipeline`, `/leads/[id]`
- **Main APIs:** `GET /api/v1/leads`, `POST /api/v1/leads`, `PATCH /api/v1/leads/:id`
- **Database Models Used:** `Lead`, `LeadSource`

### 3. Customers
- **Purpose:** Manage active, paying clients who have converted from leads.
- **Main Pages:** `/customers`, `/customers/[id]`
- **Main APIs:** `GET /api/v1/customers`, `POST /api/v1/customers`
- **Database Models Used:** `Customer`

### 4. Financials (Revenue & Expenses)
- **Purpose:** Track lifetime value (LTV), operational costs, and profitability.
- **Main Pages:** `/revenue`, `/expenses`
- **Main APIs:** `GET /api/v1/revenue`, `GET /api/v1/expenses`
- **Database Models Used:** `RevenueEntry`, `ExpenseEntry`

### 5. Dashboard & Analytics
- **Purpose:** High-level metrics, charts, and Key Performance Indicators.
- **Main Pages:** `/` (Dashboard)
- **Main APIs:** `/api/v1/financial/kpi`, `/api/v1/financial/charts`
- **Database Models Used:** Aggregates across `Lead`, `Customer`, `RevenueEntry`, `ExpenseEntry`

### 6. Tasks & Action Center
- **Purpose:** Keep track of follow-ups, calls, and meetings.
- **Main Pages:** `/tasks`
- **Main APIs:** `GET /api/v1/tasks`, `POST /api/v1/tasks`
- **Database Models Used:** `FollowUpTask`

### 7. Customer 360 & Timeline
- **Purpose:** Provide a chronological feed of every interaction a customer has had.
- **Main Pages:** `/customers/[id]`, `/leads/[id]`
- **Main APIs:** Built into `GET /api/v1/customers/:id` and `/api/v1/leads/:id`
- **Database Models Used:** `Interaction`, `FollowUpTask`

### 8. Global Search
- **Purpose:** Cmd+K style search to instantly jump to any record.
- **Main Pages:** Global Modal
- **Main APIs:** `GET /api/v1/search`
- **Database Models Used:** `Lead`, `Customer`, `FollowUpTask`, `Interaction`
