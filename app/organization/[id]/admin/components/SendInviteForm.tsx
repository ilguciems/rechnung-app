"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField } from "@/app/components";
import { useSendInvite } from "@/hooks";
import { type SendInviteType, sendInviteSchema } from "@/lib/zod-schema";

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
    <section className="border border-gray-100 p-4 rounded-xl dark:bg-black dark:border-gray-700">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">Einladung senden</h2>
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
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={createInvoice.isPending}
          >
            {createInvoice.isPending ? "Lade..." : "Einladung senden"}
          </Button>
        </form>
      </div>
    </section>
  );
}
