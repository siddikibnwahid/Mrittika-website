'use client'

import { STATIC_PRODUCTS } from '@/lib/constants'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'

export default function ProductGrid() {
  return (
    <section id="collection" className="py-32 md:py-48 bg-stone relative">
      <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24 md:mb-32"
        >
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-olive font-bold mb-6 block">
            The Selection
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-charcoal tracking-tight">
            Our Signature Harvest
          </h2>
          <div className="w-px h-16 bg-charcoal/20 mx-auto mt-12" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-24 lg:gap-x-24 lg:gap-y-32">
          {STATIC_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
