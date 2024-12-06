"use client";

import "./globals.css";
import { Lato } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Providers } from "./provider";
import { useLoadUserQuery } from "@/redux/features/api/apiSlices";
import Loading from "./components/Loading";

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.className} w-full bg-[#e8e3e3] dark:bg-[#212121] text-[#2c2a2a] dark:text-[#dddddd]`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Layout children={children} />
            <Toaster richColors />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

const Layout = ({ children }) => {
  const { isLoading } = useLoadUserQuery();

  return <>{isLoading ? <Loading /> : <>{children}</>}</>;
};
