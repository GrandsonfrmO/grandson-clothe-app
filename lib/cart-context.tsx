"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  size: string
  color?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number, size: string) => void
  updateQuantity: (id: number, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const previousCartKeyRef = useRef<string>("")

  // ✅ Mémoriser la clé du panier
  const cartKey = useMemo(() => {
    return isAuthenticated && user ? `cart_user_${user.id}` : "cart_guest"
  }, [isAuthenticated, user?.id])

  // ✅ Marquer comme monté côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ Load cart from localStorage on mount only
  useEffect(() => {
    if (!isMounted) return
    
    try {
      const savedCart = localStorage.getItem(cartKey)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        // Valider que c'est un tableau
        if (Array.isArray(parsed)) {
          setItems(parsed)
        } else {
          setItems([])
        }
      } else {
        setItems([])
      }
      previousCartKeyRef.current = cartKey
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      setItems([])
    }
    setIsHydrated(true)
  }, [cartKey, isMounted])

  // ✅ Debounce save to localStorage
  useEffect(() => {
    if (!isHydrated) return

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(cartKey, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [items, cartKey, isHydrated])

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size
      )
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += 1
        return updated
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: number, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)))
  }, [])

  const updateQuantity = useCallback((id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
