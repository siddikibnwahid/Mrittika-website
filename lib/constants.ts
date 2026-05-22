import type { PromoCode } from '@/types'

export const STATIC_PRODUCTS = [
  {
    id: 'gopalbhog',
    name: 'Gopalbhog',
    slug: 'gopalbhog' as const,
    base_price: 130,
    description: 'The sweetest small mango of Chapai. Rich aroma, intense sweetness, golden skin.',
    image_url: '/gopalbhog.png',
    in_stock: true,
  },
  {
    id: 'himsagar',
    name: 'Himsagar',
    slug: 'himsagar' as const,
    base_price: 150,
    description: 'The king of mangoes. Fiberless, creamy pulp with an incomparable golden flavour.',
    image_url: '/himsagar.png',
    in_stock: true,
  },
  {
    id: 'langra',
    name: 'Langra',
    slug: 'langra' as const,
    base_price: 140,
    description: 'A classic favourite. Tangy-sweet balance with green skin and saffron-hued flesh.',
    image_url: '/langra.png',
    in_stock: true,
  },
  {
    id: 'fajli',
    name: 'Fajli',
    slug: 'fajli' as const,
    base_price: 120,
    description: 'The giant of mangoes. Mild, juicy, perfect for slicing. Ideal for families.',
    image_url: '/fajli.png',
    in_stock: true,
  },
];
export const QUANTITY_OPTIONS = [
  { kg: 5 as const, label: '5 kg', discount: 0, freeShipping: false, badge: null },
  { kg: 10 as const, label: '10 kg', discount: 0.06, freeShipping: false, badge: '6% off' },
  { kg: 18 as const, label: '18 kg', discount: 0.09, freeShipping: true, badge: '9% + Free Ship' },
]

// Keys must be UPPERCASED for lookup
export const PROMO_CODES: Record<string, PromoCode> = {
  MARAKHA: { code: 'MaraKha', type: 'flat', value: 25 },
  AMINOTUN5: { code: 'AMINOTUN5', type: 'percent', value: 5 },
  AAMKHABO15: { code: 'AAMKHABO15', type: 'percent', value: 15 },
}

export const SHIPPING_COSTS = {
  inside_dhaka: 120,
  outside_dhaka: 150,
} as const

export const ORDER_STATUSES = [
  'Pending',
  'Paid',
  'Shipped',
  'Delivered',
] as const
