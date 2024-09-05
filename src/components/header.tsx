'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">App Logo</h1>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <nav className="hidden md:block">
          {/* Desktop menu items */}
        </nav>
      </div>
      {isMenuOpen && (
        <nav className="mt-4 md:hidden">
          {/* Mobile menu items */}
        </nav>
      )}
    </header>
  )
}