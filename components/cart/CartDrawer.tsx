'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import CartItem from './CartItem'
import CheckoutForm from './CheckoutForm'
import { formatBDT } from '@/lib/utils'

export default function CartDrawer() {
  const { state, isOpen, closeCart } = useCart()
  const hasFreeShipping = state.items.some((i) => i.freeShipping)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Earthy low-transparency backdrop with blur */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-stone-dark/80 backdrop-blur-md z-50"
            onClick={closeCart}
          />

          {/* Minimalist Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-stone border-l border-charcoal/5 z-50 flex flex-col shadow-2xl"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-charcoal/5 flex-shrink-0 bg-surface">
              <div className="flex items-center gap-4">
                <ShoppingBag size={20} strokeWidth={1.5} className="text-charcoal" />
                <h2 className="font-serif text-xl font-bold text-charcoal tracking-widest uppercase">
                  Basket
                </h2>
                {state.items.length > 0 && (
                  <span className="bg-earth text-stone text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                id="close-cart-btn"
                className="text-charcoal/40 hover:text-charcoal transition-colors p-2 -mr-2"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-10 gap-6">
                  <ShoppingBag size={48} strokeWidth={1} className="text-charcoal/20" />
                  <div className="space-y-3">
                    <p className="font-serif text-2xl font-bold text-charcoal">Your basket is empty</p>
                    <p className="font-sans text-xs text-charcoal/50 font-medium">
                      Select from our signature harvest to proceed.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="font-sans text-[10px] font-bold tracking-[0.2em] text-charcoal uppercase mt-6 border-b border-charcoal/30 pb-1 hover:border-charcoal transition-colors"
                  >
                    Continue Exploring
                  </button>
                </div>
              ) : (
                <div className="px-10 py-8">
                  {/* Items List */}
                  <div className="space-y-6">
                    {state.items.map((item) => (
                      <CartItem
                        key={`${item.productId}-${item.quantityKg}`}
                        item={item}
                      />
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-12 space-y-4 py-8 border-t border-charcoal/5">
                    <div className="flex justify-between font-sans text-xs font-semibold text-charcoal/60 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>{formatBDT(state.subtotal)}</span>
                    </div>
                    {state.promoDiscount > 0 && (
                      <div className="flex justify-between font-sans text-xs font-bold text-olive uppercase tracking-widest">
                        <span>Promo ({state.promoCode})</span>
                        <span>\u2212{formatBDT(state.promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-sans text-xs font-semibold text-charcoal/60 uppercase tracking-widest">
                      <span>Shipping</span>
                      <span>
                        {hasFreeShipping || state.shippingCost === 0 ? (
                          <span className="text-olive font-bold tracking-widest">Free</span>
                        ) : (
                          formatBDT(state.shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-serif text-3xl font-bold text-charcoal pt-6 border-t border-charcoal/10 mt-4">
                      <span>Total</span>
                      <span>{formatBDT(state.total)}</span>
                    </div>
                  </div>

                  {/* Checkout form */}
                  <CheckoutForm />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
