export type ProductSlug = 'gopalbhog' | 'himsagar' | 'langra' | 'fajli'
export type QuantityKg = 5 | 10 | 18
export type LocationType = 'inside_dhaka' | 'outside_dhaka'
export type PaymentMethod = 'cod' | 'mobile_banking'
export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered'
export type UserRole = 'admin' | 'delivery_manager' | 'staff'

export interface Product {
  id: string
  name: string
  slug: ProductSlug
  base_price: number
  in_stock: boolean
  description: string
  image_url: string
  created_at?: string
}

export interface CartItem {
  productId: string
  name: string
  slug: ProductSlug
  quantityKg: QuantityKg
  pricePerKg: number
  discountedPricePerKg: number
  lineTotal: number
  freeShipping: boolean
}

export interface PromoCode {
  code: string
  type: 'flat' | 'percent'
  value: number
}

export interface CartState {
  items: CartItem[]
  promoCode: string
  promoDiscount: number
  subtotal: number
  shippingCost: number
  total: number
}

export interface CheckoutFormData {
  customerName: string
  customerPhone: string
  customerAddress: string
  location: LocationType
  paymentMethod: PaymentMethod
  senderAccount?: string
  transactionId?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  location: LocationType
  shipping_cost: number
  items: CartItem[]
  subtotal: number
  discount_amount: number
  promo_code: string | null
  total: number
  payment_method: PaymentMethod
  sender_account: string | null
  transaction_id: string | null
  status: OrderStatus
  assigned_to: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}
