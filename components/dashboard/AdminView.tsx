'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  UserCheck,
} from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import { formatBDT, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Product, Order, Profile, OrderStatus } from '@/types'

type Tab = 'products' | 'orders' | 'income'

export default function AdminView() {
  const [tab, setTab] = useState<Tab>('orders')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [managers, setManagers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: prods }, { data: ords }, { data: mgrs }] = await Promise.all([
      supabase.from('products').select('*').order('base_price', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'delivery_manager'),
    ])
    if (prods) {
      setProducts(prods)
      const prices: Record<string, number> = {}
      prods.forEach((p: Product) => { prices[p.id] = p.base_price })
      setEditedPrices(prices)
    }
    if (ords) setOrders(ords)
    if (mgrs) setManagers(mgrs)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const savePrice = async (productId: string) => {
    setSavingId(productId)
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ base_price: editedPrices[productId] })
      .eq('id', productId)
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, base_price: editedPrices[productId] } : p
      )
    )
    setSavingId(null)
  }

  const toggleStock = async (product: Product) => {
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ in_stock: !product.in_stock })
      .eq('id', product.id)
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, in_stock: !p.in_stock } : p))
    )
  }

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
  }

  const assignManager = async (orderId: string, managerId: string) => {
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ assigned_to: managerId || null })
      .eq('id', orderId)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, assigned_to: managerId || null } : o
      )
    )
  }

  // Income calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Pending')
    .reduce((s, o) => s + o.total, 0)
  const pendingCount = orders.filter((o) => o.status === 'Pending').length
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length
  const totalOrders = orders.length

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={15} /> },
    { id: 'products', label: 'Products', icon: <Package size={15} /> },
    { id: 'income', label: 'Income', icon: <TrendingUp size={15} /> },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`admin-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-gold text-forest'
                : 'border-transparent text-forest/40 hover:text-forest/70'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto flex items-center gap-1.5 font-sans text-xs text-forest/40 hover:text-forest transition-colors px-3 py-2"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="font-sans text-xs text-forest/40 tracking-wider uppercase mb-4">
                {orders.length} total orders
              </p>
              {orders.length === 0 && (
                <p className="font-sans text-sm text-forest/30 py-12 text-center">
                  No orders yet.
                </p>
              )}
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border p-5 hover:border-gold/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-serif text-base font-bold text-forest">
                        {order.customer_name}
                      </p>
                      <p className="font-sans text-xs text-forest/50 mt-0.5">
                        {order.customer_phone} &bull;{' '}
                        {order.location === 'inside_dhaka'
                          ? 'Inside Dhaka'
                          : 'Outside Dhaka'}
                      </p>
                      <p className="font-sans text-xs text-forest/40 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-serif text-lg font-black text-forest">
                        {formatBDT(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="font-sans text-xs bg-surface px-2.5 py-1 text-forest/60"
                      >
                        {item.name} {item.quantityKg}kg
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Status */}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="font-sans text-xs border border-border bg-cream text-forest px-3 py-2 focus:outline-none focus:border-gold"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {/* Assign manager */}
                    <select
                      value={order.assigned_to ?? ''}
                      onChange={(e) => assignManager(order.id, e.target.value)}
                      className="font-sans text-xs border border-border bg-cream text-forest px-3 py-2 focus:outline-none focus:border-gold"
                    >
                      <option value="">Assign to manager</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>

                    {order.payment_method === 'mobile_banking' && (
                      <div className="flex items-center gap-1.5 font-sans text-xs text-forest/50 bg-gold/5 border border-gold/20 px-3 py-2">
                        <span className="text-gold">bKash/Nagad</span>
                        {order.transaction_id && (
                          <span className="text-forest/40">
                            &bull; TXN: {order.transaction_id}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="font-sans text-xs text-forest/40 tracking-wider uppercase mb-4">
                Manage product pricing and availability
              </p>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-5 border border-border p-5 hover:border-gold/30 transition-colors"
                >
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-serif text-xl font-bold text-forest">
                      {product.name}
                    </p>
                    <p className="font-sans text-xs text-forest/40 mt-0.5">
                      Base price per kg
                    </p>
                  </div>

                  {/* Price editor */}
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm text-forest/50">৳</span>
                    <input
                      type="number"
                      min={1}
                      value={editedPrices[product.id] ?? product.base_price}
                      onChange={(e) =>
                        setEditedPrices((prev) => ({
                          ...prev,
                          [product.id]: Number(e.target.value),
                        }))
                      }
                      className="w-24 border border-border font-sans text-sm text-forest px-3 py-2 focus:outline-none focus:border-gold bg-cream"
                    />
                    <button
                      onClick={() => savePrice(product.id)}
                      disabled={
                        savingId === product.id ||
                        editedPrices[product.id] === product.base_price
                      }
                      className="flex items-center gap-1.5 px-3 py-2 bg-forest text-cream font-sans text-xs font-semibold hover:bg-forest-light transition-colors disabled:opacity-30"
                    >
                      <Save size={12} />
                      {savingId === product.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  {/* Stock toggle */}
                  <button
                    onClick={() => toggleStock(product)}
                    className={`flex items-center gap-2 font-sans text-xs font-semibold transition-colors ${
                      product.in_stock ? 'text-green-700' : 'text-forest/30'
                    }`}
                  >
                    {product.in_stock ? (
                      <ToggleRight size={22} />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* INCOME TAB */}
          {tab === 'income' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  {
                    label: 'Total Revenue',
                    value: formatBDT(totalRevenue),
                    sub: 'Confirmed orders',
                    color: 'text-forest',
                  },
                  {
                    label: 'Total Orders',
                    value: totalOrders.toString(),
                    sub: 'All time',
                    color: 'text-forest',
                  },
                  {
                    label: 'Pending',
                    value: pendingCount.toString(),
                    sub: 'Awaiting confirmation',
                    color: 'text-amber-600',
                  },
                  {
                    label: 'Delivered',
                    value: deliveredCount.toString(),
                    sub: 'Completed orders',
                    color: 'text-green-700',
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="border border-border p-5 hover:border-gold/30 transition-colors"
                  >
                    <p className="font-sans text-[10px] text-forest/40 tracking-wider uppercase mb-3">
                      {card.label}
                    </p>
                    <p className={`font-serif text-3xl font-black ${card.color}`}>
                      {card.value}
                    </p>
                    <p className="font-sans text-xs text-forest/35 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue by status */}
              <div className="border border-border p-6 mb-6">
                <h3 className="font-serif text-xl font-bold text-forest mb-5">
                  Revenue by Status
                </h3>
                <div className="space-y-3">
                  {ORDER_STATUSES.map((status) => {
                    const statusOrders = orders.filter((o) => o.status === status)
                    const revenue = statusOrders.reduce((s, o) => s + o.total, 0)
                    const pct =
                      totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div className="w-20 flex-shrink-0">
                          <OrderStatusBadge status={status} />
                        </div>
                        <div className="flex-1 bg-surface h-2">
                          <div
                            className="h-2 bg-gold transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-right flex-shrink-0 w-28">
                          <span className="font-serif text-sm font-bold text-forest">
                            {formatBDT(revenue)}
                          </span>
                          <span className="font-sans text-xs text-forest/35 ml-2">
                            ({statusOrders.length})
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Revenue by shipping zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Inside Dhaka', key: 'inside_dhaka' },
                  { label: 'Outside Dhaka', key: 'outside_dhaka' },
                ].map((zone) => {
                  const zoneOrders = orders.filter((o) => o.location === zone.key)
                  const revenue = zoneOrders.reduce((s, o) => s + o.total, 0)
                  return (
                    <div key={zone.key} className="border border-border p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck size={14} className="text-gold" />
                        <p className="font-sans text-xs text-forest/50 tracking-wider uppercase">
                          {zone.label}
                        </p>
                      </div>
                      <p className="font-serif text-2xl font-black text-forest">
                        {formatBDT(revenue)}
                      </p>
                      <p className="font-sans text-xs text-forest/35 mt-1">
                        {zoneOrders.length} orders
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
