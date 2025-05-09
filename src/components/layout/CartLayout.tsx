'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { CartProvider, useCart } from '../../context/CartContext'
import ShoppingCart from '../store/carts'

function CartWrapper({ children }: { children: ReactNode }) {
  const { isCartOpen, closeCart } = useCart()
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if the device is mobile on initial render and when window size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is standard md breakpoint in Tailwind
    }
    
    // Check on initial render
    checkIsMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  return (
    <>
      {children}
      {/* Only show shopping cart on desktop devices */}
      {!isMobile && <ShoppingCart isOpen={isCartOpen} onClose={closeCart} />}
    </>
  )
}

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CartWrapper>{children}</CartWrapper>
    </CartProvider>
  )
} 