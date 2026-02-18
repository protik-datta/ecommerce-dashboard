import { deleteOrder, getOrders } from "@/api/api";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderList = () => {
  const { data, isPending, isError } = getOrders();
  const orderDeleteMutation = deleteOrder();

  const orders = data?.data?.data || [];

  const handleDelete = (invID) => {
    orderDeleteMutation.mutate(invID, {
      onSuccess: () => {
        toast.success("Order deleted");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Delete failed");
      },
    });
  };

  if (isPending)
    return <div className="p-6 text-center">Loading orders...</div>;
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">Error loading orders</div>
    );

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
        Orders
      </h2>

      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-700 dark:border-gray-600">
        <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-600">
          <thead className="bg-gray-800 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Address
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Note
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200">
                Items
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 dark:bg-gray-800 divide-y divide-gray-700 dark:divide-gray-600">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-300">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-700 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.customer?.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.customer?.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.customer?.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.note || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {order.items?.map((item, i) => (
                      <div key={i} className="mb-1">
                        <span className="font-medium">{item.productId}</span> -{" "}
                        {item.qty} pcs, {item.color}, {item.size}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete(order.invoiceId)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
