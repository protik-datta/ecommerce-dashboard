import { createProduct } from "@/api/api";
import React, { useState } from "react";

const AddProduct = () => {
  // api function
  const productMutate = createProduct();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    sku: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    discountType: "fixed",
    discountValue: "",
    stock: "",
    totalReviews: "",
    isNew: false,
    isSale: false,
    isLimited: false,
    isHot: false,
    isFeatured: false,
    isBestSelling: false,
    color: "",
    size: "",
    images: [],
  });

  //   error

  const [error, setErrors] = useState({});

  const [imagePreviews, setImagePreviews] = useState([]);

  //   handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //   handle checkboxes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setImagePreviews(previewUrls);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    const newErrors = {};

    // Convert color & size to array at submit time
    const colorsArray = formData.color
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const sizesArray = formData.size
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters";

    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short description is required";

    if (!formData.category.trim()) newErrors.category = "Category is required";

    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";

    if (formData.discountValue) {
      if (Number(formData.discountValue) < 0)
        newErrors.discountValue = "Discount cannot be negative";
    }

    if (!formData.stock || Number(formData.stock) < 0)
      newErrors.stock = "Stock cannot be negative";

    if (formData.totalReviews && Number(formData.totalReviews) < 0)
      newErrors.totalReviews = "Total reviews cannot be negative";

    if (!colorsArray.length) newErrors.color = "Add at least one color";

    if (!sizesArray.length) newErrors.size = "Add at least one size";

    if (!formData.images.length)
      newErrors.images = "At least one image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = new FormData();

    payload.append("name", formData.name.trim());
    payload.append("brand", formData.brand.trim());
    payload.append("sku", formData.sku.trim());
    payload.append("shortDescription", formData.shortDescription.trim());
    payload.append("description", formData.description.trim());
    payload.append("category", formData.category.trim());
    payload.append("price", Number(formData.price));
    payload.append("discountType", formData.discountType);

    if (formData.discountValue) {
      payload.append("discountValue", Number(formData.discountValue));
    }

    payload.append("stock", Number(formData.stock));

    if (formData.totalReviews) {
      payload.append("totalReviews", Number(formData.totalReviews));
    }

    payload.append("isNew", formData.isNew ? "true" : "false");
    payload.append("isSale", formData.isSale ? "true" : "false");
    payload.append("isLimited", formData.isLimited ? "true" : "false");
    payload.append("isHot", formData.isHot ? "true" : "false");
    payload.append("isFeatured", formData.isFeatured ? "true" : "false");
    payload.append("isBestSelling", formData.isBestSelling ? "true" : "false");

    colorsArray.forEach((color) => payload.append("color[]", color));
    sizesArray.forEach((size) => payload.append("size[]", size));
    formData.images.forEach((image) => payload.append("images[]", image));

    productMutate.mutate(payload, {
      onSuccess: (data) => {
        console.log("API Success:", data);

        setFormData({
          name: "",
          brand: "",
          sku: "",
          shortDescription: "",
          description: "",
          category: "",
          price: "",
          discountType: "fixed",
          discountValue: "",
          stock: "",
          totalReviews: "",
          isNew: false,
          isSale: false,
          isLimited: false,
          isHot: false,
          isFeatured: false,
          isBestSelling: false,
          color: "",
          size: "",
          images: [],
        });

        setImagePreviews([]);
      },
      onError: (error) => {
        console.log("API Error:", error);
      },
    });


    console.log("Submitting product:", payload);
  };

  return (
    <div className="p-6 text-white rounded-lg w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.name && <p className="text-red-500">{error.name}</p>}
        </div>

        {/* Brand */}
        <div>
          <label className="block mb-1 font-semibold">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.brand && <p className="text-red-500">{error.brand}</p>}
        </div>

        {/* SKU */}
        <div>
          <label className="block mb-1 font-semibold">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.sku && <p className="text-red-500">{error.sku}</p>}
        </div>

        {/* Short Description */}
        <div>
          <label className="block mb-1 font-semibold">Short Description</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
            rows={4}
          />
          {error.shortDescription && (
            <p className="text-red-500">{error.shortDescription}</p>
          )}
        </div>

        {/* Full Description */}
        <div>
          <label className="block mb-1 font-semibold">Full Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
            rows={4}
          />
          {error.description && (
            <p className="text-red-500">{error.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-semibold">Category ID</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.category && <p className="text-red-500">{error.category}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-semibold">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.price && <p className="text-red-500">{error.price}</p>}
        </div>

        {/* Discount */}
        <div>
          <label className="block mb-1 font-semibold">Discount Type</label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          >
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Discount Value</label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.discountValue && (
            <p className="text-red-500">{error.discountValue}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block mb-1 font-semibold">Stock Quantity</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.stock && <p className="text-red-500">{error.stock}</p>}
        </div>

        {/* Total Reviews */}
        <div>
          <label className="block mb-1 font-semibold">Total Reviews</label>
          <input
            type="number"
            name="totalReviews"
            value={formData.totalReviews}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.totalReviews && (
            <p className="text-red-500">{error.totalReviews}</p>
          )}
        </div>

        {/* Flags */}
        <div>
          <label className="block mb-1 font-semibold">Flags</label>
          <div className="flex flex-wrap gap-4">
            {[
              "isNew",
              "isSale",
              "isLimited",
              "isHot",
              "isFeatured",
              "isBestSelling",
            ].map((flag) => (
              <label key={flag} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={flag}
                  checked={formData[flag]}
                  onChange={handleCheckboxChange}
                />
                {flag}
              </label>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block mb-1 font-semibold">
            Colors (comma separated)
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            placeholder="Red, Green, Blue"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.color && <p className="text-red-500">{error.color}</p>}
        </div>

        {/* Sizes */}
        <div>
          <label className="block mb-1 font-semibold">
            Sizes (comma separated)
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            placeholder="S, M, L"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />
          {error.size && <p className="text-red-500">{error.size}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 font-semibold">Product Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="w-full text-white"
          />
          {Object.keys(error)
            .filter((key) => key.startsWith("images"))
            .map((key) => (
              <p key={key} className="text-red-500">
                {error[key]}
              </p>
            ))}

          {/* Image Preview */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt="preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          {productMutate.isPending ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
