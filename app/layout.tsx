import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lebron next team",
  description:
    "Lebron next team odds and live predictions on where LeBron James signs next. Track team probabilities, announcement dates, and contract sizes in real time.",
  keywords: [
    "Lebron next team",
    "Lebron next team odds",
    "Lebron next team prediction",
    "Lebron next team market",
    "where will Lebron go next",
  ],
  applicationName: "LeBronTeam",
  authors: [{ name: "LeBronTeam" }],
  icons: {
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Lebron next team",
    description:
      "Lebron next team odds — the community prediction market for where LeBron James plays next. Follow the odds, the timeline, and settle the debate.",
    images: ["/lebron-flat.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lebron next team",
    description: "Track the Lebron next team odds on where LeBron James signs next.",
    images: ["/lebron-flat.svg"],
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
