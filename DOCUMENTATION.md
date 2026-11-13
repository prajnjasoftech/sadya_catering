# SadyaCatering - Catering Management System

A comprehensive catering management application for managing Sadya (traditional Kerala feast) bookings, customers, menu items, expenses, purchases, and payments.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Features](#features)
8. [Authentication](#authentication)
9. [Configuration](#configuration)
10. [Development Setup](#development-setup)

---

## Overview

SadyaCatering is a full-stack application designed for catering businesses to manage:
- Customer information and history
- Sadya packages with customizable menu items
- Booking management with status tracking
- Expense and purchase tracking with partial payments
- Payment recording for both bookings and expenses
- Financial reports and cash flow analysis
- Business settings and customization

---

## Tech Stack

### Backend
- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: SQLite
- **Authentication**: Laravel Sanctum (token-based)
- **API**: RESTful JSON API

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Custom CSS

---

## Project Structure

```
SadyaCatering/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   │           ├── AuthController.php
│   │   │           ├── BookingController.php
│   │   │           ├── DashboardController.php
│   │   │           ├── ExpensePaymentController.php
│   │   │           ├── PaymentHistoryController.php
│   │   │           └── ResourceController.php
│   │   └── Models/
│   │       ├── Booking.php
│   │       ├── BookingMenuItem.php
│   │       ├── Customer.php
│   │       ├── Expense.php
│   │       ├── ExpenseCategory.php
│   │       ├── ExpenseItem.php
│   │       ├── ExpensePayment.php
│   │       ├── FunctionType.php
│   │       ├── MenuCategory.php
│   │       ├── MenuItem.php
│   │       ├── Payment.php
│   │       ├── PurchaseType.php
│   │       ├── SadyaPackage.php
│   │       ├── Setting.php
│   │       ├── Supplier.php
│   │       └── User.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   │   └── DatabaseSeeder.php
│   │   └── database.sqlite
│   └── routes/
│       └── api.php
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api.js             # Axios configuration
│   │   ├── App.jsx            # Main application
│   │   ├── CashFlowReports.jsx
│   │   ├── index.css          # Global styles
│   │   ├── main.jsx           # Entry point
│   │   ├── PaymentHistory.jsx
│   │   └── session.js         # Session management
│   ├── index.html
│   └── vite.config.js
│
└── DOCUMENTATION.md           # This file
```

---

## Database Schema

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | User's full name |
| email | string | Login email (unique) |
| password | string | Hashed password |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Customers
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Customer name |
| mobile | string(20) | Primary mobile number |
| alternate_mobile | string(20) | Secondary mobile |
| email | string | Email address |
| place | string | City/town |
| address | text | Full address |
| notes | text | Additional notes |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Menu Categories
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Category name (e.g., Main, Curry, Payasam) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Menu Items
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Dish name (unique) |
| category | string | Category (Main, Curry, etc.) |
| description | text | Dish description |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Sadya Packages
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Package name |
| price_per_leaf | decimal | Price per serving |
| description | text | Package description |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

**Relationships**: Many-to-many with Menu Items via `menu_item_sadya_package` pivot table.

### Bookings
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| booking_number | string | Unique booking reference (e.g., SC-2411-0001) |
| customer_id | foreign key | Reference to customers |
| sadya_package_id | foreign key | Reference to sadya_packages |
| function_type | string | Type of event (Wedding, Housewarming, etc.) |
| function_date | date | Event date |
| serving_time | time | Serving time |
| venue | string | Event venue |
| guest_count | integer | Number of guests |
| price_per_leaf | decimal | Price per leaf at booking time |
| base_amount | decimal | guest_count × price_per_leaf |
| additional_charges | decimal | Extra charges |
| discount | decimal | Discount amount |
| final_amount | decimal | base_amount + additional_charges - discount |
| status | string | Enquiry, Confirmed, Preparation, Completed, Cancelled |
| notes | text | Booking notes |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |
| deleted_at | timestamp | Soft delete timestamp (null if not deleted) |

**Computed Attributes** (via Model Accessors):
- `paid_amount`: Sum of incoming payments minus refunds
- `balance_amount`: final_amount - paid_amount
- `estimated_profit`: final_amount - related expenses

**Soft Deletes**: Bookings use soft deletes. Deleted bookings are hidden but preserved in the database.

### Booking Menu Items
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| booking_id | foreign key | Reference to bookings |
| menu_item_id | foreign key | Reference to menu_items |
| dish_name | string | Dish name (snapshot) |
| included | boolean | Whether included in package |
| extra_charge | decimal | Additional charge for this item |

### Payments (Booking Payments)
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| booking_id | foreign key | Reference to bookings |
| payment_date | date | Payment date |
| amount | decimal | Payment amount |
| direction | string(3) | 'in' for income, 'out' for refund |
| payment_mode | string | Cash, UPI, Bank Transfer, Card, Other |
| payment_type | string | Advance, Part Payment, Final Payment, Refund |
| reference_number | string | Transaction reference |
| notes | text | Payment notes |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Function Types
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Function type name (Wedding, Reception, etc.) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Expense Categories
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Category name (Purchase, Labour, Transport, etc.) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Suppliers
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Supplier name |
| mobile | string(20) | Contact number |
| address | text | Supplier address |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Purchase Types
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | string | Purchase item name (e.g., Matta Rice, Coconut Oil) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Expenses
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| date | date | Expense date |
| expense_type | string | Type (Purchase, Labour, Transport, etc.) |
| expense_category_id | foreign key | Reference to expense_categories |
| booking_id | foreign key | Optional reference to bookings |
| supplier_id | foreign key | Optional reference to suppliers |
| description | text | Expense description |
| amount | decimal | Total amount |
| paid_to | string | Payee name |
| payment_method | string | Payment method used |
| item_name | string | For purchases: item name |
| quantity | decimal | For purchases: quantity |
| unit | string | For purchases: unit (Kg, L, etc.) |
| rate | decimal | For purchases: rate per unit |
| invoice_number | string | Supplier invoice/bill number |
| notes | text | Additional notes |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

**Computed Attributes** (via Model Accessors):
- `paid_amount`: Sum of all expense payments
- `balance_amount`: amount - paid_amount

### Expense Payments
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| expense_id | foreign key | Reference to expenses |
| payment_date | date | Payment date |
| amount | decimal | Payment amount |
| payment_method | string | Payment method |
| reference_number | string | Transaction reference |
| notes | text | Payment notes |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Expense Items (Line Items)
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| expense_id | foreign key | Reference to expenses |
| item_name | string | Item description |
| amount | decimal | Item amount |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Settings
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| key | string | Setting key (unique) |
| value | text | Setting value |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

**Available Settings**:
- `business_name`: Business name displayed in UI
- `business_address`: Business address
- `business_phone`: Contact phone
- `business_email`: Contact email
- `gst_number`: GST registration number
- `default_serving_time`: Default serving time for bookings
- `idle_timeout`: Session idle timeout in minutes

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login with email/password, returns token |
| POST | `/api/logout` | Logout (invalidate token) |
| GET | `/api/user` | Get current authenticated user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings as key-value pairs |
| POST | `/api/settings` | Update settings (bulk update) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings (paginated) |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/{id}` | Get booking details |
| PUT | `/api/bookings/{id}` | Update booking |
| DELETE | `/api/bookings/{id}` | Delete booking |
| POST | `/api/bookings/{id}/cancel` | Cancel booking with optional refund |

**Cancel Booking Parameters**:
- `refund`: boolean - If true, creates a refund payment record (direction='out', payment_type='Refund')

**Booking Edit/Delete Restrictions**:
- Edit: Only allowed before function date
- Delete: Only allowed before function date AND no payments recorded

**Query Parameters for GET /api/bookings**:
- `search`: Search in booking_number, venue, function_type, customer name, customer mobile
- `status`: Filter by status (Enquiry, Confirmed, Preparation, Completed, Cancelled)
- `from`: Filter by function_date >= from
- `to`: Filter by function_date <= to
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 25)

### Generic Resources (via ResourceController)
The following resources share the same CRUD pattern:

| Resource | Endpoint Base | Description |
|----------|---------------|-------------|
| customers | `/api/customers` | Customer management |
| menu-items | `/api/menu-items` | Menu items (dishes) |
| packages | `/api/packages` | Sadya packages |
| expenses | `/api/expenses` | Expense records |
| payments | `/api/payments` | Booking payments |
| suppliers | `/api/suppliers` | Supplier management |
| purchase-types | `/api/purchase-types` | Purchase item types |
| expense-types | `/api/expense-types` | Expense categories |
| menu-categories | `/api/menu-categories` | Menu categories |
| function-types | `/api/function-types` | Booking function types |

**CRUD Operations**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{resource}` | List (paginated) |
| POST | `/api/{resource}` | Create new |
| GET | `/api/{resource}/{id}` | Get details |
| PUT | `/api/{resource}/{id}` | Update |
| DELETE | `/api/{resource}/{id}` | Delete |

**Search Functionality by Resource**:

All resources support pagination with `page` and `per_page` (default: 25) parameters.

| Resource | Search Fields |
|----------|---------------|
| customers | name, mobile |
| suppliers | name, mobile |
| menu-items | name, category |
| packages | name, description |
| payments | reference_number, payment_type, booking_number, customer name |
| purchase-types | name |
| expense-types | name |
| menu-categories | name |
| function-types | name |
| expenses | description, item_name, invoice_number, supplier name, expense items |

**Additional Expense Filters**:
- `expense_type`: Filter by expense type
- `paid_to`: Filter by payee name (partial match)
- `payment_status`: Filter by `pending` or `paid`
- `exclude_purchases`: Set to true to exclude Purchase type expenses
- `sort`: Sort by `date`, `expense_type`, or `paid_to`
- `direction`: Sort direction `asc` or `desc`

### Purchases (Special Endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/purchases` | Create purchase (expense with type=Purchase) |
| PUT | `/api/purchases/{id}` | Update purchase |

### Expense Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/{id}/payments` | Record payment for expense |
| DELETE | `/api/expenses/{id}/payments/{paymentId}` | Delete expense payment |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/cash-flow` | Cash flow report |
| GET | `/api/payment-history` | Payment history (all payments) |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/payees` | Get list of unique payee names |
| GET | `/api/menu-items/categories` | Get distinct menu categories |

---

## Frontend Components

### Main Application (`App.jsx`)

#### Layout Components
- **Login**: Authentication form with demo credentials
- **Shell**: Main application shell with sidebar navigation

#### Page Components
- **Dashboard**: Overview with statistics and charts
- **Bookings**: Booking list with search and pagination
- **BookingDetail**: Detailed booking view with payments and menu
- **CrudPage**: Generic CRUD page for resources
- **CustomerDetail**: Customer profile with booking history
- **Purchases**: Purchase management with supplier tracking
- **Reports**: Financial reports section
- **SettingsPage**: Business settings management

#### Form Components
- **BookingForm**: Create/edit booking with package selection
- **CrudForm**: Generic form for CRUD resources
- **PaymentForm**: Record booking payments
- **PurchaseForm**: Record purchases with supplier management
- **ExpensePaymentForm**: Record expense/purchase payments

#### Utility Components
- **Modal**: Reusable modal dialog
- **PageTop**: Page header with title and action button
- **Toolbar**: Search bar component
- **Stat**: Statistics card
- **Field**: Form field wrapper
- **Empty**: Empty state placeholder
- **BookingTable**: Reusable booking list table

### Additional Files
- **PaymentHistory.jsx**: Unified payment history view
- **CashFlowReports.jsx**: Cash flow analysis and reports
- **session.js**: Session management with idle timeout
- **api.js**: Axios instance with authentication interceptor

---

## Features

### 1. Customer Management
- Add/edit/delete customers
- Track customer contact information
- View customer booking history
- See total business value per customer
- Track pending payments per customer

### 2. Menu & Package Management
- Create menu items with categories
- Build Sadya packages with menu items
- Set pricing per leaf (serving)
- Dynamic category management with "+ Add new" option

### 3. Booking Management
- Create bookings with customer selection
- Edit bookings (future bookings only)
- Select package and customize menu
- Track booking status (Enquiry → Confirmed → Preparation → Completed)
- Auto-complete past bookings when viewed
- Cancel bookings with optional refund
- Calculate pricing with additional charges and discounts
- Link expenses to bookings for profit tracking
- Soft delete support (data preserved)
- Restrictions: Cannot edit/delete past bookings or bookings with payments

### 4. Payment Tracking
- Record payments for bookings (Advance, Part Payment, Final)
- Record payments for expenses/purchases
- Multiple payment modes (Cash, UPI, Bank Transfer, Card)
- Track outstanding balances
- Partial payment support

### 5. Expense Management
- Categorize expenses (Labour, Transport, Fuel, etc.)
- Track payees with autocomplete suggestions
- Link expenses to bookings
- Partial payment tracking
- Filter by type, payee, payment status

### 6. Purchase Management
- Dedicated purchase tracking (separate from general expenses)
- Supplier management with quick add
- Purchase item types with quick add
- Invoice/bill number tracking
- Quantity, unit, and rate tracking

### 7. Reports & Analytics
- Dashboard with key metrics
- Cash flow reports
- Payment history with filtering
- Income vs outgoing analysis
- Date range filtering

### 8. Settings
- Business name customization
- Contact information
- GST number
- Default values
- Idle timeout configuration

### 9. Session Management
- Token-based authentication
- Idle timeout with automatic logout
- Activity tracking
- Session persistence

### 10. Pagination
All listing pages support pagination:
- 25 items per page (default)
- Previous/Next navigation
- Page indicator
- Automatic page adjustment when data changes

---

## Authentication

### Login Flow
1. User submits email and password to `/api/login`
2. Server validates credentials and returns token + user data
3. Token stored in localStorage
4. Token sent in `Authorization: Bearer {token}` header for all API requests

### Session Management
- Idle timeout tracking (configurable in settings)
- Automatic logout on inactivity
- Logout reason displayed on login page

### Demo Credentials
```
Email: admin@sadyacatering.test
Password: password
```

---

## Configuration

### Backend Environment (`.env`)
```env
APP_NAME=SadyaCatering
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Frontend Environment
```javascript
// api.js - Base URL configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});
```

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

---

## Development Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend

# Install dependencies
composer install

# Create database
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed

# Start server
php artisan serve
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

---

## Validation Rules

### Customers
- `name`: Required
- `mobile`: Required, max 20 characters
- `email`: Optional, valid email format

### Menu Items
- `name`: Required, unique
- `category`: Required

### Packages
- `name`: Required
- `price_per_leaf`: Required, numeric, min 0
- `item_ids`: Optional array of menu item IDs

### Expenses
- `date`: Required, valid date
- `expense_type`: Required, string
- `description`: Required
- `amount`: Required, numeric, min 0
- `paid_to`: Required for non-purchase expenses
- `payment_method`: Optional

### Payments
- `booking_id`: Required, must exist
- `payment_date`: Required, valid date
- `amount`: Required, numeric, min 0.01, cannot exceed balance
- `payment_mode`: Required
- `payment_type`: Required

### Suppliers
- `name`: Required, max 255 characters
- `mobile`: Optional, max 20 characters

---

## Error Handling

### API Errors
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors (returns `errors` object)
  - Booking edit restriction: "Bookings cannot be edited on or after the function date."
  - Booking delete restriction (date): "Bookings cannot be deleted on or after the function date."
  - Booking delete restriction (payments): "Bookings with payments cannot be deleted."
  - Booking already cancelled: "Booking is already cancelled."
- `500 Server Error`: Internal server error

### Frontend Error Display
- Form validation errors displayed inline
- API errors shown in error alerts
- Retry buttons for failed operations
- Loading states during API calls

---

## Recent Updates

### Search Functionality (Latest)
- Added search to all listing pages
- Search resets pagination to page 1 automatically
- Backend search support for all resources:
  - **Bookings**: booking_number, venue, function_type, customer name/mobile
  - **Customers/Suppliers**: name, mobile
  - **Menu Items**: name, category
  - **Packages**: name, description
  - **Payments**: reference_number, payment_type, booking_number, customer name
  - **Purchase/Expense/Menu Types**: name
  - **Expenses**: description, item_name, invoice_number, supplier name

### Pagination
- Added pagination to all listing pages
- Unified `.pagination` CSS class
- 25 items per page default
- Previous/Next navigation with page indicators
- Pages: Bookings, Customers, Menu Items, Packages, Expenses, Purchases, Payments

### Dynamic Dropdowns
- Expense types now database-backed with "+ Add new" option
- Menu categories now database-backed with "+ Add new" option
- Function types now database-backed with "+ Add new" option
- Purchase types with quick add
- Suppliers with quick add

### Settings
- Settings page now functional
- Business name displayed in sidebar
- Settings persisted to database

### Payment Forms
- Unified payment form style across bookings, expenses, purchases
- Outstanding balance display
- Validation for payment amounts

### Cancel Booking
- Cancel button (Ban icon) added to Bookings listing page
- Cancel button added to Customer details booking tables
- Refund confirmation modal with options:
  - Cancel with full refund (creates refund payment record)
  - Cancel without refund (keeps payment records as-is)
- Only shows for non-cancelled bookings with function date today or in the future

### Edit Booking
- Edit button (Pencil icon) added to:
  - Bookings listing page
  - Booking detail page
  - Customer details booking tables
- Edit allows changing: customer, function type, date, time, venue, guests, package, pricing, status, notes
- When editing, shows status dropdown instead of advance payment field

### Booking Restrictions
| Action | Allowed When |
|--------|-------------|
| Edit | Future bookings only (before function date) |
| Delete | Future bookings only AND no payments recorded |
| Cancel | On or before function date |

### Auto-Complete Past Bookings
- Bookings with status "Confirmed" or "Preparation" are automatically marked "Completed" when:
  - Viewing the bookings list
  - Viewing a single booking
  - Viewing customer details
- Triggers when function date has passed (< today)

### Payment Direction Tracking
- Payments now track direction: 'in' (income) or 'out' (refund)
- When cancelling with refund, a refund payment record is created instead of deleting payments
- Payment History shows:
  - **Income**: Payments received from customers
  - **Outgoing (Refund)**: Refunds given to customers
  - **Outgoing (Expense)**: Expense payments
  - **Outgoing (Purchase)**: Purchase payments
- Filter by source "Refund" to see all refunds

### Soft Deletes
- Bookings now use soft deletes
- Deleted bookings are hidden but data is preserved in database
- `deleted_at` column added to bookings table

---

## Support

For issues and feature requests, please create an issue in the project repository.
