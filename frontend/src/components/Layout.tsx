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
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
            {/* Later: Add NavBar here */}

            <main className="flex-grow">
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
    )
}