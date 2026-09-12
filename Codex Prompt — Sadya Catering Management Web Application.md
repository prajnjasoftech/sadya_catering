Create a complete **web-based Sadya Catering Management Application** for a vegetarian catering business in Kerala.

The application should have a **modern, clean, professional, good-looking frontend** that is easy for non-technical users to use.

## Technology Stack

- Frontend: **React**
- Backend: **Laravel REST API**
- Database: **SQLite**
- Authentication: Laravel Sanctum
- Styling: Use a modern UI framework such as **Tailwind CSS** or another clean React-compatible UI system
- The application should be responsive and work properly on desktop, tablet, and mobile browsers.

Keep the architecture clean so SQLite can later be replaced with MySQL or PostgreSQL without major application changes.

---

# Application Purpose

The business provides vegetarian **Sadya catering for weddings, housewarming functions, temple events, family functions, corporate events and similar occasions**.

They offer multiple Sadya packages such as:

- ₹120 per leaf
- ₹150 per leaf
- ₹190 per leaf

Each package contains a different menu.

Customers may also customize a package by adding or removing dishes.

The first version should focus on basic catering operations.

---

# Main Modules

## 1. Dashboard

Create an attractive dashboard showing:

- Today's functions
- Upcoming bookings
- Total bookings this month
- Total booking revenue
- Payments received
- Outstanding payments
- Total expenses
- Estimated profit
- Recent bookings
- Recent expenses

Include useful charts such as:

- Monthly booking revenue
- Monthly expenses
- Revenue vs expenses
- Booking status summary

Use cards, charts, icons, and clean spacing.

---

# 2. Customer Management

Create full CRUD functionality.

Customer fields:

- Customer Name
- Mobile Number
- Alternate Mobile
- Email
- Address
- Place
- Notes

Customer detail page should display:

- Customer information
- Previous bookings
- Upcoming bookings
- Total business value
- Pending payments

Add customer search and filters.

---

# 3. Sadya Package Management

Allow administrators to create multiple Sadya packages.

Example:

### Basic Sadya
Price: ₹120 per leaf

### Standard Sadya
Price: ₹150 per leaf

### Premium Sadya
Price: ₹190 per leaf

Package fields:

- Package Name
- Price Per Leaf
- Description
- Status: Active / Inactive

Allow dishes/items to be added to packages.

Example dishes:

- Rice
- Parippu
- Sambar
- Avial
- Thoran
- Kootu Curry
- Kichadi
- Pachadi
- Pickle
- Pappadam
- Banana
- Payasam
- Banana Chips
- Sharkara Upperi

Create a separate reusable **Menu Item / Dish Master**.

Fields:

- Dish Name
- Category
- Description
- Active / Inactive

A package can contain multiple dishes.

---

# 4. Booking Management

This is the most important module.

Booking fields:

- Booking Number — auto generated
- Customer
- Function Type
- Function Date
- Serving Time
- Venue
- Number of Guests / Leaves
- Selected Sadya Package
- Price Per Leaf
- Base Amount
- Additional Charges
- Discount
- Final Booking Amount
- Advance Amount
- Amount Paid
- Balance Amount
- Booking Status
- Notes

Function types can include:

- Wedding
- Reception
- Housewarming
- Birthday
- Temple Function
- Corporate Function
- Family Function
- Other

Booking statuses:

- Enquiry
- Confirmed
- Preparation
- Completed
- Cancelled

---

# Booking Menu Customisation

When a Sadya package is selected, automatically load the dishes included in that package.

Allow the user to:

- Add additional dishes
- Remove dishes
- Change the price if required
- Add special instructions

Example:

Standard ₹150 Sadya

Customer adds:

- Extra Palada Payasam
- Special Banana Chips

Customer removes:

- Kootu Curry

Store the customised menu against the booking without changing the original package.

---

# Automatic Booking Calculation

Automatically calculate:

Number of Leaves × Price Per Leaf

Example:

500 × ₹150 = ₹75,000

Then calculate:

Base Amount  
+ Additional Charges  
− Discount  
= Final Booking Amount

Also automatically calculate:

Final Booking Amount − Payments Received = Balance Amount

---

# 5. Expense Management

For V1, purchases and other expenses should be handled inside one Expense Management module.

Expense types:

- Purchase
- Labour
- Transport
- Fuel
- Rental
- Gas
- Miscellaneous
- Other

Expense fields:

- Date
- Expense Type
- Expense Category
- Booking — optional
- Description
- Amount
- Paid To
- Payment Method
- Notes

Payment methods:

- Cash
- UPI
- Bank Transfer
- Card
- Other

---

# Purchase-Type Expense

If Expense Type = Purchase, show additional fields:

- Supplier
- Item Name
- Quantity
- Unit
- Rate
- Total Amount
- Invoice / Bill Number

Units may include:

- Kg
- Gram
- Litre
- Number
- Bundle
- Packet
- Box
- Sack

Calculate:

Quantity × Rate = Total Amount

Examples:

50 Kg Rice × ₹60 = ₹3,000

25 Kg Vegetables × ₹80 = ₹2,000

These purchases should still be counted as expenses.

Do not implement inventory management in V1.

---

# 6. Payment Management

Allow multiple payments against one booking.

Payment fields:

- Booking
- Customer
- Payment Date
- Amount
- Payment Mode
- Reference Number
- Notes

Payment types may include:

- Advance
- Part Payment
- Final Payment

Automatically update booking balance after every payment.

Display complete payment history inside the booking detail page.

---

# 7. Booking Profitability

Each booking should show:

- Booking Value
- Total Amount Received
- Balance Receivable
- Total Booking Expenses
- Estimated Profit

Formula:

Estimated Profit = Final Booking Amount − Booking Expenses

Example:

Booking Value: ₹75,000  
Expenses: ₹48,000  
Estimated Profit: ₹27,000

Display this clearly using cards on the booking detail page.

---

# 8. Reports

Create basic reports for:

### Booking Reports

- Booking list
- Bookings by date range
- Bookings by customer
- Bookings by package
- Upcoming bookings
- Completed bookings
- Cancelled bookings

### Financial Reports

- Total revenue
- Payments received
- Pending payments
- Expenses
- Profit

### Expense Reports

- Expenses by category
- Expenses by date
- Expenses by booking
- Purchase expenses
- Labour expenses
- Transport expenses

Provide date filters.

Allow report tables to be printed.

CSV export is a bonus.

---

# User Management

Initially support:

### Admin

Full access to the application.

Structure the permissions so additional roles can be added later, such as:

- Manager
- Accountant
- Booking Staff

---

# Frontend Design Requirements

The frontend is very important.

Do NOT create a plain Bootstrap-style admin page.

Create a polished SaaS-style interface.

Use:

- Clean sidebar navigation
- Top navigation/header
- Dashboard cards
- Beautiful forms
- Modern tables
- Search bars
- Filters
- Status badges
- Icons
- Confirmation dialogs
- Toast notifications
- Loading indicators
- Empty-state screens
- Modal dialogs where appropriate

Navigation:

Dashboard

Bookings

Customers

Sadya Packages

Menu Items

Expenses

Payments

Reports

Settings

---

# Kerala Catering Visual Style

Keep the application professional, but subtly reflect the Kerala Sadya theme.

Possible visual ideas:

- Light cream / off-white backgrounds
- Banana leaf inspired green accents
- Warm gold highlights
- Minimal traditional Kerala-inspired details

Do not make the interface overly decorative.

The product should look like a modern business management SaaS application.

Use good typography and spacing.

---

# Important UX Requirements

The user should be able to create a booking quickly.

The booking screen should ideally follow this flow:

Customer  
↓  
Function Details  
↓  
Guest Count  
↓  
Sadya Package  
↓  
Menu Customisation  
↓  
Pricing  
↓  
Advance Payment  
↓  
Save Booking

Avoid making the user navigate through too many pages.

---

# Database Design

Create appropriate Laravel migrations, models, relationships, controllers, request validations, services where necessary, API resources, and routes.

Suggested tables:

users

customers

menu_items

sadya_packages

sadya_package_items

bookings

booking_menu_items

payments

expense_categories

expenses

suppliers

Add timestamps where appropriate.

Use foreign keys wherever possible.

Avoid SQLite-specific application logic.

---

# Backend Requirements

Use Laravel best practices.

Include:

- REST API architecture
- Eloquent relationships
- Form request validation
- API resources
- Proper error responses
- Transactions for critical operations
- Pagination
- Search
- Filtering
- Sorting

Create clean reusable services where business logic becomes complex.

---

# Frontend Structure

Use React components properly.

Create reusable components such as:

- Sidebar
- Header
- StatCard
- DataTable
- FormInput
- Select
- Modal
- ConfirmationDialog
- StatusBadge
- DatePicker
- CurrencyDisplay
- PageHeader

Use React Router for navigation.

Create API services separately instead of putting API calls directly inside UI components.

---

# Indian Currency

Display financial values using Indian Rupee formatting.

Example:

₹1,25,000

Not:

₹125000

---

# Seed Data

Create seed data so the system looks populated immediately.

Include:

- Several customers
- ₹120 package
- ₹150 package
- ₹190 package
- Example menu dishes
- Several example bookings
- Payments
- Expense categories
- Example expenses

This is important so I can immediately demonstrate the application after installation.

---

# Code Quality

Keep the code modular and maintainable.

Do not create everything inside a single controller or React component.

Use proper naming conventions.

Add comments only where they genuinely help explain business logic.

Do not over-engineer V1.

---

# Features NOT Required in V1

Do NOT implement these now:

- Inventory Management
- Recipe Management
- Automatic ingredient calculation
- Staff allocation
- Vehicle management
- Vessel/equipment management
- Supplier credit management
- WhatsApp integration
- AI forecasting
- Mobile application

However, structure the application so these modules can be added later.

---

# Final Deliverable

Build a functioning application, not only UI mockups.

Create:

1. Laravel backend
2. React frontend
3. SQLite database
4. Database migrations
5. Seeders
6. Authentication
7. CRUD screens
8. Dashboard
9. Reports
10. Sample data

Also create a README containing:

- Installation instructions
- Laravel setup
- React setup
- SQLite setup
- Migration and seeding commands
- How to run the backend
- How to run the frontend

Before finishing, run the application, verify the main flows, and fix obvious errors.

The primary goal is:

**A simple, attractive and easy-to-use Sadya Catering Management System that helps the caterer manage customers, bookings, Sadya packages, payments, expenses and booking profitability.**