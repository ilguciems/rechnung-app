"use client";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
export const useUpload = () => {
  const uploadFn = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(ROUTES.COMPANY_LOGO, {
      method: "POST",
      body: formData,
    });
    return response;
  };
  return useMutation({
    mutationFn: uploadFn,
  });
};
