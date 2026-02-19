import { deleteOrder, getOrders } from "@/api/api";
import {
  Trash2,
  ShoppingBag,
  CreditCard,
  Users,
  AlertTriangle,
  Clock,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

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
    remove: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
  };
}
const TOAST_META = {
  success: { bg: "#064e3b", color: "#6ee7b7", border: "#065f46", icon: "✓" },
  error: { bg: "#450a0a", color: "#fca5a5", border: "#7f1d1d", icon: "✕" },
};
function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={s.toastStack}>
      {toasts.map((t) => {
        const m = TOAST_META[t.type] || TOAST_META.success;
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
function ConfirmDialog({ open, onConfirm, onCancel, invoiceId }) {
  if (!open) return null;
  return (
    <div style={s.dialogOverlay}>
      <div style={s.dialog}>
        <div style={s.dialogIcon}>
          <AlertTriangle size={24} color="#f87171" />
        </div>
        <div style={s.dialogTitle}>Delete Order</div>
        <div style={s.dialogMsg}>
          Are you sure you want to delete order{" "}
          <strong
            style={{ color: "#f3f4f6", fontFamily: "'Courier New', monospace" }}
          >
            {invoiceId}
          </strong>
          ? This cannot be undone.
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
const ROW_HEIGHT = 90;
const OVERSCAN = 4;

function useVirtualList(items, containerRef) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

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

// ─── Payment badge ────────────────────────────────────────────────────────────
const PAYMENT_STYLES = {
  cod: {
    bg: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
    label: "COD",
  },
  online: {
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    border: "rgba(16,185,129,0.3)",
    label: "Online",
  },
  card: {
    bg: "rgba(99,102,241,0.12)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.3)",
    label: "Card",
  },
};
function PaymentBadge({ method }) {
  const key = (method || "").toLowerCase();
  const st = PAYMENT_STYLES[key] || {
    bg: "rgba(255,255,255,0.06)",
    color: "#9ca3af",
    border: "rgba(255,255,255,0.1)",
    label: method || "—",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
      }}
    >
      {st.label}
    </span>
  );
}

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

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  index,
  isHovered,
  onHover,
  onView,
  onDelete,
  isDeleting,
}) {
  const itemCount = order.items?.length || 0;
  const itemSummary = order.items?.slice(0, 2).map((it, i) => (
    <div key={i} style={s.itemLine}>
      <span style={s.itemQty}>{it.qty}×</span>
      <span style={s.itemName}>
        {it.productId?.name ?? it.productId ?? "—"}
      </span>
      {it.color && <span style={s.itemMeta}>{it.color}</span>}
      {it.size && <span style={s.itemMeta}>{it.size}</span>}
    </div>
  ));

  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "#1a2233" : "transparent",
        height: ROW_HEIGHT,
      }}
      onMouseEnter={() => onHover(order._id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* # */}
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>

      {/* Invoice */}
      <td style={s.td}>
        <span style={s.monoText}>{order.invoiceId || "—"}</span>
      </td>

      {/* Customer */}
      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.customerName}>{order.customer?.fullName || "—"}</span>
          <span style={s.customerPhone}>{order.customer?.phone || ""}</span>
        </div>
      </td>

      {/* Address */}
      <td style={s.td}>
        <span style={s.addressText}>{order.customer?.address || "—"}</span>
      </td>

      {/* Payment */}
      <td style={s.td}>
        <PaymentBadge method={order.paymentMethod} />
      </td>

      {/* Items */}
      <td style={s.td}>
        <div style={s.itemsCell}>
          {itemSummary}
          {itemCount > 2 && (
            <span style={s.moreItems}>+{itemCount - 2} more</span>
          )}
        </div>
      </td>

      {/* Note */}
      <td style={s.td}>
        <span style={s.noteText}>{order.note || "—"}</span>
      </td>

      {/* Actions */}
      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={{ ...s.viewBtn, ...(isHovered ? s.viewBtnHover : {}) }}
            onClick={() => onView(order)}
            title="View order details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{
              ...s.deleteBtn,
              ...(isHovered ? s.deleteBtnHover : {}),
              ...(isDeleting ? s.btnDisabled : {}),
            }}
            onClick={() => onDelete(order)}
            disabled={isDeleting}
            title="Delete order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderList() {
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getOrders();
  const orderDeleteMutation = deleteOrder();

  const orders = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [confirmOrder, setConfirmOrder] = useState(null);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.invoiceId?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const VLIST_HEIGHT = 500;
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

  const handleView = (order) =>
    navigate("/order-details", { state: { order } });
  const handleDelete = (order) => setConfirmOrder(order);
  const confirmDelete = () => {
    if (!confirmOrder) return;
    orderDeleteMutation.mutate(confirmOrder.invoiceId, {
      onSuccess: () =>
        toast.success(`Order ${confirmOrder.invoiceId} deleted.`),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed."),
      onSettled: () => setConfirmOrder(null),
    });
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalItems = orders.reduce((n, o) => n + (o.items?.length || 0), 0);
  const codOrders = orders.filter(
    (o) => o.paymentMethod?.toLowerCase() === "cod",
  ).length;
  const uniqueCustomers = new Set(
    orders.map((o) => o.customer?.phone).filter(Boolean),
  ).size;

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading orders…</p>
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
            Failed to load orders.
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
        open={!!confirmOrder}
        invoiceId={confirmOrder?.invoiceId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOrder(null)}
      />

      {/* ── Header ── */}
      <div className="ol-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Orders</span>
          </div>
          <h1 className="ol-title">Orders</h1>
          <p style={s.titleSub}>View and manage customer orders.</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ol-stats">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={orders.length}
          accent="#d97706"
        />
        <StatCard
          icon={Clock}
          label="Total Items"
          value={totalItems}
          accent="#818cf8"
        />
        <StatCard
          icon={Users}
          label="Unique Customers"
          value={uniqueCustomers}
          accent="#34d399"
        />
        <StatCard
          icon={CreditCard}
          label="COD Orders"
          value={codOrders}
          accent="#f87171"
        />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="ol-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <ShoppingBag size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Order List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {orders.length} orders
                {filtered.length !== orders.length && " (filtered)"}
                {" · "}
                <span style={{ color: "#d97706" }}>virtualised</span>
              </div>
            </div>
          </div>
          <div className="ol-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, invoice, payment…"
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
                <col style={{ width: 44 }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "#", key: null },
                    { label: "Invoice", key: "invoiceId" },
                    { label: "Customer", key: null },
                    { label: "Address", key: null },
                    { label: "Payment", key: "paymentMethod" },
                    { label: "Items", key: null },
                    { label: "Note", key: null },
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
                <span style={{ fontSize: 44 }}>🛒</span>
                <p style={s.emptyTitle}>No orders found</p>
                <p style={s.emptyHint}>
                  {search
                    ? "Try a different search term."
                    : "Orders will appear here once customers place them."}
                </p>
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
                      <col style={{ width: 44 }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: 80 }} />
                    </colgroup>
                    <tbody>
                      {visibleItems.map((order, i) => (
                        <OrderRow
                          key={order._id}
                          order={order}
                          index={startIndex + i}
                          isHovered={hoveredRow === order._id}
                          onHover={setHoveredRow}
                          onView={handleView}
                          onDelete={handleDelete}
                          isDeleting={orderDeleteMutation.isPending}
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
        <div className="ol-table-footer">
          Showing{" "}
          <strong style={{ color: "#f3f4f6" }}>{filtered.length}</strong> orders
          {filtered.length !== orders.length && (
            <>
              {" "}
              ·{" "}
              <strong style={{ color: "#d97706" }}>
                {orders.length - filtered.length}
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

  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes dialogIn   { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar       { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#0d0d0d; }
  ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:3px; }

  .ol-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }
  .ol-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 28px;
    flex-wrap: wrap; gap: 16px;
  }
  .ol-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .ol-card-header {
    display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap;
    gap: 14px; padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }
  .ol-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #0d1117; border: 1.5px solid #1f2937;
    border-radius: 10px; padding: 8px 14px; min-width: 280px;
  }
  .ol-table-footer {
    padding: 14px 24px; border-top: 1px solid #1f2937;
    font-size: 12px; color: #4b5563; text-align: right;
  }

  @media (max-width: 900px) {
    .ol-stats { grid-template-columns: repeat(2, 1fr); }
    .ol-card-header { flex-direction: column; align-items: flex-start; padding: 16px 18px; }
    .ol-search-wrap { width: 100%; min-width: unset; }
  }
  @media (max-width: 600px) {
    .ol-title { font-size: 21px; }
    .ol-header { margin-bottom: 18px; }
    .ol-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
    .ol-card-header { padding: 14px; }
    .ol-table-footer { text-align: center; padding: 12px 14px; }
  }
  @media (max-width: 420px) {
    .ol-title { font-size: 18px; }
    .ol-stats { grid-template-columns: 1fr 1fr; }
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
    minWidth: 780,
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 780 },

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
  sortArrow: { color: "#d97706" },

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

  monoText: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    color: "#9ca3af",
    letterSpacing: "0.03em",
  },

  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  customerName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f3f4f6",
    lineHeight: 1.3,
  },
  customerPhone: { fontSize: 11, color: "#6b7280" },

  addressText: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  itemsCell: { display: "flex", flexDirection: "column", gap: 3 },
  itemLine: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
  itemQty: { fontSize: 11, fontWeight: 700, color: "#d97706", flexShrink: 0 },
  itemName: {
    fontSize: 11,
    color: "#9ca3af",
    fontFamily: "'Courier New', monospace",
  },
  itemMeta: {
    fontSize: 10,
    color: "#6b7280",
    background: "#1f2937",
    borderRadius: 4,
    padding: "1px 5px",
  },
  moreItems: { fontSize: 10, color: "#6b7280", marginTop: 1 },

  noteText: {
    fontSize: 12,
    color: "#6b7280",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  actionsCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  viewBtn: {
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
  viewBtnHover: {
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
  emptyHint: { fontSize: 12, color: "#4b5563", margin: 0, textAlign: "center" },

  footerVirt: { color: "#374151", marginLeft: 8, fontStyle: "italic" },

  // ── Dialog ──
  dialogOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1200,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
