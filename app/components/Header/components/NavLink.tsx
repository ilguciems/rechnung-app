"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  icon?: React.ReactNode;
  text: string;
  title: string;
};

export function NavLink({ href, icon, text, title }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      title={title}
      className={`p-2 cursor-pointer rounded-full flex items-center justify-between gap-2 transition-colors duration-100 ${isActive ? "bg-gray-950 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300" : "bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-700"}`}
      href={isActive ? "#" : href}
    >
      <span
        className={`pl-2 text-sm ${isActive ? "text-white dark:text-gray-900" : "text-black dark:text-white"}`}
      >
        {text}
      </span>
      <span
        className={`w-6 h-6 shrink-0 ${isActive ? "text-white dark:text-gray-900" : "text-black dark:text-white"}`}
      >
        {icon}
      </span>
    </Link>
  );
}
