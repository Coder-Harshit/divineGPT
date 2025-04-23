// 'use client'
//
// import { ReactNode } from 'react'
// import { motion } from 'framer-motion'
//
// interface LayoutProps {
//     children: ReactNode
// }
//
// export default function Layout({ children }: LayoutProps) {
//     return (
//         // <div className="min-h-screen flex flex-col bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100">
//         <div className="min-h-screen flex flex-col bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
//             {/* Later: Add NavBar here */}
//
//             <main className="flex-grow">
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 0.6 }}
//                 >
//                     {children}
//                 </motion.div>
//             </main>
//
//             {/* Later: Add Footer here */}
//         </div>
//     )
// }
// src/components/Layout.tsx
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ThemeProvider } from '@/context/ThemeContext'
import NavBar from './NavBar'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {

    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                <NavBar />

                <main className="flex-grow pt-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {children}
                    </motion.div>
                </main>

                {/* Later: Add Footer here */}
            </div>
        </ThemeProvider>
    )
}