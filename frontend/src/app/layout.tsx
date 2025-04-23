// app/layout.tsx
"use client"
import type {Metadata} from "next";
import {ThemeProvider} from '@/context/ThemeContext'
import '@/styles/globals.css'

export const metadata: Metadata = {
    title: "DivineGPT",
    description: "DivineGPT: Your AI Companion for Spiritual Wisdom",
};


export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`antialiased`}>
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    )
}


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
