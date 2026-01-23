"use client";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
import { ConfirmationModal } from "@/app/components";
import { usePendingInvitations } from "@/hooks";

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() < Date.now();
}

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) return "Abgelaufen";

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `noch ${days} Tage`;
  if (hours > 0) return `noch ${hours} Stunden`;

  return "weniger als 1 Stunde";
}

export default function PendingInvitationsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: invitations,
    isLoading,
    revokeInvitation,
  } = usePendingInvitations();

  if (isLoading) return <div>Loading...</div>;

  if (!invitations) return <div>No invitations found</div>;

  const handleRevoke = (id: string) => {
    revokeInvitation.mutate({ invitationId: id });
    setIsModalOpen(false);
  };

  return (
    <div className="border border-gray-100 p-4 rounded-xl mt-2">
      <h2 className="text-2xl mb-6">Ausstehende Einladungen</h2>
      <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-500 border-b">
        <span className="col-span-3 sm:col-span-2">Email</span>
        <span className="col-span-2 sm:col-span-1 text-right sm:text-left">
          Status
        </span>
        <span className="col-span-3 sm:col-span-1">Gültig</span>
        <span className="col-span-2 sm:col-span-1 text-right">Aktion</span>
      </div>

      {invitations.map(({ id, email, role, expiresAt }) => {
        const expired = isExpired(expiresAt);

        return (
          <Fragment key={id}>
            <div className="grid grid-cols-5 px-4 py-3 items-center border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
              <div className="col-span-3 sm:col-span-2 gap-1">
                <div className="text-sm font-medium">{email}</div>
                <div className="text-xs text-gray-400">{role}</div>
              </div>

              <span
                className={`col-span-2 sm:col-span-1 text-sm text-right sm:text-left ${
                  expired ? "text-red-600" : "text-yellow-600"
                }`}
              >
                {expired ? "Abgelaufen" : "Ausstehend"}
              </span>

              <span className="col-span-3 sm:col-span-1 text-sm text-gray-500">
                {timeLeft(expiresAt)}
              </span>

              <div className="col-span-2 sm:col-span-1 text-right">
                {!expired && (
                  <button
                    type="button"
                    title="Einladung widerrufen"
                    onClick={() => setIsModalOpen(true)}
                    disabled={revokeInvitation.isPending}
                    className="p-2 rounded hover:bg-red-50 text-red-600 disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={() => handleRevoke(id)}
              title="Einladung widerrufen"
              description="Soll die Einladung wirklich widerrufen werden?"
              confirmText="Widerrufen"
              isPending={revokeInvitation.isPending}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
