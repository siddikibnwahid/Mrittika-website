'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LocationType, PaymentMethod } from '@/types'

export default function CheckoutForm() {
  const { state, location, setLocation, applyPromo, clearCart, closeCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [senderAccount, setSenderAccount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleLocationChange = (loc: LocationType) => {
    setLocation(loc)
  }

  const handleApplyPromo = () => {
    setPromoMsg(null)
    const success = applyPromo(promoInput.trim())
    setPromoMsg(
      success
        ? { text: 'Promo applied successfully!', ok: true }
        : { text: 'Invalid promo code. Please check and try again.', ok: false }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.items.length === 0) return
    setSubmitting(true)
    const supabase = createClient()
    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      location,
      shipping_cost: state.shippingCost,
      items: state.items,
      subtotal: state.subtotal,
      discount_amount: state.promoDiscount,
      promo_code: state.promoCode || null,
      total: state.total,
      payment_method: paymentMethod,
      sender_account: paymentMethod === 'mobile_banking' ? senderAccount : null,
      transaction_id: paymentMethod === 'mobile_banking' ? transactionId : null,
      status: 'Pending',
    }
    const { error } = await supabase.from('orders').insert(payload)
    if (error) {
      toast.error('Failed to place order. Please try again.')
      console.error(error)
    } else {
      toast.success('Order placed! We will confirm shortly. \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6!')
      clearCart()
      closeCart()
    }
    setSubmitting(false)
  }

  const inputCls =
    'w-full bg-transparent border-b border-charcoal/20 font-sans text-base text-charcoal px-0 py-3 focus:outline-none focus:border-charcoal transition-all placeholder:text-charcoal/20'
  const labelCls = 'font-sans text-[9px] text-charcoal/50 tracking-[0.25em] uppercase font-bold mb-1 block'

  return (
    <form onSubmit={handleSubmit} id="checkout-form" className="mt-12 space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="font-serif text-2xl font-bold text-charcoal tracking-wide">Checkout</h3>
        <div className="flex-1 h-[1px] bg-charcoal/10" />
      </div>

      <div className="space-y-6">
        <div>
          <label className={labelCls}>Full Name</label>
          <input
            required
            type="text"
            id="checkout-name"
            placeholder="Your full name"
            className={inputCls}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Phone Number</label>
          <input
            required
            type="tel"
            id="checkout-phone"
            placeholder="01XXXXXXXXX"
            className={inputCls}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Delivery Address</label>
          <textarea
            required
            rows={2}
            id="checkout-address"
            placeholder="Full delivery address with area/thana"
            className={`${inputCls} resize-none`}
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelCls}>Shipping Zone</label>
          <div className="grid grid-cols-2 gap-px bg-charcoal/10 border border-charcoal/10 mt-3 p-px">
            {[
              { value: 'inside_dhaka' as LocationType, label: 'Inside Dhaka', price: 120 },
              { value: 'outside_dhaka' as LocationType, label: 'Outside Dhaka', price: 150 },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                id={`location-${opt.value}`}
                onClick={() => handleLocationChange(opt.value)}
                className={`py-4 px-2 text-center transition-all duration-500 ${
                  location === opt.value
                    ? 'bg-charcoal text-stone'
                    : 'bg-surface text-charcoal hover:bg-stone-dark'
                }`}
              >
                <span className="font-sans text-[11px] font-bold tracking-wider uppercase block mb-1">
                  {opt.label}
                </span>
                <span className={`font-sans text-[9px] tracking-widest uppercase ${location === opt.value ? 'text-stone/60' : 'text-charcoal/40'}`}>
                  \u09F3{opt.price} shipping
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promo code */}
      <div className="pt-2">
        <label className={labelCls}>Promo Code</label>
        <div className="flex gap-4 items-end">
          <input
            type="text"
            id="promo-code-input"
            placeholder="Enter code"
            className={`${inputCls} flex-1`}
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value)
              setPromoMsg(null)
            }}
          />
          <button
            type="button"
            id="promo-apply-btn"
            onClick={handleApplyPromo}
            className="pb-3 border-b border-charcoal text-charcoal font-sans text-[10px] font-bold tracking-[0.2em] hover:text-earth transition-colors uppercase"
          >
            Apply
          </button>
        </div>
        {promoMsg && (
          <p
            className={`font-sans text-[10px] font-bold mt-2 ${
              promoMsg.ok ? 'text-olive' : 'text-red-600'
            }`}
          >
            {promoMsg.text}
          </p>
        )}
      </div>

      {/* Payment method */}
      <div className="pt-2">
        <label className={labelCls}>Payment Method</label>
        <div className="grid grid-cols-2 gap-px bg-charcoal/10 border border-charcoal/10 mt-3 p-px">
          {[
            { value: 'cod' as PaymentMethod, label: 'Cash on Delivery' },
            { value: 'mobile_banking' as PaymentMethod, label: 'Mobile Banking' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              id={`payment-${opt.value}`}
              onClick={() => setPaymentMethod(opt.value)}
              className={`py-4 px-2 text-center transition-all duration-500 ${
                paymentMethod === opt.value
                  ? 'bg-charcoal text-stone'
                  : 'bg-surface text-charcoal hover:bg-stone-dark'
              }`}
            >
              <span className="font-sans text-[11px] font-bold tracking-wider uppercase">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile banking fields */}
      <AnimatePresence>
        {paymentMethod === 'mobile_banking' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 overflow-hidden"
          >
            <div className="p-6 bg-surface border border-charcoal/5 mt-6 text-center">
              <p className="font-sans text-[11px] text-charcoal/60 leading-relaxed font-bold tracking-wide uppercase">
                Send to <span className="text-charcoal font-black">bKash/Nagad: 01XXXXXXXXX</span>
              </p>
            </div>
            <div>
              <label className={labelCls}>Sender Account Number</label>
              <input
                required
                type="text"
                id="sender-account"
                placeholder="Your bKash or Nagad number"
                className={inputCls}
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Transaction ID</label>
              <input
                required
                type="text"
                id="transaction-id"
                placeholder="Transaction reference number"
                className={inputCls}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="pt-10">
        <button
          type="submit"
          id="place-order-btn"
          disabled={submitting || state.items.length === 0}
          className="group relative w-full flex justify-center py-6 bg-charcoal text-stone font-sans font-bold text-[11px] tracking-[0.3em] uppercase overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {submitting ? 'Processing...' : `Confirm Order \u2014 \u09F3${state.total.toLocaleString('en-BD')}`}
          </span>
          {!submitting && state.items.length > 0 && (
            <div className="absolute inset-0 h-full w-full bg-olive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-[0.16,1,0.3,1]" />
          )}
        </button>
      </div>
    </form>
  )
}
