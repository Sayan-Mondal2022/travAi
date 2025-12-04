// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/ChatBotWidget";

import "./globals.css";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // choose weights you need
});

export const metadata = {
  title: "TravAi",
  description: "Experience the AI powered Trip Planner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        {children}
        <ChatbotWidget/>
      </body>
    </html>
  );
}
