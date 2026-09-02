import type { Metadata } from "next";
import { Newsreader, Public_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";
import { product } from "@/words/site";
import { DEFAULT_LANGUAGE } from "@/kit/i18n";

/**
 * Three faces, each with one job. Public Sans sets the interface and every
 * figure, because its lining tabular numerals are what make a column of money
 * scannable. Newsreader sets headings, which is what gives the screens their
 * document rather than dashboard character. Courier Prime is reserved for
 * receipt serials and the receipt itself, where a typewriter face is not
 * decoration but the actual convention of the document being imitated.
 */
const sans = Public_Sans({
  variable: "--font-sans-app",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif-app",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  style: ["normal", "italic"],
});

const type = Courier_Prime({
  variable: "--font-type-app",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: `${product.name} · ${product.tagline[DEFAULT_LANGUAGE]}`,
  description: product.description[DEFAULT_LANGUAGE],
  applicationName: product.name,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={DEFAULT_LANGUAGE}
      className={`${sans.variable} ${serif.variable} ${type.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
