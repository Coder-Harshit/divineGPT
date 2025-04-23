// src/components/NavBar.tsx
'use client'

import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed w-full top-0 z-50 bg-[var(--bg-light)]/80 dark:bg-[var(--bg-dark)]/80 backdrop-blur-md py-3 px-6"
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-[var(--primary)] dark:text-[var(--accent-gold)]">
            Divine<span className="text-[var(--accent-saffron)]">GPT</span>
          </span>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                </div>
            </div>
        </motion.nav>
    )
}