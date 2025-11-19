/** biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: <lint-ignore> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <lint-ignore> */
"use client";

import { MoreVertical } from "lucide-react";
import { type JSX, useEffect, useRef, useState } from "react";

type MenuOption = {
  id: string;
  text: string;
  node?: JSX.Element;
  onClick: () => void;
};

export default function ActionMenu({ options }: { options: MenuOption[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const closeMenu = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // When menu opens → focus first item
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      const first = menuRef.current?.children[0] as HTMLLIElement;
      first?.focus();
    }
  }, [open]);

  // Arrow nav focus
  useEffect(() => {
    if (!open) return;
    const el = menuRef.current?.children[activeIndex] as HTMLLIElement | null;
    el?.focus();
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
      }
    });

    return () => {
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [open]);

  const handleMenuKey = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "Tab":
        e.preventDefault();
        closeMenu();
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        options[activeIndex].onClick();
        closeMenu();
        break;
    }
  };

  return (
    <div className="relative inline-block p-2">
      <button
        ref={buttonRef}
        aria-label="Aktionen"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-full hover:bg-gray-200 bg-gray-100 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="action-menu"
      >
        <MoreVertical size={25} />
      </button>

      {open && (
        <ul
          id="action-menu"
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="absolute right-0 mt-1 w-44 bg-white shadow-xl rounded border border-gray-200 text-sm py-1 z-50"
          onKeyDown={handleMenuKey}
        >
          {options.map((opt, i) => (
            <li
              key={opt.id}
              role="menuitem"
              tabIndex={-1}
              aria-label={opt.text}
              className={`px-3 py-2 cursor-pointer outline-none ${
                activeIndex === i ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                opt.onClick();
                closeMenu();
              }}
              onMouseOver={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
            >
              {opt.node ?? opt.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
