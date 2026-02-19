import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashLayout";
import ThemeToggle from "./components/theme-toggle";

// Lazy Loaded Pages
const Page = lazy(() => import("./page/dashboard"));
const AddCategory = lazy(() => import("./page/AddCategory"));
const CategoryTable = lazy(() => import("./page/CategoryList"));
const EditCategory = lazy(() => import("./page/EditCategory"));
const AddProduct = lazy(() => import("./page/AddProduct"));
const ProductList = lazy(() => import("./page/ProductList"));
const OrderList = lazy(() => import("./page/OrderList"));
const OrderDetails = lazy(() => import("./page/OrderDetails"));
const EditProduct = lazy(() => import("./page/EditProduct"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg font-semibold animate-pulse">
              Loading...
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="home" element={<Page />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="category-list" element={<CategoryTable />} />
            <Route path="edit-category" element={<EditCategory />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="order-list" element={<OrderList />} />
            <Route path="order-details" element={<OrderDetails />} />
            <Route path="edit-product" element={<EditProduct />} />

            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <h1 className="text-4xl font-bold text-red-500 dark:text-red-400">
                    404 Page Not Found
                  </h1>
                </div>
              }
            />
          </Route>
        </Routes>
      </Suspense>

      <ThemeToggle />
    </BrowserRouter>
  );
}
