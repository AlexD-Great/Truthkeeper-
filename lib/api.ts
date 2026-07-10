"use client"

/**
 * fetch() wrapper that safely parses JSON. If the server returns a non-JSON
 * body (e.g. an HTML error page), this throws a clean Error instead of the
 * cryptic "Unexpected token '<'" you get from res.json() on HTML.
 */
export async function apiFetch<T = any>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const text = await res.text()

  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      (res.status === 401
        ? "Please sign in."
        : `Request failed (${res.status}). Please try again.`)
    throw new Error(message)
  }

  return data as T
}
