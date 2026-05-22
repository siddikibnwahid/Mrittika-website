'use client'

import React from 'react'
import type { CartItem as CartItemType } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatBDT } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart } = useCart()
  const savings = (item.pricePerKg - item.discountedPricePerKg) * item.quantityKg

  return (
    <div className="flex items-center gap-6 pb-6 border-b border-charcoal/5 font-sans group">
      {/* Product Image */}
      <div className="relative w-24 h-32 bg-surface flex-shrink-0 overflow-hidden shadow-sm">
        <Image
          src={`/${item.slug}.png`}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
          sizes="96px"
        />
        <div className="absolute inset-0 bg-charcoal/5 mix-blend-multiply pointer-events-none" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-serif text-xl font-bold text-charcoal tracking-wide">
              {item.name}
            </h4>
            <p className="text-[10px] font-bold text-charcoal/50 mt-1 tracking-[0.2em] uppercase">
              {item.quantityKg}KG Box
            </p>
          </div>
          <button
            onClick={() => removeFromCart(item.productId, item.quantityKg)}
            className="text-charcoal/30 hover:text-charcoal transition-colors p-1"
            title="Remove item"
          >
            <Trash2 size={16} strokeWidth={1} />
          </button>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-charcoal/50 font-bold tracking-[0.15em] uppercase">
              {formatBDT(item.discountedPricePerKg)}/kg
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-serif text-2xl font-bold text-charcoal leading-none">
                {formatBDT(item.lineTotal)}
              </span>
              {savings > 0 && (
                <span className="text-[9px] font-black text-olive bg-olive/10 px-2 py-0.5 uppercase tracking-widest">
                  Save {formatBDT(savings)}
                </span>
              )}
            </div>
          </div>
          {item.freeShipping && (
            <span className="text-[9px] tracking-[0.2em] uppercase text-olive font-bold">
              Free Ship
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
