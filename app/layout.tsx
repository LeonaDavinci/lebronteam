import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lebronteam.com"),
  title: "LeBron next team odds",
  description:
    "LeBron next team odds and live predictions on where LeBron James signs next. Track team probabilities, announcement dates, and contract sizes in real time.",
  keywords: [
    "LeBron next team",
    "LeBron next team odds",
    "LeBron next team prediction",
    "LeBron next team market",
    "where will LeBron go next",
  ],
  applicationName: "LeBron next team odds",
  authors: [{ name: "LeBron next team odds" }],
  icons: {
    apple: "/logo.svg",
  },
  openGraph: {
    title: "LeBron next team odds",
    description:
      "LeBron next team odds — the community prediction market for where LeBron James plays next. Follow the odds, the timeline, and settle the debate.",
    images: ["/lebron-flat.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeBron next team odds",
    description: "Track the LeBron next team odds on where LeBron James signs next.",
    images: ["/lebron-flat.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
