'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Leaf, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { state, openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
          scrolled ? 'py-4 glass shadow-sm' : 'py-8 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-16 flex items-center justify-between">
          


          {/* Left: Mobile Menu */}
          <div className="md:hidden flex-1 flex items-center">
            <button className="text-charcoal hover:text-earth transition-colors">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Logo (Perfectly Centered) */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal group-hover:bg-charcoal group-hover:text-stone transition-all duration-500">
                <Leaf size={14} />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-charcoal">
                MRITTIKA
              </h1>
            </Link>
          </div>

          {/* Right: Cart */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={openCart}
              className="group flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <span className="hidden md:block font-sans text-xs font-bold tracking-[0.2em] uppercase text-charcoal">
                Basket
              </span>
              <div className="relative text-charcoal">
                <ShoppingBag size={24} strokeWidth={1.5} />
                <AnimatePresence>
                  {state.items.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -bottom-1 -right-2 bg-earth text-stone text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {state.items.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
          
        </div>
      </motion.header>
    </>
  )
}
