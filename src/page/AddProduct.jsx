import { createProduct , getCategory } from "@/api/api";
import React, { useState } from "react";

const AddProduct = () => {
  // api function
  const productMutate = createProduct();

  // fetch categories for dropdown
  const { data: categoryData, isLoading: categoryLoading } = getCategory();

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
    image: [],
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
      image: files,
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

    if (!formData.image.length)
      newErrors.image = "At least one image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // payload
    // const payload = new FormData();

    // payload.append("name", formData.name.trim());
    // payload.append("brand", formData.brand.trim());
    // payload.append("sku", formData.sku.trim());
    // payload.append("shortDescription", formData.shortDescription.trim());
    // payload.append("description", formData.description.trim());
    // payload.append("category", formData.category.trim());
    // payload.append("price", Number(formData.price));
    // payload.append("discountType", formData.discountType);

    // if (formData.discountValue) {
    //   payload.append("discountValue", Number(formData.discountValue));
    // }

    // payload.append("stock", Number(formData.stock));

    // if (formData.totalReviews) {
    //   payload.append("totalReviews", Number(formData.totalReviews));
    // }

    // payload.append("isNew", formData.isNew ? "true" : "false");
    // payload.append("isSale", formData.isSale ? "true" : "false");
    // payload.append("isLimited", formData.isLimited ? "true" : "false");
    // payload.append("isHot", formData.isHot ? "true" : "false");
    // payload.append("isFeatured", formData.isFeatured ? "true" : "false");
    // payload.append("isBestSelling", formData.isBestSelling ? "true" : "false");

    // colorsArray.forEach((color) => payload.append("color[]", color));
    // sizesArray.forEach((size) => payload.append("size[]", size));
    // formData.image.forEach((image) => payload.append("image", image));

    // productMutate.mutate(payload, {
    //   onSuccess: (data) => {
    //     console.log("API Success:", data);

    //     setFormData({
    //       name: "",
    //       brand: "",
    //       sku: "",
    //       shortDescription: "",
    //       description: "",
    //       category: "",
    //       price: "",
    //       discountType: "fixed",
    //       discountValue: "",
    //       stock: "",
    //       totalReviews: "",
    //       isNew: false,
    //       isSale: false,
    //       isLimited: false,
    //       isHot: false,
    //       isFeatured: false,
    //       isBestSelling: false,
    //       color: "",
    //       size: "",
    //       image: [],
    //     });

    //     setImagePreviews([]);
    //   },
    //   onError: (error) => {
    //     console.log("API Error:", error);
    //   },
    // });

    console.log("Submitting product:", formData);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-start py-5 pr-10">
      <div className="w-full max-w-5xl backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
            Create New Product
          </h2>
          <p className="text-gray-900 dark:text-white mt-2">
            Add product details with complete configuration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Product Name", name: "name", type: "text" },
              { label: "Brand", name: "brand", type: "text" },
              { label: "SKU", name: "sku", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                {error[field.name] && (
                  <p className="text-red-400 text-sm mt-1">
                    {error[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Select Category"}
                </option>

                {categoryData?.data?.data?.map((cat,index) => (
                  <option key={index} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {error.category && (
                <p className="text-red-400 text-sm mt-1">{error.category}</p>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Short Description", name: "shortDescription" },
              { label: "Full Description", name: "description" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
                {error[field.name] && (
                  <p className="text-red-400 text-sm mt-1">
                    {error[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Price", name: "price" },
              { label: "Stock", name: "stock" },
              { label: "Total Reviews", name: "totalReviews" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                {error[field.name] && (
                  <p className="text-red-400 text-sm mt-1">
                    {error[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                Discount Type
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {error.discountValue && (
                <p className="text-red-400 text-sm mt-1">
                  {error.discountValue}
                </p>
              )}
            </div>
          </div>

          {/* Colors & Sizes */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Colors (comma separated)", name: "color" },
              { label: "Sizes (comma separated)", name: "size" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {error[field.name] && (
                  <p className="text-red-400 text-sm mt-1">
                    {error[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Flags */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-300 mb-3">
              Product Flags
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "isNew",
                "isSale",
                "isLimited",
                "isHot",
                "isFeatured",
                "isBestSelling",
              ].map((flag) => (
                <label
                  key={flag}
                  className="flex items-center gap-3 bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500 transition"
                >
                  <input
                    type="checkbox"
                    name={flag}
                    checked={formData[flag]}
                    onChange={handleCheckboxChange}
                    className="accent-indigo-500"
                  />
                  <span className="text-black dark:text-gray-300 text-sm">
                    {flag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
              Product Images
            </label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full text-gray-400 file:bg-indigo-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:cursor-pointer hover:file:bg-indigo-700"
            />

            {error.image && (
              <p className="text-red-400 text-sm mt-1">{error.image}</p>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {imagePreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="preview"
                    className="w-full h-32 object-cover rounded-xl border border-gray-700"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={productMutate.isPending}
              className="w-full py-4 rounded-2xl font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              {productMutate.isPending ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
