import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { TimerProvider } from "@/context/TimerContext";
import RealtimeProvider from "./ably-provider";
import { Header, LogoutWrapper, SessionTimerUI } from "./components";
import Providers from "./providers";
import "./globals.css";
import { ThemeProvider } from "@teispace/next-themes";
import { getTheme, getThemeScript } from "@teispace/next-themes/server";
import RealtimeNotifications from "./realtime-notifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rechnungsgenerator",
  description: "Rechnungen erstellen",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storedTheme = await getTheme({ headers: {} });
  const initialTheme =
    storedTheme === "dark" || storedTheme === "light" ? storedTheme : undefined;

  const themeScript = getThemeScript({
    attribute: "class",
    defaultTheme: "light",
    enableSystem: false,
    initialTheme,
  });

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: anti-FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          initialTheme={initialTheme}
          noScript
        >
          <LogoutWrapper>
            <TimerProvider>
              <Providers>
                <RealtimeProvider>
                  <RealtimeNotifications />
                  <Header />
                  <main>{children}</main>
                  <Toaster
                    position="top-right"
                    reverseOrder={false}
                    toastOptions={{
                      className:
                        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                    }}
                  />
                  <SessionTimerUI />
                </RealtimeProvider>
              </Providers>
            </TimerProvider>
          </LogoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
