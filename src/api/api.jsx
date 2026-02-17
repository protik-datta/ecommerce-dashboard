import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
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
