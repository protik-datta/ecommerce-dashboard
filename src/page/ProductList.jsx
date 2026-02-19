import { getProducts, deleteProduct } from "@/api/api";
import {
  Edit2,
  Trash2,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Custom Toast ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return {
    toasts,
    success: (m) => add(m, "success"),
    error: (m) => add(m, "error"),
    info: (m) => add(m, "info"),
    remove: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
  };
}
const TOAST_META = {
  success: { bg: "#064e3b", color: "#6ee7b7", border: "#065f46", icon: "✓" },
  error: { bg: "#450a0a", color: "#fca5a5", border: "#7f1d1d", icon: "✕" },
  info: { bg: "#0c1a3a", color: "#93c5fd", border: "#1e3a6e", icon: "i" },
};
function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={s.toastStack}>
      {toasts.map((t) => {
        const m = TOAST_META[t.type] || TOAST_META.info;
        return (
          <div
            key={t.id}
            style={{
              ...s.toast,
              background: m.bg,
              color: m.color,
              borderColor: m.border,
            }}
          >
            <span style={s.toastIcon}>{m.icon}</span>
            <span style={s.toastMsg}>{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              style={{ ...s.toastClose, color: m.color }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onConfirm, onCancel, productName }) {
  if (!open) return null;
  return (
    <div style={s.dialogOverlay}>
      <div style={s.dialog}>
        <div style={s.dialogIcon}>
          <AlertTriangle size={24} color="#f87171" />
        </div>
        <div style={s.dialogTitle}>Delete Product</div>
        <div style={s.dialogMsg}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "#f3f4f6" }}>{productName}</strong>? This
          action cannot be undone.
        </div>
        <div style={s.dialogActions}>
          <button onClick={onCancel} style={s.dialogCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} style={s.dialogConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Virtual List ─────────────────────────────────────────────────────────────
const ROW_HEIGHT = 74;
const OVERSCAN = 5;

function useVirtualList(items, containerRef) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(520);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);

  const totalHeight = items.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const offsetY = startIndex * ROW_HEIGHT;
  const visibleItems = items.slice(startIndex, endIndex);

  return { totalHeight, startIndex, offsetY, visibleItems };
}

// ─── Flag config ──────────────────────────────────────────────────────────────
const FLAGS = [
  {
    key: "isNew",
    label: "New",
    bg: "rgba(16,185,129,0.15)",
    color: "#34d399",
    border: "rgba(16,185,129,0.3)",
  },
  {
    key: "isSale",
    label: "Sale",
    bg: "rgba(239,68,68,0.15)",
    color: "#f87171",
    border: "rgba(239,68,68,0.3)",
  },
  {
    key: "isLimited",
    label: "Limited",
    bg: "rgba(251,191,36,0.15)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  {
    key: "isHot",
    label: "Hot",
    bg: "rgba(251,146,60,0.15)",
    color: "#fb923c",
    border: "rgba(251,146,60,0.3)",
  },
  {
    key: "isFeatured",
    label: "Featured",
    bg: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.3)",
  },
  {
    key: "isBestSelling",
    label: "Best Selling",
    bg: "rgba(217,119,6,0.15)",
    color: "#fbbf24",
    border: "rgba(217,119,6,0.3)",
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({
  prod,
  index,
  isHovered,
  onHover,
  onEdit,
  onDelete,
  isDeleting,
}) {
  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "#1a2233" : "transparent",
        height: ROW_HEIGHT,
      }}
      onMouseEnter={() => onHover(prod._id || prod.slug)}
      onMouseLeave={() => onHover(null)}
    >
      {/* # */}
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>

      {/* Image */}
      <td style={s.td}>
        {prod.image?.[0]?.url ? (
          <img src={prod.image[0].url} alt={prod.name} style={s.prodImg} />
        ) : (
          <div style={s.prodImgPlaceholder}>
            <Package size={16} color="#4b5563" />
          </div>
        )}
      </td>

      {/* Name & Brand */}
      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.prodName}>{prod.name}</span>
          {prod.brand && <span style={s.prodBrand}>{prod.brand}</span>}
        </div>
      </td>

      {/* SKU */}
      <td style={s.td}>
        <span style={s.monoText}>{prod.sku || "—"}</span>
      </td>

      {/* Category */}
      <td style={s.td}>
        <span style={s.categoryChip}>{prod.category?.name || "—"}</span>
      </td>

      {/* Price */}
      <td style={s.td}>
        <div style={s.priceCell}>
          <span style={s.priceMain}>${Number(prod.price).toFixed(2)}</span>
          {prod.discountValue > 0 && (
            <span style={s.discountBadge}>
              -
              {prod.discountType === "percentage"
                ? `${prod.discountValue}%`
                : `$${prod.discountValue}`}
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td style={s.td}>
        {prod.stock === 0 ? (
          <span style={s.outOfStock}>Out of Stock</span>
        ) : (
          <span
            style={{
              ...s.stockBadge,
              ...(prod.stock < 10 ? s.stockLow : s.stockOk),
            }}
          >
            {prod.stock}
          </span>
        )}
      </td>

      {/* Flags */}
      <td style={s.td}>
        <div style={s.flagsCell}>
          {FLAGS.filter((f) => prod[f.key]).map((f) => (
            <span
              key={f.key}
              style={{
                ...s.flagChip,
                background: f.bg,
                color: f.color,
                border: `1px solid ${f.border}`,
              }}
            >
              {f.label}
            </span>
          ))}
          {!FLAGS.some((f) => prod[f.key]) && <span style={s.dash}>—</span>}
        </div>
      </td>

      {/* Actions */}
      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={{ ...s.editBtn, ...(isHovered ? s.editBtnHover : {}) }}
            onClick={() => onEdit(prod)}
            title="Edit product"
          >
            <Edit2 size={14} />
          </button>
          <button
            style={{
              ...s.deleteBtn,
              ...(isHovered ? s.deleteBtnHover : {}),
              ...(isDeleting ? s.btnDisabled : {}),
            }}
            onClick={() => onDelete(prod)}
            disabled={isDeleting}
            title="Delete product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductList() {
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getProducts();
  const deleteProductMutation = deleteProduct();

  const products = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [confirmProd, setConfirmProd] = useState(null); // product pending delete

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const VLIST_HEIGHT = 520;
  const { totalHeight, offsetY, visibleItems, startIndex } = useVirtualList(
    filtered,
    scrollRef,
  );

  const toggleSort = useCallback(
    (key) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const handleEdit = (prod) =>
    navigate("/edit-product", { state: { products: prod } });
  const handleDelete = (prod) => setConfirmProd(prod);

  const confirmDelete = () => {
    if (!confirmProd) return;
    deleteProductMutation.mutate(confirmProd.slug, {
      onSuccess: () =>
        toast.success(`"${confirmProd.name}" deleted successfully.`),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed."),
      onSettled: () => setConfirmProd(null),
    });
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const avgPrice = products.length
    ? (
        products.reduce((s, p) => s + Number(p.price || 0), 0) / products.length
      ).toFixed(2)
    : "0.00";

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading products…</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ ...s.stateText, color: "#f87171" }}>
            Failed to load products.
          </p>
        </div>
      </div>
    );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />
      <ConfirmDialog
        open={!!confirmProd}
        productName={confirmProd?.name}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmProd(null)}
      />

      {/* ── Header ── */}
      <div className="pl-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Products</span>
          </div>
          <h1 className="pl-title">Products</h1>
          <p style={s.titleSub}>
            Manage product catalogue — edit and update listings.
          </p>
        </div>
        <button
          onClick={() => navigate("/add-product")}
          style={s.btnAdd}
          className="pl-btn-add"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="pl-stats">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length}
          accent="#d97706"
        />
        <StatCard
          icon={Layers}
          label="Total Stock"
          value={totalStock}
          accent="#818cf8"
        />
        <StatCard
          icon={DollarSign}
          label="Avg. Price"
          value={`$${avgPrice}`}
          accent="#34d399"
        />
        <StatCard
          icon={Package}
          label="Out of Stock"
          value={outOfStock}
          accent="#f87171"
        />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="pl-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Package size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Product List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {products.length} products
                {filtered.length !== products.length && " (filtered)"}
                {" · "}
                <span style={{ color: "#d97706" }}>virtualised</span>
              </div>
            </div>
          </div>
          <div className="pl-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, brand, category…"
              style={s.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={s.searchClear}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Virtualised Table ── */}
        <div style={s.tableOuterWrap}>
          {/* Fixed header */}
          <div style={s.tableHeaderWrap}>
            <table style={{ ...s.table, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 42 }} />
                <col style={{ width: 62 }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: 72 }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: 76 }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "#", key: null },
                    { label: "Image", key: null },
                    { label: "Name", key: "name" },
                    { label: "SKU", key: "sku" },
                    { label: "Category", key: null },
                    { label: "Price", key: "price" },
                    { label: "Stock", key: "stock" },
                    { label: "Flags", key: null },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      style={{
                        ...s.th,
                        ...(key
                          ? { cursor: "pointer", userSelect: "none" }
                          : {}),
                        ...(label === "Actions" ? { textAlign: "center" } : {}),
                      }}
                      onClick={() => key && toggleSort(key)}
                    >
                      {label}
                      {key && sortKey === key && (
                        <span style={s.sortArrow}>
                          {sortDir === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            style={{ ...s.tableScrollBody, height: VLIST_HEIGHT }}
          >
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <span style={{ fontSize: 44 }}>📦</span>
                <p style={s.emptyTitle}>No products found</p>
                <p style={s.emptyHint}>
                  {search
                    ? "Try a different search term."
                    : "Add your first product to get started."}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/add-product")}
                    style={s.emptyBtn}
                  >
                    + Add Product
                  </button>
                )}
              </div>
            ) : (
              <div style={{ height: totalHeight, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: offsetY,
                    left: 0,
                    right: 0,
                  }}
                >
                  <table style={{ ...s.table, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: 42 }} />
                      <col style={{ width: 62 }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: 72 }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: 76 }} />
                    </colgroup>
                    <tbody>
                      {visibleItems.map((prod, i) => (
                        <ProductRow
                          key={prod._id || prod.slug}
                          prod={prod}
                          index={startIndex + i}
                          isHovered={hoveredRow === (prod._id || prod.slug)}
                          onHover={setHoveredRow}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isDeleting={deleteProductMutation.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pl-table-footer">
          Showing{" "}
          <strong style={{ color: "#f3f4f6" }}>{filtered.length}</strong>{" "}
          products
          {filtered.length !== products.length && (
            <>
              {" "}
              ·{" "}
              <strong style={{ color: "#d97706" }}>
                {products.length - filtered.length}
              </strong>{" "}
              hidden by filter
            </>
          )}
          <span style={s.footerVirt}>· Only visible rows rendered</span>
        </div>
      </div>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  @keyframes spin        { to { transform: rotate(360deg); } }
  @keyframes fadeIn      { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp     { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes dialogIn    { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar       { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#0d0d0d; }
  ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:3px; }

  .pl-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }
  .pl-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 28px;
    flex-wrap: wrap; gap: 16px;
  }
  .pl-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .pl-card-header {
    display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap;
    gap: 14px; padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }
  .pl-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #0d1117; border: 1.5px solid #1f2937;
    border-radius: 10px; padding: 8px 14px; min-width: 280px;
  }
  .pl-btn-add {
    display: inline-flex; align-items: center; gap: 7px;
    background: #d97706; color: #fff; border: none;
    border-radius: 11px; padding: 10px 18px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    white-space: nowrap; flex-shrink: 0; transition: opacity 0.2s;
  }
  .pl-btn-add:hover { opacity: 0.88; }
  .pl-table-footer {
    padding: 14px 24px; border-top: 1px solid #1f2937;
    font-size: 12px; color: #4b5563; text-align: right;
  }

  @media (max-width: 900px) {
    .pl-stats { grid-template-columns: repeat(2, 1fr); }
    .pl-card-header { flex-direction: column; align-items: flex-start; padding: 16px 18px; }
    .pl-search-wrap { width: 100%; min-width: unset; }
  }
  @media (max-width: 600px) {
    .pl-title { font-size: 21px; }
    .pl-header { margin-bottom: 18px; }
    .pl-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
    .pl-card-header { padding: 14px; }
    .pl-table-footer { text-align: center; padding: 12px 14px; }
    .pl-btn-add span { display: none; }
    .pl-btn-add { padding: 10px 12px; border-radius: 10px; }
  }
  @media (max-width: 420px) {
    .pl-title { font-size: 18px; }
    .pl-stats { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#e5e7eb",
    padding: "32px 24px 80px",
    animation: "fadeIn 0.35s ease",
  },
  centerState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #1f2937",
    borderTop: "3px solid #d97706",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  stateText: { color: "#6b7280", fontSize: 14 },

  breadcrumb: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  titleSub: { fontSize: 13, color: "#6b7280", margin: 0 },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: "16px 20px",
    animation: "slideUp 0.4s ease",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#f9fafb",
    lineHeight: 1,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 3 },

  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    overflow: "hidden",
    animation: "slideUp 0.45s ease",
  },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(217,119,6,0.12)",
    color: "#d97706",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#f3f4f6" },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  searchIcon: { fontSize: 13, flexShrink: 0 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#f3f4f6",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
  },
  searchClear: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 18,
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },

  tableOuterWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  tableHeaderWrap: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "#0d1117",
    borderBottom: "1px solid #1f2937",
    overflowX: "hidden",
  },
  tableScrollBody: {
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    minWidth: 860,
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 860 },

  th: {
    padding: "12px 14px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    background: "#0d1117",
    whiteSpace: "nowrap",
  },
  sortArrow: { color: "#d97706", fontStyle: "normal" },

  tr: {
    borderBottom: "1px solid #1a2233",
    transition: "background 0.12s ease",
  },
  td: {
    padding: "0 14px",
    fontSize: 13,
    color: "#d1d5db",
    verticalAlign: "middle",
    height: ROW_HEIGHT,
  },

  indexBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    background: "#1f2937",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
  },

  prodImg: {
    width: 46,
    height: 46,
    borderRadius: 9,
    objectFit: "cover",
    border: "1.5px solid #1f2937",
    display: "block",
  },
  prodImgPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 9,
    background: "#1f2937",
    border: "1.5px solid #374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  prodName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f3f4f6",
    lineHeight: 1.3,
  },
  prodBrand: { fontSize: 11, color: "#6b7280" },

  monoText: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    color: "#9ca3af",
    letterSpacing: "0.03em",
  },

  categoryChip: {
    display: "inline-block",
    background: "rgba(129,140,248,0.1)",
    color: "#818cf8",
    border: "1px solid rgba(129,140,248,0.2)",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 500,
  },

  priceCell: { display: "flex", flexDirection: "column", gap: 3 },
  priceMain: { fontSize: 14, fontWeight: 700, color: "#f3f4f6" },
  discountBadge: {
    fontSize: 10,
    color: "#34d399",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: 5,
    padding: "1px 6px",
    display: "inline-block",
  },

  stockBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  stockOk: {
    background: "rgba(16,185,129,0.1)",
    color: "#34d399",
    border: "1px solid rgba(16,185,129,0.25)",
  },
  stockLow: {
    background: "rgba(251,146,60,0.1)",
    color: "#fb923c",
    border: "1px solid rgba(251,146,60,0.25)",
  },
  outOfStock: {
    display: "inline-block",
    padding: "3px 10px",
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },

  flagsCell: { display: "flex", flexWrap: "wrap", gap: 4 },
  flagChip: {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  dash: { color: "#374151" },

  actionsCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.25)",
    color: "#818cf8",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
  },
  editBtnHover: {
    background: "rgba(99,102,241,0.2)",
    transform: "scale(1.08)",
  },

  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
  },
  deleteBtnHover: {
    background: "rgba(239,68,68,0.2)",
    transform: "scale(1.08)",
  },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed", transform: "none" },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: "100%",
    padding: "60px 24px",
  },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: "#9ca3af", margin: 0 },
  emptyHint: { fontSize: 12, color: "#4b5563", margin: 0 },
  emptyBtn: {
    marginTop: 6,
    padding: "8px 20px",
    background: "rgba(217,119,6,0.12)",
    border: "1px solid rgba(217,119,6,0.3)",
    color: "#d97706",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  footerVirt: { color: "#374151", marginLeft: 8, fontStyle: "italic" },
  btnAdd: {},

  // ── Confirm dialog ──
  dialogOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1200,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backdropFilter: "blur(4px)",
  },
  dialog: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 20,
    padding: "32px 28px",
    maxWidth: 380,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
    animation: "dialogIn 0.25s cubic-bezier(0.16,1,0.3,1)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f3f4f6",
    fontFamily: "'Playfair Display', serif",
  },
  dialogMsg: { fontSize: 13, color: "#9ca3af", lineHeight: 1.6 },
  dialogActions: { display: "flex", gap: 10, marginTop: 8, width: "100%" },
  dialogCancel: {
    flex: 1,
    padding: "11px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    borderRadius: 10,
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s",
  },
  dialogConfirm: {
    flex: 1,
    padding: "11px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    color: "#f87171",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s",
  },

  // ── Toast ──
  toastStack: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1300,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 340,
    width: "calc(100vw - 40px)",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 16px",
    borderRadius: 12,
    border: "1px solid",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    animation: "toastSlide 0.3s ease",
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    background: "rgba(255,255,255,0.1)",
  },
  toastMsg: { flex: 1, lineHeight: 1.4 },
  toastClose: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
    opacity: 0.7,
    flexShrink: 0,
  },
};
