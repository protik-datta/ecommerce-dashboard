import {
  updateProduct,
  deleteProductImage,
  uploadProductImage,
  getCategory,
} from "@/api/api";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, ArrowLeft, ImagePlus, X, Trash2 } from "lucide-react";

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

// ─── Flag config ──────────────────────────────────────────────────────────────
const FLAGS = [
  {
    key: "isNew",
    label: "New",
    color: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  {
    key: "isSale",
    label: "Sale",
    color: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
  },
  {
    key: "isLimited",
    label: "Limited",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
  },
  {
    key: "isHot",
    label: "Hot",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.25)",
  },
  {
    key: "isFeatured",
    label: "Featured",
    color: "#818cf8",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.25)",
  },
  {
    key: "isBestSelling",
    label: "Best Selling",
    color: "#fbbf24",
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.25)",
  },
];

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <div style={s.sectionCard}>
      <div style={s.sectionHeader}>
        <div style={s.sectionTitle}>{title}</div>
        {subtitle && <div style={s.sectionSubtitle}>{subtitle}</div>}
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div style={s.fieldGroup}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label style={s.label}>{label}</label>
        {hint && <span style={s.hint}>{hint}</span>}
      </div>
      {children}
      {error && <p style={s.errorMsg}>⚠ {error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Product passed from ProductList via navigate("/edit-product", { state: { products: prod } })
  const product = location.state?.products;

  const updateProductMutate = updateProduct();
  const deleteImageMutate = deleteProductImage();
  const uploadImageMutate = uploadProductImage();

  const { data: categoryData, isLoading: categoryLoading } = getCategory();

  // ── Existing images from API ──────────────────────────────────────────────
  const [existingImages, setExistingImages] = useState(product?.image || []);
  // imgID being deleted (for per-button loading state)
  const [deletingImgId, setDeletingImgId] = useState(null);
  // New files to upload
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    brand: product?.brand || "",
    sku: product?.sku || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    category: product?.category?._id || product?.category || "",
    price: product?.price || "",
    discountType: product?.discountType || "fixed",
    discountValue: product?.discountValue || "",
    stock: product?.stock || "",
    totalReviews: product?.totalReviews || "",
    isNew: product?.isNew || false,
    isSale: product?.isSale || false,
    isLimited: product?.isLimited || false,
    isHot: product?.isHot || false,
    isFeatured: product?.isFeatured || false,
    isBestSelling: product?.isBestSelling || false,
    color: product?.color?.join(", ") || "",
    size: product?.size?.join(", ") || "",
  });
  const [errors, setErrors] = useState({});

  if (!product) {
    navigate("/product-list", { replace: true });
    return null;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: checked }));
  };

  const applyNewFiles = (files) => {
    const arr = Array.from(files);
    setNewFiles(arr);
    setNewPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const removeNewFile = (idx) => {
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setNewPreviews((p) => p.filter((_, i) => i !== idx));
  };

  // ── Delete existing image ─────────────────────────────────────────────────
  const handleDeleteImage = (img) => {
    setDeletingImgId(img._id || img.public_id);
    deleteImageMutate.mutate(
      { slug: product.slug, imgID: img._id || img.public_id },
      {
        onSuccess: () => {
          setExistingImages((p) =>
            p.filter(
              (i) => (i._id || i.public_id) !== (img._id || img.public_id),
            ),
          );
          toast.success("Image deleted.");
        },
        onError: (err) =>
          toast.error(
            err?.response?.data?.message || "Failed to delete image.",
          ),
        onSettled: () => setDeletingImgId(null),
      },
    );
  };

  // ── Upload new images ─────────────────────────────────────────────────────
  const handleUploadImages = () => {
    if (!newFiles.length) return;
    const formData = new FormData();
    newFiles.forEach((f) => formData.append("image", f));
    uploadImageMutate.mutate(
      { slug: product.slug, formData },
      {
        onSuccess: (res) => {
          const uploaded = res?.data?.data?.image || [];
          setExistingImages(uploaded);
          setNewFiles([]);
          setNewPreviews([]);
          toast.success(`${newFiles.length} image(s) uploaded successfully.`);
        },
        onError: (err) =>
          toast.error(err?.response?.data?.message || "Image upload failed."),
      },
    );
  };

  // ── Update product info ───────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const colors = formData.color
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const sizes = formData.size
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short description is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "At least 10 characters";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (formData.discountValue && Number(formData.discountValue) < 0)
      newErrors.discountValue = "Cannot be negative";
    if (formData.stock === "" || Number(formData.stock) < 0)
      newErrors.stock = "Stock cannot be negative";
    if (!colors.length) newErrors.color = "Add at least one color";
    if (!sizes.length) newErrors.size = "Add at least one size";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving.");
      return;
    }

    // API: api.put(`/product/update-productinfo/${data.slug}`, data)
    // mutationFn reads data.slug for the URL
    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("brand", formData.brand.trim());
    payload.append("sku", formData.sku.trim());
    payload.append("shortDescription", formData.shortDescription.trim());
    payload.append("description", formData.description.trim());
    payload.append("category", formData.category);
    payload.append("price", Number(formData.price));
    payload.append("discountType", formData.discountType);
    if (formData.discountValue)
      payload.append("discountValue", Number(formData.discountValue));
    payload.append("stock", Number(formData.stock));
    if (formData.totalReviews)
      payload.append("totalReviews", Number(formData.totalReviews));
    payload.append("isNew", formData.isNew);
    payload.append("isSale", formData.isSale);
    payload.append("isLimited", formData.isLimited);
    payload.append("isHot", formData.isHot);
    payload.append("isFeatured", formData.isFeatured);
    payload.append("isBestSelling", formData.isBestSelling);
    colors.forEach((c) => payload.append("color[]", c));
    sizes.forEach((sz) => payload.append("size[]", sz));

    // Attach slug for mutationFn to read data.slug
    payload.slug = product.slug;

    updateProductMutate.mutate(payload, {
      onSuccess: () => {
        toast.success("Product updated successfully!");
        setTimeout(() => navigate("/product-list"), 1200);
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Update failed."),
    });
  };

  const isPending = updateProductMutate.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ep-header">
        <div>
          <div style={s.breadcrumb}>
            <span
              style={s.breadcrumbLink}
              onClick={() => navigate("/products")}
            >
              Dashboard
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span
              style={s.breadcrumbLink}
              onClick={() => navigate("/products")}
            >
              Products
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Edit</span>
          </div>
          <h1 className="ep-title">Edit Product</h1>
          <p style={s.titleSub}>
            Editing&nbsp;
            <span style={{ color: "#d97706", fontWeight: 600 }}>
              {product.name}
            </span>
            {product.sku && (
              <span style={s.skuInline}>&nbsp;·&nbsp;{product.sku}</span>
            )}
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="ep-back-btn">
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        {/* ── 1. Basic Info ── */}
        <SectionCard title="Basic Information" subtitle="Core product identity">
          <div className="ep-grid-2">
            <Field label="Product Name *" error={errors.name}>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
              />
            </Field>
            <Field label="Brand *" error={errors.brand}>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                style={{ ...s.input, ...(errors.brand ? s.inputError : {}) }}
              />
            </Field>
            <Field label="SKU *" error={errors.sku}>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                style={{ ...s.input, ...(errors.sku ? s.inputError : {}) }}
              />
            </Field>
            <Field label="Category *" error={errors.category}>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  ...s.input,
                  ...(errors.category ? s.inputError : {}),
                  cursor: "pointer",
                }}
              >
                <option value="">
                  {categoryLoading ? "Loading…" : "Select a category"}
                </option>
                {categoryData?.data?.data?.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* ── 2. Descriptions ── */}
        <SectionCard
          title="Descriptions"
          subtitle="Product copy for listings and detail pages"
        >
          <div className="ep-grid-2">
            <Field
              label="Short Description *"
              error={errors.shortDescription}
              hint={`${formData.shortDescription.length} chars`}
            >
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                style={{
                  ...s.textarea,
                  height: 90,
                  ...(errors.shortDescription ? s.inputError : {}),
                }}
              />
            </Field>
            <Field
              label="Full Description *"
              error={errors.description}
              hint={`${formData.description.length} chars`}
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{
                  ...s.textarea,
                  height: 90,
                  ...(errors.description ? s.inputError : {}),
                }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── 3. Pricing & Stock ── */}
        <SectionCard
          title="Pricing & Stock"
          subtitle="Price, inventory and discount"
        >
          <div className="ep-grid-3">
            <Field label="Price ($) *" error={errors.price}>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={{ ...s.input, ...(errors.price ? s.inputError : {}) }}
              />
            </Field>
            <Field label="Stock *" error={errors.stock}>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                style={{ ...s.input, ...(errors.stock ? s.inputError : {}) }}
              />
            </Field>
            <Field label="Total Reviews" error={errors.totalReviews}>
              <input
                type="number"
                name="totalReviews"
                value={formData.totalReviews}
                onChange={handleChange}
                min="0"
                style={{
                  ...s.input,
                  ...(errors.totalReviews ? s.inputError : {}),
                }}
              />
            </Field>
            <Field label="Discount Type">
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                style={{ ...s.input, cursor: "pointer" }}
              >
                <option value="fixed">Fixed ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </Field>
            <Field label="Discount Value" error={errors.discountValue}>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0"
                style={{
                  ...s.input,
                  ...(errors.discountValue ? s.inputError : {}),
                }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── 4. Variants ── */}
        <SectionCard
          title="Variants"
          subtitle="Colors and sizes — comma separated"
        >
          <div className="ep-grid-2">
            <Field
              label="Colors *"
              error={errors.color}
              hint="e.g. Red, Blue, Black"
            >
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Red, Blue, Black…"
                style={{ ...s.input, ...(errors.color ? s.inputError : {}) }}
              />
              {formData.color && (
                <div style={s.tagRow}>
                  {formData.color
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((c, i) => (
                      <span
                        key={i}
                        style={{
                          ...s.tag,
                          background: "rgba(16,185,129,0.1)",
                          color: "#34d399",
                          border: "1px solid rgba(16,185,129,0.25)",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                </div>
              )}
            </Field>
            <Field label="Sizes *" error={errors.size} hint="e.g. S, M, L, XL">
              <input
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="S, M, L, XL…"
                style={{ ...s.input, ...(errors.size ? s.inputError : {}) }}
              />
              {formData.size && (
                <div style={s.tagRow}>
                  {formData.size
                    .split(",")
                    .map((sz) => sz.trim())
                    .filter(Boolean)
                    .map((sz, i) => (
                      <span
                        key={i}
                        style={{
                          ...s.tag,
                          background: "rgba(129,140,248,0.1)",
                          color: "#818cf8",
                          border: "1px solid rgba(129,140,248,0.25)",
                        }}
                      >
                        {sz}
                      </span>
                    ))}
                </div>
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ── 5. Flags ── */}
        <SectionCard
          title="Product Flags"
          subtitle="Toggle labels to highlight this product"
        >
          <div className="ep-grid-flags">
            {FLAGS.map((f) => (
              <label
                key={f.key}
                style={{
                  ...s.flagLabel,
                  ...(formData[f.key]
                    ? {
                        background: f.bg,
                        borderColor: f.border,
                        color: f.color,
                      }
                    : {}),
                }}
                className="ep-flag"
              >
                <input
                  type="checkbox"
                  name={f.key}
                  checked={formData[f.key]}
                  onChange={handleCheckbox}
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    ...s.flagDot,
                    background: formData[f.key] ? f.color : "#374151",
                  }}
                />
                {f.label}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ── 6. Images ── */}
        <SectionCard
          title="Product Images"
          subtitle="Manage existing images or upload new ones"
        >
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={s.imgSectionLabel}>Current Images</div>
              <div className="ep-image-grid">
                {existingImages.map((img, i) => {
                  const id = img._id || img.public_id;
                  const isDeleting = deletingImgId === id;
                  return (
                    <div key={id || i} style={s.existingImgWrap}>
                      <img
                        src={img.url}
                        alt={`img-${i}`}
                        style={s.existingImg}
                      />
                      <button
                        type="button"
                        style={{
                          ...s.imgDeleteBtn,
                          ...(isDeleting ? s.btnDisabled : {}),
                        }}
                        disabled={isDeleting}
                        onClick={() => handleDeleteImage(img)}
                        title="Delete image"
                      >
                        {isDeleting ? (
                          <span style={s.miniSpinner} />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload new images */}
          <div style={s.imgSectionLabel}>Upload New Images</div>
          {newPreviews.length === 0 ? (
            <div
              style={s.dropzone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                applyNewFiles(e.dataTransfer.files);
              }}
            >
              <div style={s.dropIcon}>
                <ImagePlus size={22} color="#d97706" />
              </div>
              <p style={s.dropText}>
                <strong style={{ color: "#d97706" }}>Click to upload</strong> or
                drag & drop
              </p>
              <p style={s.dropHint}>JPG, PNG, WEBP — multiple files allowed</p>
            </div>
          ) : (
            <div>
              <div className="ep-image-grid" style={{ marginBottom: 12 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={s.existingImgWrap}>
                    <img src={src} alt={`new-${i}`} style={s.existingImg} />
                    <button
                      type="button"
                      style={s.imgDeleteBtn}
                      onClick={() => removeNewFile(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div
                  style={s.addMoreTile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={18} color="#6b7280" />
                  <span
                    style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}
                  >
                    Add more
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={uploadImageMutate.isPending}
                onClick={handleUploadImages}
                style={{
                  ...s.uploadBtn,
                  ...(uploadImageMutate.isPending ? s.btnDisabled : {}),
                }}
              >
                {uploadImageMutate.isPending ? (
                  <>
                    <span style={s.spinner} /> Uploading…
                  </>
                ) : (
                  `Upload ${newFiles.length} image${newFiles.length > 1 ? "s" : ""}`
                )}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => applyNewFiles(e.target.files)}
            style={{ display: "none" }}
          />
        </SectionCard>

        {/* ── Submit row ── */}
        <div style={s.submitRow}>
          <span style={s.footerHint}>
            Updating:{" "}
            <strong style={{ color: "#f3f4f6" }}>{product.name}</strong>
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={s.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="ep-submit-btn"
              style={{ ...s.submitBtn, ...(isPending ? s.submitDisabled : {}) }}
            >
              {isPending ? (
                <>
                  <span style={s.spinner} /> Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }

  *, *::before, *::after { box-sizing: border-box; }

  .ep-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }
  .ep-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 28px;
    flex-wrap: wrap; gap: 16px;
  }
  .ep-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.04); border: 1px solid #1f2937;
    color: #9ca3af; border-radius: 11px; padding: 10px 18px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
    transition: background 0.2s, color 0.2s;
  }
  .ep-back-btn:hover { background: rgba(255,255,255,0.07); color: #f3f4f6; }

  .ep-grid-2     { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
  .ep-grid-3     { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .ep-grid-flags { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .ep-image-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }

  .ep-flag { cursor: pointer; transition: all 0.18s ease; }
  .ep-flag:hover { border-color: rgba(217,119,6,0.4) !important; background: rgba(217,119,6,0.06) !important; }
  .ep-submit-btn:hover:not(:disabled) { opacity: 0.88; }

  @media (max-width: 860px) {
    .ep-grid-3     { grid-template-columns: repeat(2,1fr); }
    .ep-grid-flags { grid-template-columns: repeat(2,1fr); }
    .ep-image-grid { grid-template-columns: repeat(4,1fr); }
  }
  @media (max-width: 640px) {
    .ep-title      { font-size: 22px; }
    .ep-grid-2     { grid-template-columns: 1fr; }
    .ep-grid-3     { grid-template-columns: 1fr; }
    .ep-grid-flags { grid-template-columns: repeat(2,1fr); }
    .ep-image-grid { grid-template-columns: repeat(3,1fr); }
    .ep-back-btn span { display: none; }
    .ep-back-btn { padding: 10px 12px; }
  }
  @media (max-width: 420px) {
    .ep-title      { font-size: 18px; }
    .ep-image-grid { grid-template-columns: repeat(2,1fr); }
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
  skuInline: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#4b5563",
  },

  sectionCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    overflow: "hidden",
    animation: "slideUp 0.4s ease",
  },
  sectionHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#f3f4f6" },
  sectionSubtitle: { fontSize: 12, color: "#6b7280" },
  sectionBody: { padding: "24px" },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  hint: { fontSize: 11, color: "#374151" },
  errorMsg: { fontSize: 12, color: "#f87171", margin: 0 },

  input: {
    width: "100%",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#f3f4f6",
    outline: "none",
    transition: "border-color 0.2s",
    appearance: "none",
  },
  textarea: {
    width: "100%",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#f3f4f6",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    transition: "border-color 0.2s",
  },
  inputError: { borderColor: "rgba(239,68,68,0.5)" },

  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },

  flagLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #1f2937",
    background: "#0d1117",
    fontSize: 13,
    fontWeight: 500,
    color: "#9ca3af",
    userSelect: "none",
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.2s",
  },

  imgSectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 12,
  },

  existingImgWrap: { position: "relative", aspectRatio: "1" },
  existingImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 10,
    border: "1.5px solid #1f2937",
  },
  imgDeleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(239,68,68,0.9)",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    transition: "opacity 0.2s",
  },
  miniSpinner: {
    display: "inline-block",
    width: 10,
    height: 10,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  dropzone: {
    border: "1.5px dashed #1f2937",
    borderRadius: 12,
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    textAlign: "center",
    background: "#0d1117",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dropText: { fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 },
  dropHint: { fontSize: 11, color: "#374151", margin: 0 },

  addMoreTile: {
    aspectRatio: "1",
    border: "1.5px dashed #1f2937",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "#0d1117",
    transition: "border-color 0.2s",
    minHeight: 60,
  },

  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(217,119,6,0.12)",
    border: "1px solid rgba(217,119,6,0.3)",
    color: "#d97706",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
  },

  submitRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    gap: 16,
    flexWrap: "wrap",
    animation: "slideUp 0.5s ease",
  },
  footerHint: { fontSize: 12, color: "#4b5563" },
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    color: "#9ca3af",
    borderRadius: 11,
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#d97706",
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "11px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
    whiteSpace: "nowrap",
  },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle",
  },

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
