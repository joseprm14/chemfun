import "./globals.css";
import { ReactNode } from "react";
import { I18nProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "ChemFun",
  description: "Juego educativo de tabla periódica",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <I18nProvider>
            <div className="min-h-screen">
              <Navbar />
              <main>{children}</main>
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}