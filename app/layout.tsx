import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { TimerProvider } from "@/context/TimerContext";
import RealtimeProvider from "./ably-provider";
import { Header, LogoutWrapper, SessionTimerUI } from "./components";
import Providers from "./providers";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <LogoutWrapper>
          <TimerProvider>
            <Providers>
              <RealtimeProvider>
                <RealtimeNotifications />
                <Header />
                <main>{children}</main>
                <Toaster position="top-right" reverseOrder={false} />
                <SessionTimerUI />
              </RealtimeProvider>
            </Providers>
          </TimerProvider>
        </LogoutWrapper>
      </body>
    </html>
  );
}
