"use client";

import { createContext, useContext } from "react";

/**
 * Supplied by `MobileMenu` so items rendered inside it (also when they come
 * from a server component) can close the panel on click. `null` outside the
 * mobile menu, e.g. in the desktop navigation.
 */
export const MobileMenuCloseContext = createContext<(() => void) | null>(null);

export const useCloseMobileMenu = () => useContext(MobileMenuCloseContext);
