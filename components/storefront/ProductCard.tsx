'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { QUANTITY_OPTIONS } from '@/lib/constants'
import type { Product, QuantityKg } from '@/types'
import { formatBDT, getDiscountedPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const [selectedKg, setSelectedKg] = useState<QuantityKg>(5);

  const activeOption = QUANTITY_OPTIONS.find((q) => q.kg === selectedKg)!;
  const currentPrice = getDiscountedPrice(product.base_price, activeOption.discount);

  const handleAdd = () => {
    addToCart(product, selectedKg);
    openCart();
  }

  return (
    <div className="group flex flex-col items-center text-center w-full">
      {/* Image Gallery Container */}
      <div className="relative w-full aspect-[4/5] bg-surface overflow-hidden mb-10 shadow-sm border border-charcoal/5">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-[0.16,1,0.3,1]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Subtle low transparency overlay on hover */}
        <div className="absolute inset-0 bg-charcoal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-multiply" />
      </div>

      {/* Typography and info */}
      <h3 className="font-serif text-3xl font-bold text-charcoal mb-4 tracking-wide">
        {product.name}
      </h3>
      <p className="font-sans text-xs text-charcoal/60 leading-relaxed max-w-sm mx-auto mb-8 font-medium">
        {product.description}
      </p>

      {/* Selectors and Price */}
      <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-8">
        
        {/* Quantity Selectors */}
        <div className="flex items-center justify-center gap-4 w-full">
          {QUANTITY_OPTIONS.map((opt) => (
            <button
              key={opt.kg}
              onClick={() => setSelectedKg(opt.kg)}
              className={`relative py-3 flex-1 border-b transition-all duration-300 ${
                selectedKg === opt.kg
                  ? 'border-charcoal text-charcoal'
                  : 'border-transparent text-charcoal/30 hover:text-charcoal/60'
              }`}
            >
              <span className="font-sans text-xs font-bold tracking-[0.2em]">{opt.kg}KG</span>
              {opt.badge && selectedKg === opt.kg && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-olive whitespace-nowrap">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-center gap-6 w-full pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-bold">
              Price
            </span>
            <span className="font-serif text-2xl font-bold text-charcoal">
              {formatBDT(currentPrice)}<span className="text-sm">/kg</span>
            </span>
          </div>

          <button
            onClick={handleAdd}
            className="group/btn relative w-full flex items-center justify-center gap-3 py-5 bg-charcoal text-stone font-sans text-[10px] font-bold tracking-[0.3em] uppercase overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={14} className="group-hover/btn:rotate-90 transition-transform duration-500" />
              Add to Basket
            </span>
            <div className="absolute inset-0 h-full w-full bg-olive transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 origin-left ease-[0.16,1,0.3,1]" />
          </button>
        </div>
      </div>
    </div>
  )
}
