import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "BUETian's BoiGhor - Educational Books Online",
  description:
    "Buy admission, engineering, medical, HSC, class and primary level books online with best prices",
  keywords:
    "books, admission, engineering, medical, HSC, education, Bangladesh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
