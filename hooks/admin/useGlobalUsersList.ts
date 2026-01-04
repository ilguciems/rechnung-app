import { useQuery } from "@tanstack/react-query";
import { admin } from "@/lib/auth-client";

export function useGlobalUsersList() {
  return useQuery({
    queryKey: ["global-users-list"],
    queryFn: async () => {
      const res = await admin.listUsers({
        query: {
          sortBy: "email",
        },
      });

      if (!res.data) throw new Error("Failed to fetch users");

      return res.data.users;
    },
    staleTime: 1000 * 60 * 5,
  });
}
