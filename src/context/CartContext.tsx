'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { Product } from '@/types'

import { CartItem } from '@/types/cart'

interface CartContextType {
  isCartOpen: boolean
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Key for localStorage
const CART_STORAGE_KEY = 'g3tech_cart_items'

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart items from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error)
          // In case of error, clear the localStorage
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }
  }, [cartItems])

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen(prev => !prev)

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id)
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prevItems, item]
    })

    // Auto open cart when adding items
    openCart()
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Calculate total items and price
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider 
      value={{ 
        isCartOpen, 
        cartItems, 
        totalItems, 
        totalPrice,
        openCart, 
        closeCart, 
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 