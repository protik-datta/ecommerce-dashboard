import React from "react";
import { ToastContainer } from "react-toastify";
import { Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "@/api/api";

const ProductList = () => {
  const navigate = useNavigate();
  const { data, isPending, isError } = getProducts();

  const products = data?.data?.data || [];

  if (isPending)
    return <div className="p-6 text-center">Loading products...</div>;
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">Error loading products</div>
    );

  return (
    <div className="w-full min-h-screen p-6">
      <div className="w-full rounded-2xl shadow-xl p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Products
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage product list (edit / delete).
            </p>
          </div>

          <button
            onClick={() => navigate("/add-product")}
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Add Product
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
                  SKU
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Image
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Price
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Stock
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Flags
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {products?.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products?.map((prod) => (
                  <tr
                    key={prod._id || prod.sku}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {prod.name}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        {prod.sku}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {prod.image?.[0]?.url ? (
                        <img
                          src={prod.image[0].url}
                          alt={prod.name}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        {prod.category?.name || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        ${prod.price}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        {prod.stock === 0 ? (
                          <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                            Out of Stock
                          </span>
                        ) : (
                          prod.stock
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {[
                            {
                              key: "isNew",
                              label: "New",
                              color: "bg-green-600",
                            },
                            {
                              key: "isSale",
                              label: "Sale",
                              color: "bg-red-600",
                            },
                            {
                              key: "isLimited",
                              label: "Limited",
                              color: "bg-yellow-600",
                            },
                            {
                              key: "isHot",
                              label: "Hot",
                              color: "bg-orange-600",
                            },
                            {
                              key: "isFeatured",
                              label: "Featured",
                              color: "bg-blue-600",
                            },
                            {
                              key: "isBestSelling",
                              label: "Best Selling",
                              color: "bg-purple-600",
                            },
                          ].map((flag) =>
                            prod[flag.key] ? (
                              <span
                                key={flag.key}
                                className={`px-2 py-1 text-xs ${flag.color} text-white rounded truncate`}
                                title={flag.label}
                              >
                                {flag.label}
                              </span>
                            ) : null,
                          )}
                        </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => {
                            navigate("/edit-product", {
                              state: { products: prod },
                            });
                          }}
                        >
                          <Edit2 size={16} />
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

export default ProductList;
