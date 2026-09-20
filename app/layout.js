import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import RegisterSW from "@/components/pwa/RegisterSW";

// Self-hosted (variable, latin) so the app builds and runs offline.
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

export const metadata = {
  applicationName: "Spenda",
  title: "Spenda",
  description: "Your money, in and out — tracked the way you actually spend.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spenda",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14130f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('spenda-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
        <RegisterSW />
      </body>
    </html>
  );
}
