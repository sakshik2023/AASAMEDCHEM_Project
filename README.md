# AasaMedChem Inventory & Quotation Hub

This project is a hackathon-ready Next.js inventory and quotation management app with a role-based workflow for sellers and admins. The current UI demonstrates the key flows expected in the assignment: product search, unit conversion, INR pricing, and quotation creation.

## Features
- Search and filter inventory products.
- Convert user-entered quantities into internal storage units for price calculation.
- Show INR pricing in the UI.
- Admin view to add and remove products.
- Seller/User view to place quotations.

## Tech stack
- Next.js App Router + React + TypeScript
- Tailwind CSS for layout and styling
- Neon PostgreSQL schema documented in `schema.sql`
- Vercel-ready deployment target

## High-level system design
1. The Next.js frontend renders inventory cards, a quotation builder, and role-specific admin controls.
2. The quotation logic converts entered quantities into internal storage units before calculating totals.
3. The `schema.sql` file defines the PostgreSQL tables intended for Neon, which can be connected through `DATABASE_URL` in production.

## Database schema
- `products`: id, name, category, base_unit, base_price_per_unit, stock_quantity, description
- `quotations`: id, customer_name, status, total_amount
- `quotation_items`: id, quotation_id, product_id, quantity, unit, line_total

## Unit storage & conversion strategy
- Supported display and order units: `g`, `kg`, `L`, `mL`, and `unit` (count/items).
- Internal storage for weight-based products uses grams (`g`).
- Internal storage for volume-based products uses milliliters (`mL`).
- Internal storage for count-based products uses items (`unit`).
- Price is stored as `NUMERIC(18, 6)` to preserve high precision and support large values.
- Quantity is stored as `NUMERIC(18, 6)` in the database schema.
- Conversion rules used in the app:
  - `1 kg = 1000 g`
  - `1 L = 1000 mL`
  - count units remain in items
- The conversion is applied in the UI before the quotation total is calculated.

## Local setup
1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon connection string.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Neon / PostgreSQL notes
- The app is ready to connect to Neon via `DATABASE_URL`.
- Apply the schema with:
  ```bash
  psql "$DATABASE_URL" -f schema.sql
  ```

## Deployment on Vercel
1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Add the `DATABASE_URL` environment variable in Vercel Project Settings.
4. Deploy the project.

## How to use the app
- Seller/User role: search products, add line items, choose a quantity unit, and place a quotation.
- Admin role: use the admin panel to add or remove products and inspect the same quotation totals.

## Test credentials
- Seller/User: use the built-in role selector in the header.
- Admin: switch the role selector to Admin.
