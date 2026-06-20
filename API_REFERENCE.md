# API Reference

All endpoints are prefixed with `/api/v1` and require a Bearer token in the `Authorization` header, except for auth routes.

## Auth
- **POST `/api/v1/auth/login`**: Authenticate user and return JWT.
- **GET `/api/v1/auth/me`**: Fetch current logged-in user profile.

## Leads
- **GET `/api/v1/leads`**: Retrieve all leads. Supports query params: `status`, `search`.
- **POST `/api/v1/leads`**: Create a new lead.
- **GET `/api/v1/leads/:id`**: Fetch a single lead along with interactions and tasks.
- **PATCH `/api/v1/leads/:id`**: Update lead details or status.
- **DELETE `/api/v1/leads/:id`**: Soft delete a lead.

## Customers
- **GET `/api/v1/customers`**: Retrieve all customers.
- **POST `/api/v1/customers`**: Create a new customer directly.
- **GET `/api/v1/customers/:id`**: Fetch customer timeline, revenue, and source lead data.
- **PATCH `/api/v1/customers/:id`**: Update customer details.

## Notes (Interactions)
- **GET `/api/v1/notes`**: Retrieve notes (filtered by `lead_id` or `customer_id`).
- **POST `/api/v1/notes`**: Create a note attached to a lead or customer.

## Tasks
- **GET `/api/v1/tasks`**: Retrieve tasks. Supports `filter` (ALL, TODAY, OVERDUE, UPCOMING).
- **POST `/api/v1/tasks`**: Create a task attached to a lead or customer.
- **PATCH `/api/v1/tasks/:id/status`**: Mark task as PENDING or COMPLETED.

## Financials
- **GET `/api/v1/revenue`**: Get all revenue entries.
- **POST `/api/v1/revenue`**: Add a revenue entry for a customer.
- **GET `/api/v1/expenses`**: Get all expense entries.
- **POST `/api/v1/expenses`**: Add an expense entry.
- **GET `/api/v1/financial/kpi`**: Get high-level stats (Total Revenue, Pipeline Value).
- **GET `/api/v1/financial/charts`**: Get revenue/expense trend data for charts.

## Search
- **GET `/api/v1/search?q=term`**: Global cross-table search returning standardized results.
