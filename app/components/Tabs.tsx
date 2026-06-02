"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, type ReactNode } from "react";

type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultActiveTab?: string;
};

export default function Tabs({ tabs, defaultActiveTab }: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shouldReduceMotion = useReducedMotion();

  const activeTabId = searchParams.get("tab") || defaultActiveTab || tabs[0].id;

  const setActiveTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
      (
        document.getElementById(`tab-${tabs[nextIndex].id}`) as HTMLElement
      )?.focus();
    }
    if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex].id);
      (
        document.getElementById(`tab-${tabs[prevIndex].id}`) as HTMLElement
      )?.focus();
    }
  };

  return (
    <div className="w-full">
      <div
        role="tablist"
        className="relative flex items-center gap-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar py-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab.id === tab.id;

          return (
            <button
              type="button"
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tabs.indexOf(tab))}
              className={`
                relative py-4 px-2 text-sm font-medium transition-all outline-none group
                focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black focus-visible:rounded-lg
                ${isActive ? "text-black dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}
              `}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span className={tab.icon ? "hidden md:block" : ""}>
                  {tab.label}
                </span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-950 dark:bg-white"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tabs.map((tab) => (
          <Activity
            key={tab.id}
            mode={activeTab.id === tab.id ? "visible" : "hidden"}
          >
            <div
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
            >
              {tab.content}
            </div>
          </Activity>
        ))}
      </div>
    </div>
  );
}
