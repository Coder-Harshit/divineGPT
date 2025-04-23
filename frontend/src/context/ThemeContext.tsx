// src/context/ThemeContext.tsx
'use client'

import {createContext, useContext, useEffect, useState, ReactNode} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextProps {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

// export function ThemeProvider({ children }: { children: ReactNode }) {
//     const [theme, setTheme] = useState<Theme>('light')
//
//     useEffect(() => {
//         // Check local storage or system preference
//         const savedTheme = localStorage.getItem('theme') as Theme
//         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
//
//         if (savedTheme) {
//             setTheme(savedTheme)
//             document.documentElement.classList.toggle('dark', savedTheme === 'dark')
//         } else if (prefersDark) {
//             setTheme('dark')
//             document.documentElement.classList.add('dark')
//         }
//     }, [])
//
//     const toggleTheme = () => {
//         const newTheme = theme === 'light' ? 'dark' : 'light'
//         setTheme(newTheme)
//         document.documentElement.classList.toggle('dark', newTheme === 'dark')
//         localStorage.setItem('theme', newTheme)
//     }
//
//     return (
//         <ThemeContext.Provider value={{ theme, toggleTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     )
// }
//
// export function useTheme() {
//     const context = useContext(ThemeContext)
//     if (context === undefined) {
//         throw new Error('useTheme must be used within a ThemeProvider')
//     }
//     return context
// }

export function ThemeProvider({children}: { children: ReactNode }) {
    // Initialize state based on the class already set on <html> by the script
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') {
            // Default for SSR, though the script handles initial client-side
            return 'light'
        }
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    })
    const [mounted, setMounted] = useState(false)

    // Effect to ensure state is updated if theme changes externally (e.g., system preference change)
    // and to mark as mounted
    useEffect(() => {
        setMounted(true)
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setTheme(currentTheme); // Sync state with actual DOM class

        // Optional: Listen for system theme changes if desired
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            // Only update if no theme is explicitly saved in localStorage
            if (!localStorage.getItem('theme')) {
                setTheme(systemTheme);
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(systemTheme);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);

    }, [])

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(newTheme)
            return newTheme
        })
    }, [])

    // Prevent rendering children until mounted to avoid hydration issues with theme-dependent UI
    if (!mounted) {
        // Render nothing or a basic loader on the server/initial client render
        return null;
        // Or return <>{children}</> if you handle potential flashes elsewhere
    }


    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}