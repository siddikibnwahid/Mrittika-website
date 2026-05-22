'use client'

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react'
import type { CartState, CartItem, Product, QuantityKg, LocationType } from '@/types'
import { QUANTITY_OPTIONS } from '@/lib/constants'
import {
  getDiscountedPrice,
  calculateLineTotal,
  calculateSubtotal,
  validatePromoCode,
  calculatePromoDiscount,
  calculateShipping,
  calculateTotal,
} from '@/lib/utils'

interface CartContextType {
  state: CartState
  isOpen: boolean
  location: LocationType
  openCart: () => void
  closeCart: () => void
  setLocation: (loc: LocationType) => void

  addToCart: (product: Product | { id: string; name: string; slug: any; base_price: number }, quantityKg: QuantityKg) => void
  removeFromCart: (productId: string, quantityKg: QuantityKg) => void
  applyPromo: (code: string) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const initialState: CartState = {
  items: [],
  promoCode: '',
  promoDiscount: 0,
  subtotal: 0,
  shippingCost: 0,
  total: 0,
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: CartItem; location: LocationType } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; quantityKg: QuantityKg; location: LocationType } }
  | { type: 'SET_LOCATION'; payload: { location: LocationType } }
  | { type: 'APPLY_PROMO'; payload: { code: string; discount: number } }
  | { type: 'CLEAR_CART' }

function recalculateCart(items: CartItem[], promoCode: string, location: LocationType): CartState {
  const subtotal = calculateSubtotal(items)
  const promo = validatePromoCode(promoCode)
  const promoDiscount = calculatePromoDiscount(subtotal, promo)
  const shippingCost = calculateShipping(items, location)
  const total = calculateTotal(subtotal, promoDiscount, shippingCost)
  return {
    items,
    promoCode: promo ? promo.code : '',
    promoDiscount,
    subtotal,
    shippingCost,
    total,
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = action.payload.item
      const exists = state.items.some(
        (item) => item.productId === newItem.productId && item.quantityKg === newItem.quantityKg
      )
      if (exists) {
        return state
      }
      const updatedItems = [...state.items, newItem]
      return recalculateCart(updatedItems, state.promoCode, action.payload.location)
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        (item) => !(item.productId === action.payload.productId && item.quantityKg === action.payload.quantityKg)
      )
      return recalculateCart(updatedItems, state.promoCode, action.payload.location)
    }
    case 'SET_LOCATION': {
      return recalculateCart(state.items, state.promoCode, action.payload.location)
    }
    case 'APPLY_PROMO': {
      const discount = action.payload.discount
      return { ...state, promoCode: action.payload.code, promoDiscount: discount }
    }
    case 'CLEAR_CART':
      return { ...initialState }
    default:
      return state
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocationState] = useState<LocationType>('inside_dhaka')

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mrittika_cart')
    const savedLoc = localStorage.getItem('mrittika_location')
    if (savedLoc) {
      setLocationState(savedLoc as LocationType)
    }
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as CartItem[]
        parsed.forEach((item) => {
          dispatch({ type: 'ADD_ITEM', payload: { item, location: savedLoc as LocationType || 'inside_dhaka' } })
        })
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e)
      }
    }
  }, [])

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mrittika_cart', JSON.stringify(state.items))
  }, [state.items])

  useEffect(() => {
    localStorage.setItem('mrittika_location', location)
    dispatch({ type: 'SET_LOCATION', payload: { location } })
  }, [location])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const setLocation = (loc: LocationType) => setLocationState(loc)

  const addItem = (
    product: Product | { id: string; name: string; slug: any; base_price: number },
    quantityKg: QuantityKg
  ) => {
    const option = QUANTITY_OPTIONS.find((o) => o.kg === quantityKg)
    if (!option) return
    const pricePerKg = product.base_price
    const discountedPricePerKg = getDiscountedPrice(pricePerKg, option.discount)
    const lineTotal = calculateLineTotal(discountedPricePerKg, quantityKg)
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      quantityKg,
      pricePerKg,
      discountedPricePerKg,
      lineTotal,
      freeShipping: option.freeShipping,
    }
    dispatch({ type: 'ADD_ITEM', payload: { item: cartItem, location } })
    setIsOpen(true)
  }

  const addToCart = (
    product: Product | { id: string; name: string; slug: any; base_price: number },
    quantityKg: QuantityKg
  ) => {
    addItem(product, quantityKg)
  }

  const removeFromCart = (productId: string, quantityKg: QuantityKg) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, quantityKg, location } })
  }

  const applyPromo = (code: string): boolean => {
    const promo = validatePromoCode(code)
    if (!promo) return false
    const discount = calculatePromoDiscount(state.subtotal, promo)
    dispatch({ type: 'APPLY_PROMO', payload: { code: promo.code, discount } })
    return true
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    localStorage.removeItem('mrittika_cart')
  }

  return (
    <CartContext.Provider
      value={{
        state,
        isOpen,
        location,
        openCart,
        closeCart,
        setLocation,
        addToCart,
        removeFromCart,
        applyPromo,
        clearCart,
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
