"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSendInvite } from "@/hooks";
import { type SendInviteType, sendInviteSchema } from "@/lib/zod-schema";
import { Input, SelectField } from "../../../../components";

export default function SendInviteForm() {
  const { register, handleSubmit, formState, reset } = useForm<SendInviteType>({
    resolver: zodResolver(sendInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const createInvoice = useSendInvite(() => reset());

  const onSubmit = (data: SendInviteType) => {
    createInvoice.mutate(data);
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">Invite senden</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            className="mb-4"
            name="email"
            type="email"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <SelectField
            label="Rolle"
            className="mb-4"
            name="role"
            register={register}
            errors={formState.errors}
            bgWhite
            options={[
              { value: "member", label: "Benutzer" },
              { value: "admin", label: "Administrator" },
            ]}
          />
          <button
            type="submit"
            className="block w-full bg-black text-sm font-medium text-white py-2 rounded mt-4 cursor-pointer hover:bg-black-900"
            disabled={createInvoice.isPending}
          >
            {createInvoice.isPending ? "Lade..." : "Invite senden"}
          </button>
        </form>
      </div>
    </section>
  );
}
