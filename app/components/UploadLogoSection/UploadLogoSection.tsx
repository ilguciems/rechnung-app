"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCompanyLogo } from "@/hooks";
import { useSession } from "@/lib/auth-client";
import { type UploadData, uploadSchema } from "@/lib/zod-schema";
import ImageWithFallback from "./ImageWithFallback";
import { useUpload } from "./useUpload";

export default function UploadLogoSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadData>({
    resolver: zodResolver(uploadSchema),
  });

  const queryClient = useQueryClient();

  const [cacheBuster, setCacheBuster] = useState<number | null>(null);

  const { data: logo, isLoading } = useCompanyLogo();

  const logoUrl =
    logo?.logoUrl || `/assets/logo_${userId}.png?ts=${cacheBuster}`;

  useEffect(() => {
    setCacheBuster(Date.now());
  }, []);

  const { mutate: upload, isPending } = useUpload();

  const onSubmit = (data: UploadData) => {
    upload(data.file[0], {
      onSuccess: () => {
        setCacheBuster(Date.now());
        queryClient.invalidateQueries({ queryKey: ["company-logo"] });
        toast.success("Logo hochgeladen!");
      },
      onError: () => toast.error("Fehler beim Hochladen des Logos"),
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex flex-col items-center sm:w-60 w-full">
          <div className="sm:w-60 w-full h-28 rounded border border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-sm">
            {!isLoading && (
              <ImageWithFallback
                src={logoUrl}
                fallBackSrc={`/assets/noimage.png?ts=${cacheBuster}`}
                height={0}
                alt="Logo"
                className="object-contain h-50 w-50"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Aktuelles Logo</p>
        </div>
        <div className="flex flex-col w-full">
          <label
            htmlFor="file"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Neues Logo hochladen
          </label>

          <input
            {...register("file")}
            id="file"
            type="file"
            accept="image/png"
            className="
          border border-gray-300 
          p-2 rounded-md bg-white
          text-sm
          file:mr-3 file:py-1 file:px-3
          file:border file:border-gray-300
          file:bg-gray-100 file:text-gray-700
          cursor-pointer 
        "
          />
          {errors.file?.message && (
            <p className="text-red-600 text-xs mt-1 font-medium">
              {errors.file.message as string}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="
          mt-3
          bg-blue-600 hover:bg-blue-700
          text-white
          py-2 rounded-md
          text-sm font-medium
          transition
          disabled:bg-blue-300 disabled:cursor-not-allowed
        "
          >
            {isPending ? "Hochladen..." : "Hochladen"}
          </button>
        </div>
      </div>
    </form>
  );
}
