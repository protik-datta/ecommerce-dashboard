import { createCategory } from "@/api/api";
import React, { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const AddCategory = () => {
  const categoryMutate = createCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
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
        toast.success("Category created successfully");
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4">
      {/* ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <div className="w-full max-w-5xl backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
            Add New Category
          </h1>
          <p className="text-gray-900 dark:text-white mt-2">
            Fill in the details below to create a new category.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-black dark:text-gray-300">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-900/60 border border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-black dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter category description"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-900/60 border border-gray-700 text-gray-900 dark:text-white  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Image File */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-black dark:text-gray-300">
              Image File
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.image
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-900/60 border border-gray-700 text-gray-900 dark:text-white  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Preview:
                </p>
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-48 h-48 object-cover rounded-2xl border border-gray-700"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={categoryMutate.isPending}
              className="w-full py-4 rounded-2xl font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
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
