-- Neon PostgreSQL schema for the AasaMedChem inventory and quotation system

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  base_unit VARCHAR(10) NOT NULL CHECK (base_unit IN ('g', 'mL', 'unit')),
  base_price_per_unit NUMERIC(18, 6) NOT NULL DEFAULT 0,
  stock_quantity NUMERIC(18, 6) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT 'Seller User',
  status TEXT NOT NULL DEFAULT 'Pending',
  total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id BIGSERIAL PRIMARY KEY,
  quotation_id BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity NUMERIC(18, 6) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  line_total NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
