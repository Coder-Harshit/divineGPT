// // src/components/ThemeToggle.tsx
// 'use client'
//
// import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { Sun, Moon, Sparkles } from 'lucide-react'
// import { useTheme } from '@/context/ThemeContext'
//
// export default function ThemeToggle() {
//     const { theme, toggleTheme } = useTheme()
//     const [isMounted, setIsMounted] = useState(false)
//
//     useEffect(() => {
//         setIsMounted(true)
//     }, [])
//
//     if (!isMounted) return null
//
//     return (
//         <motion.button
//             onClick={toggleTheme}
//             className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-md hover:shadow-lg transition-all duration-300"
//             whileTap={{ scale: 0.9 }}
//             aria-label="Toggle theme"
//         >
//             <motion.div
//                 initial={false}
//                 animate={{
//                     rotate: theme === 'dark' ? 360 : 0,
//                     scale: theme === 'dark' ? [1, 1.2, 1] : 1
//                 }}
//                 transition={{ duration: 0.5 }}
//             >
//                 {theme === 'dark' ? (
//                     <Moon className="w-5 h-5 text-[var(--accent-gold)]" />
//                 ) : (
//                     <Sun className="w-5 h-5 text-[var(--accent-saffron)]" />
//                 )}
//                 {/*<Sparkles className="absolute w-3 h-3 text-[var(--primary-light)] opacity-70"*/}
//                 {/*          style={{ top: '2px', right: '2px' }} />*/}
//             </motion.div>
//         </motion.button>
//     )
// }

// src/components/ThemeToggle.tsx - (Should be correct as previously provided)
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react' // Removed Sparkles for simplicity, add back if needed
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    // isMounted check is good practice here to ensure theme is ready before rendering icon
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        // Optional: Render a placeholder or null while mounting
        return <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>;
    }

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-md hover:shadow-lg transition-all duration-300 border border-[var(--border)]" // Added border
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
        >
            <motion.div
                key={theme} // Add key to force re-render on theme change for animation
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="absolute" // Use absolute positioning for smooth icon transition
            >
                {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[var(--accent-gold)]" />
                ) : (
                    <Sun className="w-5 h-5 text-[var(--accent-saffron)]" />
                )}
            </motion.div>
        </motion.button>
    )
}