"use client";

import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Loading from "./components/Loading";
import { Providers } from "./provider";
import { useLoadUserQuery } from "@/redux/features/api/apiSlices";

const firaSans = Nunito({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${firaSans.className} w-full bg-[#e8e3e3] dark:bg-[#2f2f2f] text-[#2c2a2a] dark:text-[#dddddd]`}
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
