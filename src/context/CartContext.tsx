'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { Product } from '@/types'
import { useAuth } from '@/features/auth/AuthProvider'

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  brand?: string
}

interface CartContextType {
  isCartOpen: boolean
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (product: Product | CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Key for localStorage
const CART_STORAGE_KEY = 'g3tech_cart_items'

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { user } = useAuth()

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

  const addToCart = (product: Product | CartItem) => {
    setCartItems(prevItems => {
      // Check if the product is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id)

      if (existingItemIndex >= 0) {
        // If it exists, increase the quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        }
        return updatedItems
      } else {
        // Otherwise, add as a new item
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: 'price' in product ? product.price : 0,
          originalPrice: 'original_price' in product ? product.original_price : undefined,
          image: 'image_url' in product ? product.image_url : ('image' in product ? product.image : ''),
          quantity: 1,
          brand: 'brand' in product ? product.brand : undefined
        }
        return [...prevItems, newItem]
      }
    })

    // Auto open cart when adding items
    openCart()
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
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