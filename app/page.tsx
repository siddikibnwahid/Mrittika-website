import Hero from '@/components/storefront/Hero'
import ProductGrid from '@/components/storefront/ProductGrid'
import CartDrawer from '@/components/cart/CartDrawer'
import Navbar from '@/components/storefront/Navbar'
import { Leaf } from 'lucide-react'

export default function Home() {
  return (
    <main className="bg-stone min-h-screen selection:bg-earth selection:text-stone">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Product Catalog */}
      <ProductGrid />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Footer with minimal styling */}
      <footer className="bg-charcoal text-stone relative overflow-hidden pt-40 pb-24">
        <div className="container mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <div className="mb-20 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-stone/10 bg-surface/5 flex items-center justify-center text-stone mb-8 shadow-sm">
              <Leaf size={20} strokeWidth={1} />
            </div>
            <h3 className="font-serif text-3xl md:text-5xl font-black text-stone tracking-widest uppercase mb-10">
              MRITTIKA
            </h3>
            <p className="font-sans text-[11px] md:text-xs text-stone/40 leading-relaxed max-w-md mx-auto font-medium tracking-[0.1em] uppercase">
              Premium handpicked organic mangoes sourced directly from the finest orchards of Chapai Nawabganj.
            </p>
          </div>
          <div className="flex flex-col items-center gap-8 w-full border-t border-stone/10 pt-16">
            <a href="/dashboard" className="font-sans text-[9px] tracking-[0.3em] uppercase text-stone/30 hover:text-earth transition-colors font-bold">
              Staff Portal Access
            </a>
            <p className="font-sans text-[9px] tracking-[0.2em] text-stone/20 uppercase font-bold">
              © 2026 Mrittika. The Finest Selection.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
