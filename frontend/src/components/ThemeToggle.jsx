import React, { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/Button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Initial state from localStorage or system preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme")
      if (saved) return saved === "dark"
      return document.documentElement.classList.contains("dark")
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="cursor-pointer">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
