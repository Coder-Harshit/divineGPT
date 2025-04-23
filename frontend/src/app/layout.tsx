import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/context/ThemeContext";

const inter = Inter({subsets: ["latin"]});


export const metadata: Metadata = {
    // title: "Create Next App",
    title: "DivineGPT",
    description: "DivineGPT: Your AI Companion for Spiritual Wisdom",
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
        <head>
            {/* Script to set initial theme based on localStorage or system preference */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                function getInitialTheme() {
                  const persistedColorPreference = window.localStorage.getItem('theme');
                  if (typeof persistedColorPreference === 'string') {
                    return persistedColorPreference;
                  }
                  const mql = window.matchMedia('(prefers-color-scheme: dark)');
                  if (typeof mql.matches === 'boolean') {
                    return mql.matches ? 'dark' : 'light';
                  }
                  return 'light'; // Default theme
                }
                const theme = getInitialTheme();
                document.documentElement.classList.add(theme);
              })();
            `,
                }}
            />
        </head>
        <body className={inter.className}> {/* Use your font class */}
        <ThemeProvider> {/* Wrap children with ThemeProvider */}
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}