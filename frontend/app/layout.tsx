import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/global.scss";

const nbInternational = localFont({
  src: [
    {
      path: "../fonts/NB-International-Pro-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/NB-International-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-nbinternational",
  display: "swap",
});

const nbMono = localFont({
  src: "../fonts/NB-International-Mono.ttf",
  variable: "--font-nbinternational-mono",
  display: "swap",
});

const neuePlak = localFont({
  src: [
    {
      path: "../fonts/NeuePlak-ExtendedBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Neue-Plak-Extended-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neueplak",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Co",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${nbInternational.variable}
          ${nbMono.variable}
          ${neuePlak.variable}
        `}
      >
        {children}
      </body>
    </html>
  );
}
