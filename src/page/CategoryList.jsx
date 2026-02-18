import { deleteCategory, getCategory } from "@/api/api";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryTable = () => {
  const { data, isPending, isError } = getCategory();
  const categoryDeleteMutation = deleteCategory();
  
  const categories = data?.data?.data || [];

  const navigate = useNavigate();

  const handleEdit = (cat) => {
    toast.info(`Edit: ${cat.name}`);
  };

  const handleDelete = (slug) => {
    categoryDeleteMutation.mutate(slug, {
      onSuccess: () => toast.success("Category deleted"),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed"),
    });
  };

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Failed to fetch categories</div>;

  return (
    <div className="w-full min-h-screen p-6">
      <div className="w-full rounded-2xl shadow-xl p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage category list (edit / delete).
            </p>
          </div>

          <button
            onClick={() => navigate("/add-category")}
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Name
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Image
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Description
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id || cat._id || cat.slug}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.slug}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {cat.image?.url ? (
                        <img
                          src={cat.image.url}
                          alt={cat.name}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {cat.description || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>

                        <button
                          disabled={categoryDeleteMutation.isPending}
                          onClick={() => handleDelete(cat.slug)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                          {categoryDeleteMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </div>
    </div>
  );
};

export default CategoryTable;
