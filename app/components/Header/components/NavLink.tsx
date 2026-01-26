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
      className={`p-2 cursor-pointer rounded-full flex items-center gap-1 transition-colors duration-100 ${isActive ? "bg-black hover:bg-gray-800" : "bg-gray-200 hover:bg-gray-300"}`}
      href={isActive ? "#" : href}
    >
      <span
        className={`pl-2 text-sm hidden sm:block ${isActive ? "text-white" : "text-black"}`}
      >
        {text}
      </span>
      <span className={`w-6 h-6 ${isActive ? "text-white" : "text-black"}`}>
        {icon}
      </span>
    </Link>
  );
}
