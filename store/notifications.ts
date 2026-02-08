import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

export const notificationsAtom = atomWithStorage<AppNotification[]>(
  "app-notifications",
  [],
);

export const unreadCountAtom = atom((get) => {
  const all = get(notificationsAtom);
  return all.filter((n) => !n.isRead).length;
});
