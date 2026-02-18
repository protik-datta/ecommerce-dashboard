import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddCategory from "./page/AddCategory";

import Page from "./page/dashboard";
import ThemeToggle from "./components/theme-toggle";
import DashboardLayout from "./layout/DashLayout";
import CategoryTable from "./page/CategoryList";
import AddProduct from "./page/AddProduct";
import ProductList from "./page/ProductList";
import OrderList from "./page/OrderList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/home" element={<Page />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="category-list" element={<CategoryTable />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="order-list" element={<OrderList />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen ">
                <h1 className="text-4xl font-bold text-center text-red-500 dark:text-red-400">
                  404 Page Not Found
                </h1>
              </div>
            }
          />
        </Route>
      </Routes>
      <ThemeToggle />
    </BrowserRouter>
  );
}
