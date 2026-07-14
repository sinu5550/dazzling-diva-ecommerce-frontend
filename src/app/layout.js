import { Geist, Instrument_Serif, Playfair_Display, Poppins, Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Shared/Footer/Footer";
import Navbar from "@/components/Shared/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import FloatingActions from "@/components/ui/FloatingActions";

const playfairDisplayFont = Playfair_Display({
  variable: "--hasib_dev",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

const instrumentFont = Instrument_Serif({
  variable: "--font-instrument_Serif",
  subsets: ["latin"],
  weight: ["400"]
});

const geistFont = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

const poppinsFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

const outfitFont = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata = {
  title: "Dazzling Diva",
  description: "Dazzling Diva  is a future-focused fashion and lifestyle brand delivering premium collections, modern design, creativity, and elevated customer experiences.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistFont.variable} ${instrumentFont.variable} ${playfairDisplayFont.variable} ${poppinsFont.variable} ${outfitFont.variable}`}>
      <body
        className="antialiased text-gray-800"
      >
        <div className="h-16 lg:h-[114px]">
          <Navbar />
        </div>

        <div className="min-h-[calc(100vh-350px)]">
          {children}
        </div>

        <Footer />
        <FloatingActions />
        <Toaster />
      </body>
    </html>
  );
}