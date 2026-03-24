import React, { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/Button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Default to light mode on first entry.
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true)
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="cursor-pointer">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
