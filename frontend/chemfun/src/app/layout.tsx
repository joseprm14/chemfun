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
  // El layout general de la aplicación es sencillo, la barra de navegación en lo alto seguida por el contenido general de cada página
  // Además aquí se aplican los proveedores de tema y de idioma
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