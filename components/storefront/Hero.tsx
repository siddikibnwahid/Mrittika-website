'use client';

import { motion, Variants } from 'framer-motion';
import { Leaf } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.4,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2 },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24">
      {/* Low-transparency artistic background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-earth/10 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-olive/10 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-stone/40 backdrop-blur-[2px] -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 flex flex-col items-center text-center max-w-4xl"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-14 h-14 mx-auto rounded-full border border-charcoal/10 bg-surface flex items-center justify-center text-charcoal shadow-sm">
            <Leaf size={24} strokeWidth={1} />
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-charcoal leading-[1.1] tracking-tight mb-8"
        >
          Curated Harvest.
          <br />
          <span className="font-serif italic font-normal text-olive">
            Pure Excellence.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-sans text-sm md:text-base text-charcoal/60 leading-relaxed max-w-xl mx-auto mb-16 font-medium"
        >
          Handpicked from the most prestigious orchards of Chapai Nawabganj.
          Experience the pinnacle of organic luxury, delivered directly to your door with
          uncompromising care.
        </motion.p>

        <motion.div variants={itemVariants}>
          <button
            onClick={() => {
              document
                .getElementById('collection')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative px-10 py-5 bg-charcoal text-stone font-sans text-xs font-bold tracking-[0.25em] uppercase overflow-hidden"
          >
            <span className="relative z-10">Explore the Collection</span>
            <div className="absolute inset-0 h-full w-full bg-olive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-[0.16,1,0.3,1]" />
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-charcoal/40 font-bold">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-charcoal/40 to-transparent" />
      </motion.div>
    </section>
  );
}
