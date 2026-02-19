import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const api = axios.create({
  baseURL: "https://furniturebackend-0hrb.onrender.com/api/v1",
});

// create category
export const createCategory = () => {
  return useMutation({
    mutationFn: (data) => {
      return api.post("/categories/create-category", data);
    },
    onSuccess: (data) => {
      console.log(data);
      //   queryClient.invalidateQueries({
      //     queryKey: ["categories"],
      //   });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// get category
export const getCategory = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      return api.get("/categories/get-category");
    },
  });
};

// delete category
export const deleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => {
      return api.delete(`/categories/delete-category/${slug}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// add product
export const createProduct = () => {
  return useMutation({
    mutationFn: (data) => {
      return api.post("/product/create-product", data);
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// get products
export const getProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => {
      return api.get("/product/get-products");
    },
  });
};

// delete product
export const deleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => {
      return api.delete(`/product/delete-product/${slug}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    }
  })
}

// order list
export const getOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => {
      return api.get("/order/get-orders");
    }
  })
}

// delete order
export const deleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invID) => {
      return api.delete(`/order/delete-order/${invID}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ['orders']
      })
    },
    onError: (error) => {
      console.log(error);
    }
  })
}