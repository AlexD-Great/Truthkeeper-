"use client"

import { type ReactNode } from "react"
import { toast } from "sonner"
import { Loader2, ShieldCheck, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

/** Wraps app pages that require a signed-in user. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured, signInWithGoogle } = useAuth()

  async function handleSignIn() {
    try {
      await signInWithGoogle()
    } catch (e: any) {
      if (e?.code !== "auth/popup-closed-by-user" && e?.code !== "auth/cancelled-popup-request") {
        toast.error(e?.message || "Sign-in failed.")
      }
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
      </main>
    )
  }

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-orbitron text-xl font-bold text-foreground">Sign-in not configured</h1>
          <p className="mt-2 font-geist text-sm text-muted-foreground">
            Add the <code>NEXT_PUBLIC_FIREBASE_*</code> values to <code>.env.local</code> and enable
            Google sign-in in the Firebase console. See SETUP.md.
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <ShieldCheck className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">
            Sign in to Truth<span className="text-red-500">Keeper</span>
          </h1>
          <p className="mt-2 font-geist text-sm text-muted-foreground">
            Sign in with Google to fact-check articles and keep a permanent, private history of your
            verifications.
          </p>
          <Button
            onClick={handleSignIn}
            className="mt-6 w-full gap-2 bg-red-500 text-white hover:bg-red-600"
          >
            <LogIn className="h-4 w-4" /> Continue with Google
          </Button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
