"use client";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
export const useUpload = () => {
  const uploadFn = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(ROUTES.COMPANY_LOGO, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Fehler beim Hochladen des Logos");
    return res;
  };
  return useMutation({
    mutationFn: uploadFn,
  });
};
