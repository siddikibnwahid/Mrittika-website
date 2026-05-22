import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import CartProvider from '@/context/CartContext'

export const metadata: Metadata = {
  title: 'Mrittika - Pure Organic Mangoes from Chapai Nawabganj',
  description:
    'Experience the finest organic mangoes, directly sourced from the lush orchards of Chapai Nawabganj. Premium varieties: Gopalbhog, Himsagar, Langra, Fajli.',
  keywords: [
    'organic mangoes',
    'Chapai Nawabganj',
    'Gopalbhog',
    'Himsagar',
    'Langra',
    'Fajli',
    'Bangladesh',
  ],
  openGraph: {
    title: 'Mrittika - Pure Organic Mangoes',
    description: 'Premium mangoes directly from the source.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-inter: 'Inter', sans-serif;
            --font-playfair: 'Playfair Display', serif;
          }
        `}} />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1A17',
              color: '#F2EFEB',
              fontFamily: 'var(--font-inter)',
              borderRadius: '0px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            },
          }}
        />
      </body>
    </html>
  )
}
