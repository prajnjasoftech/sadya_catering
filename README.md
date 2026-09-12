# SadyaPro Catering Management

A full-stack catering operations application for Kerala Sadya businesses. It includes customer, package and dish management; fast booking entry with menu snapshots and automatic totals; multiple payments; purchase and operating expenses; profitability; dashboard charts; and printable reports.

## Stack

- Laravel 11 REST API with Sanctum token authentication
- SQLite (portable Eloquent schema; no SQLite-specific business logic)
- React 19 + Vite, React Router, Recharts, Lucide icons
- Responsive custom SaaS interface

## Requirements

- PHP 8.2+, Composer 2
- Node.js 20+ and npm
- PHP extensions: SQLite, PDO, OpenSSL, Mbstring

## Backend setup

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File database/database.sqlite -Force
php artisan migrate --seed
php artisan serve
```

The API runs at `http://127.0.0.1:8000`. The `.env` supplied by Laravel defaults to SQLite in this project.

## Frontend setup

Open another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://127.0.0.1:5173`.

Demo login:

- Email: `admin@sadyacatering.test`
- Password: `password`

## Verification

```powershell
cd backend
php artisan migrate:fresh --seed
php artisan test

cd ../frontend
npm run build
```

## API overview

Authentication uses `POST /api/login`, then a Bearer token for protected routes. REST resources are available for `/api/bookings`, `/api/customers`, `/api/packages`, `/api/menu-items`, `/api/payments`, and `/api/expenses`. Dashboard aggregates are at `/api/dashboard`.

Booking creation runs in a database transaction. It calculates base and final values, snapshots the selected package dishes into booking menu items, and records an optional advance. Payment and expense relationships provide live balance and estimated-profit figures without coupling calculations to the database engine.
