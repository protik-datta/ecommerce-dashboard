import { createCategory } from "@/api/api";
import React, { useMemo, useState } from "react";

const AddCategory = () => {
  // assuming createCategory() returns a mutation object
  const categoryMutate = createCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null, // File | null
  });

  const [errors, setErrors] = useState({});

  // preview url
  const previewUrl = useMemo(() => {
    if (!formData.image) return "";
    return URL.createObjectURL(formData.image);
  }, [formData.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters";

    if (!formData.image) newErrors.image = "Image is required";
    else {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(formData.image.type))
        newErrors.image = "Only JPG/PNG/WEBP allowed";
      const maxSizeMB = 3;
      if (formData.image.size > maxSizeMB * 1024 * 1024)
        newErrors.image = `Image must be under ${maxSizeMB}MB`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // make multipart/form-data
    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("description", formData.description.trim());
    payload.append("image", formData.image);

    categoryMutate.mutate(payload, {
      onSuccess: () => {
        // reset
        setFormData({ name: "", description: "", image: null });
        setErrors({});
      },
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start max-w-4xl">
      <div className="w-full rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Add New Category
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Fill in the details below to create a new category.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter category description"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Image FILE */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image File
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.image
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition`}
            />

            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}

            {/* preview */}
            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Preview:
                </p>
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-40 h-40 object-cover rounded-xl border"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={categoryMutate.isPending}
              className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {categoryMutate.isPending ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
