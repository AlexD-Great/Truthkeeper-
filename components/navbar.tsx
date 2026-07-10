"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signInWithGoogle, signOutUser } = useAuth()

  async function handleSignIn() {
    try {
      await signInWithGoogle()
    } catch (e: any) {
      if (e?.code !== "auth/popup-closed-by-user" && e?.code !== "auth/cancelled-popup-request") {
        toast.error(e?.message || "Sign-in failed.")
      }
    }
  }

  async function handleSignOut() {
    await signOutUser()
    toast.success("Signed out.")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-orbitron text-xl font-bold text-white">
              Truth<span className="text-red-500">Keeper</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="/#how-it-works"
                className="font-geist text-white hover:text-red-500 transition-colors duration-200"
              >
                How It Works
              </a>
              <a href="/#filecoin" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
                Filecoin
              </a>
              <a href="/#faq" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
                FAQ
              </a>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <a href="/history" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
              History
            </a>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-geist text-sm text-white/70 max-w-[180px] truncate">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="gap-2 border-red-500/40 text-white hover:bg-red-500/10 font-geist"
                >
                  <LogOut size={16} /> Sign out
                </Button>
              </div>
            ) : (
              <Button
                asChild
                className="gap-2 bg-red-500 hover:bg-red-600 text-white font-geist border-0"
              >
                <Link href="/check">
                  <LogIn size={16} /> Sign in
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-red-500 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/98 border-t border-red-500/20">
              <a
                href="/#how-it-works"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <a
                href="/#filecoin"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Filecoin
              </a>
              <a
                href="/#faq"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </a>
              <a
                href="/history"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                History
              </a>
              <div className="px-3 py-2">
                {user ? (
                  <>
                    <p className="mb-2 font-geist text-sm text-white/70 truncate">{user.email}</p>
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        handleSignOut()
                      }}
                      variant="outline"
                      className="w-full gap-2 border-red-500/40 text-white hover:bg-red-500/10 font-geist"
                    >
                      <LogOut size={16} /> Sign out
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                  >
                    <Link href="/check" onClick={() => setIsOpen(false)}>
                      <LogIn size={16} /> Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
