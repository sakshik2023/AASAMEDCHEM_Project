"use client";

import { useMemo, useState } from "react";

type Unit = "g" | "kg" | "L" | "mL" | "unit";
type Role = "seller" | "admin";

type Product = {
  id: number;
  name: string;
  category: string;
  baseUnit: "g" | "kg" | "L" | "mL" | "unit";
  basePricePerUnit: number;
  stockQuantity: number;
  description: string;
};

type OrderItem = {
  productId: number;
  quantity: number;
  unit: Unit;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Aspirin Powder",
    category: "Pharma",
    baseUnit: "g",
    basePricePerUnit: 0.18,
    stockQuantity: 5000,
    description: "Weight-based inventory stored internally in grams.",
  },
  {
    id: 2,
    name: "Bulk Reagent",
    category: "Chemicals",
    baseUnit: "kg",
    basePricePerUnit: 24.5,
    stockQuantity: 60,
    description: "High-volume bulk chemistry stored internally in kilograms.",
  },
  {
    id: 3,
    name: "Sterile Solvent",
    category: "Lab",
    baseUnit: "mL",
    basePricePerUnit: 0.04,
    stockQuantity: 120000,
    description: "Volume-based inventory stored internally in milliliters.",
  },
  {
    id: 4,
    name: "Dilution Buffer",
    category: "Buffer",
    baseUnit: "L",
    basePricePerUnit: 3.2,
    stockQuantity: 240,
    description: "Large-volume solution stored internally in liters.",
  },
  {
    id: 5,
    name: "Sample Vials",
    category: "Packaging",
    baseUnit: "unit",
    basePricePerUnit: 2.5,
    stockQuantity: 250,
    description: "Count-based stock stored as items.",
  },
];

function convertToBase(quantity: number, fromUnit: Unit, baseUnit: Product["baseUnit"]): number {
  const weightScale: Record<Unit, number> = { g: 1, kg: 1000, L: 0, "mL": 0, unit: 0 };
  const volumeScale: Record<Unit, number> = { g: 0, kg: 0, L: 1000, "mL": 1, unit: 0 };

  if (baseUnit === "g" || baseUnit === "kg") {
    const fromGrams = fromUnit === "kg" ? quantity * 1000 : fromUnit === "g" ? quantity : 0;
    const toGrams = baseUnit === "kg" ? 1000 : 1;
    return fromGrams / toGrams;
  }

  if (baseUnit === "L" || baseUnit === "mL") {
    const fromMilliliters = fromUnit === "L" ? quantity * 1000 : fromUnit === "mL" ? quantity : 0;
    const toMilliliters = baseUnit === "L" ? 1000 : 1;
    return fromMilliliters / toMilliliters;
  }

  return quantity;
}

function getSupportedUnits(baseUnit: Product["baseUnit"]): Unit[] {
  if (baseUnit === "g" || baseUnit === "kg") return ["g", "kg"];
  if (baseUnit === "L" || baseUnit === "mL") return ["L", "mL"];
  return ["unit"];
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const [role, setRole] = useState<Role>("seller");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selected, setSelected] = useState<OrderItem[]>([]);
  const [quoteStatus, setQuoteStatus] = useState("Pending review");
  const [draft, setDraft] = useState({ name: "", category: "", baseUnit: "g" as Product["baseUnit"], basePricePerUnit: "" });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const haystack = `${product.name} ${product.category}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [products, search]);

  const total = selected.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return sum;
    const baseQuantity = convertToBase(item.quantity, item.unit, product.baseUnit);
    return sum + baseQuantity * product.basePricePerUnit;
  }, 0);

  const addToOrder = (product: Product) => {
    setSelected((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) return prev;
      const defaultUnit = getSupportedUnits(product.baseUnit)[0];
      return [...prev, { productId: product.id, quantity: 1, unit: defaultUnit }];
    });
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    setSelected((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(quantity, 0) } : item))
    );
  };

  const placeQuotation = () => {
    if (!selected.length) return;
    setQuoteStatus(`Quotation ready for ${role === "admin" ? "approval" : "review"}: ${selected.length} line item(s), total ${formatInr(total)}.`);
  };

  const removeItem = (productId: number) => {
    setSelected((prev) => prev.filter((item) => item.productId !== productId));
  };

  const createProduct = () => {
    if (!draft.name.trim()) return;
    const product: Product = {
      id: Date.now(),
      name: draft.name.trim(),
      category: draft.category.trim() || "General",
      baseUnit: draft.baseUnit,
      basePricePerUnit: Number(draft.basePricePerUnit) || 0,
      stockQuantity: 100,
      description: "New product created in the admin panel.",
    };
    setProducts((prev) => [product, ...prev]);
    setDraft({ name: "", category: "", baseUnit: "g", basePricePerUnit: "" });
  };

  const deleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setSelected((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">AasaMedChem Hackathon</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-semibold text-white">Inventory & quotation dashboard</h1>
              <p className="mt-2 max-w-3xl text-slate-300">A compact Next.js workflow for searching inventory, converting quantities, and creating quotations with INR pricing.</p>
            </div>
            <label className="rounded-2xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-200">
              Role
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="mt-2 block w-52 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100">
                <option value="seller">Seller / User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Browse inventory</h2>
                  <p className="text-slate-300">Search products, inspect internal storage units, and add line items for quotations.</p>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product or category"
                  className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">{product.category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{product.name}</h3>
                        <p className="mt-1 text-sm text-slate-300">{product.description}</p>
                      </div>
                      <button
                        onClick={() => addToOrder(product)}
                        className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
                      >
                        Add
                      </button>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm text-slate-200">
                      <div className="flex justify-between"><dt>Internal unit</dt><dd>{product.baseUnit}</dd></div>
                      <div className="flex justify-between"><dt>Price</dt><dd>{formatInr(product.basePricePerUnit)} / {product.baseUnit}</dd></div>
                      <div className="flex justify-between"><dt>Available stock</dt><dd>{product.stockQuantity} {product.baseUnit}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </article>

            {role === "admin" && (
              <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30">
                <h2 className="text-2xl font-semibold text-white">Admin controls</h2>
                <p className="text-slate-300">Create or remove products to simulate inventory management.</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Product name" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                  <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                  <select value={draft.baseUnit} onChange={(e) => setDraft({ ...draft, baseUnit: e.target.value as Product["baseUnit"] })} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="unit">unit</option>
                  </select>
                  <input type="number" value={draft.basePricePerUnit} onChange={(e) => setDraft({ ...draft, basePricePerUnit: e.target.value })} placeholder="Base price / unit" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={createProduct} className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950">Add product</button>
                  <span className="text-sm text-slate-400">Base units are stored as g, mL, or unit for consistent conversion handling.</span>
                </div>

                <div className="mt-6 space-y-3">
                  {products.map((product) => (
                    <article key={product.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-sm text-slate-300">{product.baseUnit} • {formatInr(product.basePricePerUnit)} / {product.baseUnit}</p>
                      </div>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-full border border-rose-500 px-4 py-2 text-sm text-rose-200">Delete</button>
                    </article>
                  ))}
                </div>
              </article>
            )}
          </div>

          <aside className="space-y-8">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30">
              <h2 className="text-2xl font-semibold text-white">Quotation builder</h2>
              <p className="text-slate-300">Choose quantities in any supported unit. The calculator converts them to the internal base unit for pricing.</p>
              <div className="mt-6 space-y-4">
                {selected.length === 0 && <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">Add products from the inventory list to create a quotation.</p>}
                {selected.map((item) => {
                  const product = products.find((entry) => entry.id === item.productId);
                  if (!product) return null;
                  const baseQuantity = convertToBase(item.quantity, item.unit, product.baseUnit);
                  const lineTotal = baseQuantity * product.basePricePerUnit;
                  return (
                    <article key={item.productId} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-slate-300">Stored internally in {product.baseUnit}; line total {formatInr(lineTotal)}</p>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-sm text-rose-200">Remove</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <input type="number" min="0" value={item.quantity} onChange={(e) => updateItemQuantity(item.productId, Number(e.target.value))} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
                        <select value={item.unit} onChange={(e) => setSelected((prev) => prev.map((entry) => entry.productId === item.productId ? { ...entry, unit: e.target.value as Unit } : entry))} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
                          {getSupportedUnits(product.baseUnit).map((unit) => (
                            <option key={`${product.id}-${unit}`} value={unit}>{unit}</option>
                          ))}
                        </select>
                        <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100">{baseQuantity.toFixed(2)} {product.baseUnit}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-200">
                <div className="flex justify-between"><span>Total quotation value</span><strong>{formatInr(total)}</strong></div>
                <p className="mt-2 text-slate-400">Conversion rule in use: kg → g = ×1000, L → mL = ×1000, count stays in items.</p>
              </div>
              <button onClick={placeQuotation} className="mt-4 w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Place quotation</button>
              <p className="mt-3 text-sm text-emerald-200">{quoteStatus}</p>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30">
              <h2 className="text-2xl font-semibold text-white">Role guidance</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Seller/User: search products, calculate price, and create quotations.</li>
                <li>• Admin: create/delete products and review line-item totals from the same view.</li>
                <li>• Internal storage uses g, mL, and unit to keep conversions predictable.</li>
              </ul>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
