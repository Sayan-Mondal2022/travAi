import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TravAi",
  description: "A AI Trip Planner",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Header />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main className="min-h-screen">{children}</main>

          <footer className="bg-blue-400 py-5">
            <section className="mx-auto px-4 text-center text-white">
              An AI Trip planner personlaize your trip.
            </section>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
