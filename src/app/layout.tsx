import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarteImmoMartinique - Carte interactive du marché immobilier",
  description:
    "Explorez le marché immobilier de la Martinique sur une carte interactive. Prix réels, risques naturels, urbanisme, démographie et annonces en cours.",
  keywords: [
    "immobilier martinique",
    "prix immobilier martinique",
    "carte immobilier martinique",
    "achat maison martinique",
    "terrain martinique",
    "DVF martinique",
    "risques naturels martinique",
  ],
  openGraph: {
    title: "CarteImmoMartinique - L'intelligence immobilière de la Martinique",
    description:
      "Explorez le marché immobilier de la Martinique sur une carte interactive. Prix, risques, urbanisme, permis de construire.",
    url: "https://carteimmomartinique.com",
    siteName: "CarteImmoMartinique",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
