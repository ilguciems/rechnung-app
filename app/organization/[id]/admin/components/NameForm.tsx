"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOrganizationName, useUpdateOrganizationName } from "@/hooks";
import {
  type OrganizationNameType,
  organizationNameSchema,
} from "@/lib/zod-schema";
import { Input } from "../../../../components";

export default function NameForm() {
  const { data: organization } = useOrganizationName();
  const { register, handleSubmit, formState, reset } =
    useForm<OrganizationNameType>({
      resolver: zodResolver(organizationNameSchema),
      defaultValues: {
        name: organization?.name || "",
      },
    });

  useEffect(() => {
    if (organization)
      reset({
        name: organization.name,
      });
  }, [reset, organization]);

  const updateName = useUpdateOrganizationName();
  console.log(organization?.name);
  const onSubmit = (data: OrganizationNameType) => {
    updateName.mutate(data);
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">Organization Name</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Organisationsname"
            className="mb-4"
            name="name"
            type="text"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <button
            type="submit"
            className="block w-full bg-black text-sm font-medium text-white py-2 rounded mt-4 cursor-pointer hover:bg-black-900"
            disabled={updateName.isPending}
          >
            {updateName.isPending ? "Lade..." : "Namen ändern"}
          </button>
        </form>
      </div>
    </section>
  );
}
