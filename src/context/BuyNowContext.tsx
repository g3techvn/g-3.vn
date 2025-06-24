'use client'

import React, { createContext, useContext, useState } from 'react'
import { CartItem } from '@/types/cart'

interface BuyNowContextType {
  buyNowItem: CartItem | null
  setBuyNowItem: (item: CartItem | null) => void
  clearBuyNowItem: () => void
}

const BuyNowContext = createContext<BuyNowContextType>({
  buyNowItem: null,
  setBuyNowItem: () => {},
  clearBuyNowItem: () => {}
})

export function BuyNowProvider({ children }: { children: React.ReactNode }) {
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null)

  const clearBuyNowItem = () => {
    setBuyNowItem(null)
  }

  return (
    <BuyNowContext.Provider value={{ buyNowItem, setBuyNowItem, clearBuyNowItem }}>
      {children}
    </BuyNowContext.Provider>
  )
}

export const useBuyNow = () => useContext(BuyNowContext) 