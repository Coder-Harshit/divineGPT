'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    }

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-md hover:shadow-lg transition-all duration-300 border border-[var(--border)]"
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
        >
            <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="absolute"
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