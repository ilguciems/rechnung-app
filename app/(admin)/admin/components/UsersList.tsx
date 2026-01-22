"use client";
import {
  ArrowUpDown,
  Ban,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmationModal } from "@/app/components";
import { useGlobalUsersList } from "@/hooks";
import { useUrlState } from "@/hooks/useUrlState";
import { useSession } from "@/lib/auth-client";
import Pagination from "./Pagination";
import SkeletonLoader from "./SkeletonLoader";

const PAGE_SIZE = 5;

export default function UsersList() {
  const [page, setPage] = useUrlState<number>("page", 1);
  const [sortDirection, setSortDirection] = useUrlState<"asc" | "desc">(
    "sortDirection",
    "desc",
  );
  const [searchField, setSearchField] = useUrlState<"name" | "email">(
    "searchField",
    "name",
  );
  const [searchValue, setSearchValue] = useUrlState<string>("searchValue", "");
  const [filterValue, setFilterValue] = useUrlState<string>("filterValue", "");
  const [pageSize, setPageSize] = useUrlState<number>("pageSize", PAGE_SIZE);

  const handleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc", { page: 1 });
  };

  const handleFilterValue = (value: string) => {
    setFilterValue(value, { page: 1 });
  };

  const handlePageSize = (value: number) => {
    setPageSize(value, { page: 1 });
  };

  const [tempSearchValue, setTempSearchValue] = useState(searchValue);

  const executeSearch = () => {
    setSearchValue(tempSearchValue, { page: 1 });
  };

  useEffect(() => {
    if (tempSearchValue === "" && searchValue !== "") {
      const timeout = setTimeout(() => {
        setSearchValue("", { page: 1 });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [tempSearchValue, searchValue, setSearchValue]);

  useEffect(() => {
    setTempSearchValue(searchValue);
  }, [searchValue]);

  const { data, isLoading, setRole, setBan } = useGlobalUsersList({
    sortDirection: sortDirection,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    searchValue: searchValue,
    searchField: searchField,
    searchOperator: "contains",
    filterField: "role",
    filterValue: filterValue,
  });
  const { data: session } = useSession();

  const users = data?.users;
  const totalUsers = data?.total;

  const totalPages = useMemo(() => {
    return Math.ceil((totalUsers || 0) / pageSize);
  }, [totalUsers, pageSize]);

  const [modalConfig, setModalConfig] = useState<{
    type: "role" | "ban";
    userId: string;
    userName: string;
    currentVal: string | undefined | null | boolean;
  } | null>(null);

  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("0");

  const closeAndReset = () => {
    setModalConfig(null);
    setBanReason("");
    setBanDuration("0");
  };

  const handleConfirm = () => {
    if (!modalConfig) return;

    if (modalConfig.type === "role") {
      const newRole = modalConfig.currentVal === "admin" ? "user" : "admin";
      setRole.mutate(
        { userId: modalConfig.userId, role: newRole },
        { onSuccess: closeAndReset },
      );
    } else {
      const isBanning = !modalConfig.currentVal;
      const expires =
        banDuration !== "0"
          ? parseInt(banDuration, 10) * 24 * 60 * 60
          : undefined;

      setBan.mutate(
        {
          userId: modalConfig.userId,
          ban: isBanning,
          reason: isBanning ? banReason : undefined,
          expires: isBanning ? expires : undefined,
        },
        { onSuccess: closeAndReset },
      );
    }
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-4">
            <div className="relative min-w-[5.5rem]">
              <label
                htmlFor="page-size"
                className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-1.5 absolute -top-2 left-2 bg-white z-10"
              >
                pro Seite
              </label>
              <div className="relative h-11">
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => handlePageSize(parseInt(e.target.value, 10))}
                  className="w-full h-full pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none hover:border-slate-400 focus:ring-2 focus:ring-black appearance-none transition-all cursor-pointer"
                >
                  {[5, 10, 15, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 flex items-stretch h-11">
              <div className="relative flex-shrink-0 group">
                <select
                  value={searchField}
                  onChange={(e) =>
                    setSearchField(e.target.value as "name" | "email")
                  }
                  className="h-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-l-xl text-sm font-medium text-slate-600 outline-none hover:bg-slate-100 cursor-pointer appearance-none transition-all border-r-0 
               focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black focus-visible:bg-white z-20 relative"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors 
               group-focus-within:text-black z-30"
                />
              </div>
              <div className="w-[1px] bg-slate-200 my-2 z-10" />
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder={`Suche nach ${searchField === "name" ? "Name" : "Email"}...`}
                  value={tempSearchValue}
                  onChange={(e) => setTempSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                  className="w-full h-full pl-10 pr-4 py-2 bg-slate-50 border-y border-slate-200 outline-none text-sm transition-all focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={executeSearch}
                className="px-3 bg-black hover:bg-gray-800 active:bg-gray-900 text-white font-semibold text-sm rounded-r-xl transition-all flex items-center shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-[130px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                onChange={(e) => handleFilterValue(e.target.value)}
                value={filterValue}
                className="h-11 w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-black outline-none cursor-pointer text-sm font-medium"
              >
                <option value="">Alle Rollen</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleSortDirection}
              className="h-11 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm group text-sm font-medium text-slate-600"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
              {sortDirection === "asc" ? (
                <ChevronDown className="w-4 h-4 text-slate-500 hover:text-black" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-500 hover:text-black" />
              )}
            </button>
          </div>
        </div>
      </div>
      {((users && users?.length > 0) || isLoading) && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
      <div className="min-h-[40.1rem] sm:min-h-[22.6rem]">
        {isLoading ? (
          <ul className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            {Array.from({ length: pageSize }).map(() => (
              <SkeletonLoader key={Math.random()} />
            ))}
          </ul>
        ) : (
          <div>
            {users?.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-gray-500 text-sm">
                  Keine Benutzer gefunden
                </span>
              </div>
            ) : (
              <ul className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {users?.map((user) => {
                  const isActionsAllowed =
                    user.role !== "superadmin" && user.id !== session?.user?.id;
                  return (
                    <li
                      key={user.id}
                      className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-4 sm:col-span-2">
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {user.email}
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <div className="flex flex-col gap-1 items-end sm:items-start">
                          <span
                            className={`w-fit px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                              user.role === "admin" ||
                              user.role === "superadmin"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {user.id === session?.user?.id
                              ? "Mein Konto"
                              : user.role}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-2 gap-1">
                        <div className="flex flex-col gap-1">
                          {user.banned ? (
                            <div className="flex flex-col">
                              <span className="bg-red-100 text-red-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {`Gesperrt ${user.banExpires ? `bis ${new Date(user.banExpires).toLocaleDateString()}` : "permanent"}`}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {`Grund: ${user.banReason && user.banReason !== "No reason" ? `${user.banReason}` : "nicht angegeben"} `}
                              </span>
                            </div>
                          ) : (
                            <span className="w-fit px-2 py-0.5 rounded text-[12px] font-bold uppercase bg-emerald-100 text-emerald-700">
                              aktiv
                            </span>
                          )}
                        </div>
                      </div>
                      {isActionsAllowed && (
                        <div className="text-sm font-medium col-span-2 sm:col-span-1">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: "role",
                                  userId: user.id,
                                  userName: user.name,
                                  currentVal: user.role,
                                })
                              }
                              disabled={
                                setRole.isPending ||
                                user.id === session?.user.id
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg cursor:pointer"
                              title="Rolle ändern"
                            >
                              {user.role === "admin" ? (
                                <ShieldAlert className="w-6 h-6 text-amber-600" />
                              ) : (
                                <ShieldCheck className="w-6 h-6 text-slate-700" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: "ban",
                                  userId: user.id,
                                  userName: user.name,
                                  currentVal: user.banned,
                                })
                              }
                              disabled={
                                setBan.isPending || user.id === session?.user.id
                              }
                              className="p-2 hover:bg-red-50 rounded-lg cursor:pointer"
                              title={user.banned ? "Entsperren" : "Sperren"}
                            >
                              {user.banned ? (
                                <UserCheck className="w-6 h-6 text-green-600" />
                              ) : (
                                <Ban className="w-6 h-6 text-red-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      {((users && users?.length > 0) || isLoading) && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
      <ConfirmationModal
        isOpen={!!modalConfig}
        onClose={closeAndReset}
        onConfirm={handleConfirm}
        isPending={setRole.isPending || setBan.isPending}
        title={
          modalConfig?.type === "role"
            ? "Rolle ändern"
            : modalConfig?.currentVal
              ? "Entsperren"
              : "Benutzer sperren"
        }
        description={
          modalConfig?.type === "role"
            ? `Möchten Sie die Rolle von ${modalConfig?.userName} wirklich ändern?`
            : `Aktion für Benutzer ${modalConfig?.userName} bestätigen.`
        }
      >
        {modalConfig?.type === "ban" && !modalConfig.currentVal && (
          <div className="space-y-3 pt-2">
            <div className="grid relative mb-4">
              <label
                htmlFor="ban-reason"
                className="text-xs text-gray-700 px-2 absolute -top-2 left-2 z-10 bg-white"
              >
                Grund (optional)
              </label>
              <div className="relative">
                <input
                  id="ban-reason"
                  className="border p-2 rounded w-full border-gray-500"
                  placeholder="z.B. Verstoß gegen Regeln"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>
            <div className="grid relative mb-4">
              <label
                htmlFor="ban-duration"
                className="text-xs text-gray-700 px-2 absolute -top-2 left-2 bg-white"
              >
                Dauer
              </label>
              <select
                id="ban-duration"
                className="border p-2 rounded w-full border-gray-500 min-h-[2.5rem]"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              >
                <option value="0">Permanent</option>
                <option value="1">1 Tag</option>
                <option value="7">7 Tage</option>
                <option value="30">30 Tage</option>
              </select>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}
