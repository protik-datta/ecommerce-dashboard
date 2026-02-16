import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddCategory from "./page/AddCategory";
import ProductList from "./page/ProductList";
import Page from "./page/dashboard";
import ThemeToggle from "./components/theme-toggle";
import DashboardLayout from "./layout/DashLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="add-category" element={<AddCategory />} />
          <Route path="product-list" element={<ProductList />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
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
