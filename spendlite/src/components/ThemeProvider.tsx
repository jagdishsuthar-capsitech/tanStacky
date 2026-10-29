
import { createContext, useContext, useEffect, useState, type ReactNode, } from 'react'
import { App, ConfigProvider, theme } from 'antd'

type ThemeMode = 'light' | 'dark'

type ThemeContextValue = {
    mode: ThemeMode
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeMode() {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useThemeMode must be used inside ThemeProvider')
    }

    return context
}

export function ThemeProvider({ children, }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('light')

    useEffect(() => {
        const saved = localStorage.getItem('spendlite-theme')

        if (saved === 'light' || saved === 'dark') {
            setMode(saved)
        }
    }, [])

    const toggleTheme = () => {
        const next = mode === 'light' ? 'dark' : 'light'

        setMode(next)
        localStorage.setItem('spendlite-theme', next)
    }

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm:
                        mode === 'dark'
                            ? theme.darkAlgorithm
                            : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#16a34a',
                        borderRadius: 10,
                        fontFamily:
                            'Inter, ui-sans-serif, system-ui, sans-serif',
                    },
                }}
            >
                <App>{children}</App>
            </ConfigProvider>
        </ThemeContext.Provider>
    )
}