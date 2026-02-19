import { useState } from "react";
import {
  Package,
  ShoppingBag,
  CreditCard,
  Phone,
  MapPin,
  FileText,
  Hash,
  Eye,
} from "lucide-react";
import { getOrders } from "@/api/api";
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
  info: { bg: "#1e1b4b", color: "#a5b4fc", border: "#3730a3", icon: "ℹ" },
};
function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={st.toastStack}>
      {toasts.map((t) => {
        const m = TOAST_META[t.type] || TOAST_META.success;
        return (
          <div
            key={t.id}
            style={{
              ...st.toast,
              background: m.bg,
              color: m.color,
              borderColor: m.border,
            }}
          >
            <span style={st.toastIcon}>{m.icon}</span>
            <span style={st.toastMsg}>{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              style={{ ...st.toastClose, color: m.color }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment badge ────────────────────────────────────────────────────────────
const PAYMENT_STYLES = {
  cash: {
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    border: "rgba(16,185,129,0.25)",
  },
  card: {
    bg: "rgba(99,102,241,0.12)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.25)",
  },
  bkash: {
    bg: "rgba(236,72,153,0.12)",
    color: "#f472b6",
    border: "rgba(236,72,153,0.25)",
  },
  nagad: {
    bg: "rgba(251,146,60,0.12)",
    color: "#fb923c",
    border: "rgba(251,146,60,0.25)",
  },
  default: {
    bg: "rgba(217,119,6,0.12)",
    color: "#fbbf24",
    border: "rgba(217,119,6,0.25)",
  },
};
function paymentStyle(method) {
  return PAYMENT_STYLES[(method || "").toLowerCase()] || PAYMENT_STYLES.default;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={st.statCard}>
      <div style={{ ...st.statIcon, background: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={st.statValue}>{value}</div>
        <div style={st.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderList() {
  const { data, isPending, isError } = getOrders();
  const navigate = useNavigate();
  const toast = useToast();
  const orders = data?.data?.data || [];

  const [hoveredRow, setHoveredRow] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.invoiceId?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q)
    );
  });

  const handleViewMore = (order) => {
    navigate(`/orders/${order.invoiceId}`, { state: { order } });
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={st.page}>
        <style>{css}</style>
        <div style={st.centerState}>
          <div style={st.spinner} />
          <p style={st.stateText}>Loading orders…</p>
        </div>
      </div>
    );
  if (isError)
    return (
      <div style={st.page}>
        <style>{css}</style>
        <div style={st.centerState}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ ...st.stateText, color: "#f87171" }}>
            Failed to load orders.
          </p>
        </div>
      </div>
    );

  const totalItems = orders.reduce((s, o) => s + (o.items?.length || 0), 0);
  const cashOrders = orders.filter(
    (o) => o.paymentMethod?.toLowerCase() === "cash",
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={st.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div style={st.header}>
        <div>
          <div style={st.breadcrumb}>
            <span style={st.breadcrumbLink}>Dashboard</span>
            <span style={st.breadcrumbSep}>/</span>
            <span style={st.breadcrumbCurrent}>Orders</span>
          </div>
          <h1 className="ol-title">Orders</h1>
          <p style={st.titleSub}>View and manage all customer orders.</p>
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
          icon={Package}
          label="Total Items"
          value={totalItems}
          accent="#818cf8"
        />
        <StatCard
          icon={CreditCard}
          label="Cash Orders"
          value={cashOrders}
          accent="#34d399"
        />
      </div>

      {/* ── Table Card ── */}
      <div style={st.card}>
        <div className="ol-card-header">
          <div style={st.cardTitleWrap}>
            <span style={st.cardIcon}>
              <ShoppingBag size={18} />
            </span>
            <div>
              <div style={st.cardTitle}>Order List</div>
              <div style={st.cardSubtitle}>{orders.length} orders total</div>
            </div>
          </div>
          <div className="ol-search-wrap">
            <span style={st.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, invoice…"
              style={st.searchInput}
            />
          </div>
        </div>

        <div style={st.tableWrap}>
          <table style={st.table}>
            <thead>
              <tr>
                {[
                  { icon: <Hash size={12} />, label: "#" },
                  { icon: null, label: "Customer" },
                  { icon: <Phone size={12} />, label: "Phone" },
                  { icon: <MapPin size={12} />, label: "Address" },
                  { icon: <FileText size={12} />, label: "Note" },
                  { icon: <CreditCard size={12} />, label: "Payment" },
                  { icon: <Package size={12} />, label: "Items" },
                  { icon: null, label: "Actions" },
                ].map(({ icon, label }) => (
                  <th
                    key={label}
                    style={{
                      ...st.th,
                      ...(label === "Actions" ? { textAlign: "center" } : {}),
                    }}
                  >
                    {icon && <span style={st.thIcon}>{icon}</span>}
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={st.emptyCell}>
                    <div style={st.emptyState}>
                      <span style={{ fontSize: 40 }}>📭</span>
                      <p style={st.emptyTitle}>No orders found</p>
                      <p style={st.emptyHint}>
                        {search
                          ? "Try a different search term."
                          : "Orders will appear here once placed."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order, index) => {
                  const isHovered = hoveredRow === order._id;
                  const pmStyle = paymentStyle(order.paymentMethod);
                  return (
                    <tr
                      key={order._id}
                      style={{
                        ...st.tr,
                        background: isHovered ? "#1a2233" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredRow(order._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* # */}
                      <td style={st.td}>
                        <span style={st.indexBadge}>{index + 1}</span>
                      </td>

                      {/* Customer */}
                      <td style={st.td}>
                        <div style={st.customerCell}>
                          <div style={st.avatar}>
                            {(order.customer?.fullName || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={st.customerName}>
                              {order.customer?.fullName}
                            </div>
                            <div style={st.invoiceId}>{order.invoiceId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={st.td}>
                        <span style={st.monoText}>
                          {order.customer?.phone || "—"}
                        </span>
                      </td>

                      {/* Address */}
                      <td style={{ ...st.td, maxWidth: 180 }}>
                        <span style={st.addressText}>
                          {order.customer?.address || "—"}
                        </span>
                      </td>

                      {/* Note */}
                      <td style={{ ...st.td, maxWidth: 140 }}>
                        {order.note ? (
                          <span style={st.noteText}>{order.note}</span>
                        ) : (
                          <span style={st.dash}>—</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td style={st.td}>
                        <span
                          style={{
                            ...st.paymentBadge,
                            background: pmStyle.bg,
                            color: pmStyle.color,
                            border: `1px solid ${pmStyle.border}`,
                          }}
                        >
                          {order.paymentMethod || "N/A"}
                        </span>
                      </td>

                      {/* Items — show count only, details on detail page */}
                      <td style={st.td}>
                        <div style={st.itemsSummary}>
                          <span style={st.itemsCount}>
                            {order.items?.length || 0}
                          </span>
                          <span style={st.itemsLabel}>
                            {order.items?.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>

                      {/* Actions — View More */}
                      <td style={{ ...st.td, textAlign: "center" }}>
                        <button
                          onClick={() => handleViewMore(order)}
                          style={{
                            ...st.viewBtn,
                            ...(isHovered ? st.viewBtnHover : {}),
                          }}
                          title="View order details"
                        >
                          <Eye size={14} />
                          <span style={st.viewBtnLabel}>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="ol-table-footer">
            Showing{" "}
            <strong style={{ color: "#f3f4f6" }}>{filtered.length}</strong> of{" "}
            <strong style={{ color: "#f3f4f6" }}>{orders.length}</strong> orders
          </div>
        )}
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
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#0d0d0d; }
  ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:3px; }

  .ol-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb; letter-spacing: -0.02em;
  }
  .ol-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .ol-card-header {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 14px; padding: 20px 24px; border-bottom: 1px solid #1f2937;
  }
  .ol-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #0d1117; border: 1.5px solid #1f2937;
    border-radius: 10px; padding: 8px 14px; min-width: 260px; flex: 0 0 auto;
  }
  .ol-table-footer {
    padding: 14px 24px; border-top: 1px solid #1f2937;
    font-size: 12px; color: #4b5563; text-align: right;
  }
  @media (max-width: 768px) {
    .ol-card-header { flex-direction: column; align-items: flex-start; padding: 16px 18px; gap: 12px; }
    .ol-search-wrap { width: 100%; min-width: unset; }
  }
  @media (max-width: 600px) {
    .ol-title { font-size: 22px; }
    .ol-stats { gap: 8px; margin-bottom: 18px; }
    .ol-card-header { padding: 14px; }
    .ol-table-footer { padding: 12px 14px; text-align: center; }
  }
  @media (max-width: 420px) {
    .ol-title { font-size: 19px; }
    .ol-stats { grid-template-columns: 1fr; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = {
  page: {
    minHeight: "100vh",
    background: "#0d0d0d",
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
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
    fontSize: 24,
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

  tableWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 720 },
  th: {
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    background: "#0d1117",
    borderBottom: "1px solid #1f2937",
    whiteSpace: "nowrap",
    display: "revert",
  },
  thIcon: {
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "middle",
    marginRight: 5,
    opacity: 0.6,
  },
  tr: {
    borderBottom: "1px solid #1a2233",
    transition: "background 0.15s ease",
  },
  td: {
    padding: "14px 16px",
    fontSize: 13,
    color: "#d1d5db",
    verticalAlign: "middle",
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
  customerCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg, #92400e, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  customerName: { fontSize: 13, fontWeight: 600, color: "#f3f4f6" },
  invoiceId: {
    fontSize: 11,
    color: "#4b5563",
    fontFamily: "monospace",
    marginTop: 2,
  },
  monoText: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#9ca3af",
    letterSpacing: "0.02em",
  },
  addressText: {
    fontSize: 12,
    color: "#9ca3af",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  noteText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  dash: { color: "#374151" },
  paymentBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  // Items summary (compact)
  itemsSummary: { display: "flex", alignItems: "baseline", gap: 4 },
  itemsCount: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: "#d97706",
  },
  itemsLabel: { fontSize: 11, color: "#6b7280" },

  // View More button
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.25)",
    color: "#d97706",
    borderRadius: 9,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s, transform 0.15s",
    whiteSpace: "nowrap",
  },
  viewBtnHover: { background: "rgba(217,119,6,0.2)", transform: "scale(1.04)" },
  viewBtnLabel: { fontSize: 12 },

  emptyCell: { padding: "60px 24px" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: "#9ca3af", margin: 0 },
  emptyHint: { fontSize: 12, color: "#4b5563", margin: 0 },

  // Toast
  toastStack: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1100,
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
