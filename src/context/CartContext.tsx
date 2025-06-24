'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { Product } from '@/types'

import { CartItem } from '@/types/cart'

interface CartContextType {
  isCartOpen: boolean
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  error: string | null
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (item: CartItem) => boolean
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Key for localStorage
const CART_STORAGE_KEY = 'g3tech_cart_items'

const MAX_QUANTITY_PER_ITEM = 99; // Maximum quantity per item
const MAX_TOTAL_ITEMS = 999; // Maximum total items in cart

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [error, setError] = useState<string | null>(null)

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
    setError(null); // Reset error state
    
    try {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id)
        
        // Check total items limit
        const currentTotalItems = prevItems.reduce((total, item) => total + item.quantity, 0)
        if (currentTotalItems + (item.quantity || 1) > MAX_TOTAL_ITEMS) {
          throw new Error(`Không thể thêm vào giỏ hàng. Số lượng tối đa là ${MAX_TOTAL_ITEMS} sản phẩm.`)
        }

        if (existingItem) {
          // Check individual item limit
          const newQuantity = existingItem.quantity + (item.quantity || 1)
          if (newQuantity > MAX_QUANTITY_PER_ITEM) {
            throw new Error(`Số lượng tối đa cho mỗi sản phẩm là ${MAX_QUANTITY_PER_ITEM}.`)
          }

          return prevItems.map(i =>
            i.id === item.id
              ? { ...i, quantity: newQuantity }
              : i
          )
        }

        // Validate new item quantity
        if (item.quantity > MAX_QUANTITY_PER_ITEM) {
          throw new Error(`Số lượng tối đa cho mỗi sản phẩm là ${MAX_QUANTITY_PER_ITEM}.`)
        }

        return [...prevItems, { ...item, quantity: item.quantity || 1 }]
      })

      // Auto open cart when adding items
      openCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thêm vào giỏ hàng')
      console.error('Error adding to cart:', err)
      return false
    }
    return true
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setError(null); // Reset error state
    
    try {
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        throw new Error(`Số lượng tối đa cho mỗi sản phẩm là ${MAX_QUANTITY_PER_ITEM}.`)
      }

      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0)

        // Check total items limit
        const totalItems = newItems.reduce((total, item) => total + item.quantity, 0)
        if (totalItems > MAX_TOTAL_ITEMS) {
          throw new Error(`Không thể thêm vào giỏ hàng. Số lượng tối đa là ${MAX_TOTAL_ITEMS} sản phẩm.`)
        }

        return newItems
      })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật số lượng')
      console.error('Error updating quantity:', err)
      return false
    }
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
        error,
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