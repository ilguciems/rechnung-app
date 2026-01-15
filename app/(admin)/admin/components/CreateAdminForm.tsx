"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/app/components";
import { createAdminAction } from "../actions/createAdminAction";

const createAdminSchema = z.object({
  email: z.email("Ungültige E-Mail-Adresse"),
  name: z.string().min(2, "Name ist zu kurz"),
});

type CreateAdminValues = z.infer<typeof createAdminSchema>;

export default function CreateAdminForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { email: "", name: "" },
  });

  const onSubmit = async (values: CreateAdminValues) => {
    setLoading(true);
    try {
      await createAdminAction(values);
      toast.success("Admin-Konto erstellt. Aktivierungs-E-Mail gesendet!");
      reset();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error instanceof Error && error.message) ||
          "Fehler beim Erstellen des Admins",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-black" />
            Neuen System-Admin anlegen
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Der Benutzer erhält eine E-Mail mit einem Link zum Festlegen seines
            Passworts.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Vollständiger Name"
            name="name"
            register={register}
            errors={errors}
            bgWhite
          />

          <Input
            label="E-Mail-Adresse"
            name="email"
            type="email"
            register={register}
            errors={errors}
            bgWhite
          />

          <button
            type="submit"
            disabled={loading}
            className={`
            w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all
            ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-black text-white hover:bg-gray-800 shadow-sm border-transparent"
            }
            border
          `}
          >
            {loading ? (
              <LoaderCircle className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Admin einladen
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
