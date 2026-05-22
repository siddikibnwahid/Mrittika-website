'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Copy,
  Check,
  Truck,
  Phone,
  MapPin,
  RefreshCw,
  Weight,
  ShoppingBag,
  Info,
} from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import { formatBDT, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'
import toast from 'react-hot-toast'

interface DeliveryViewProps {
  userId: string
}

export default function DeliveryView({ userId }: DeliveryViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as Order[] || [])
    } catch (err) {
      console.error('Error loading assigned orders:', err)
      toast.error('Failed to load orders. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      toast.success(`Order marked as ${status}`)
    } catch (err) {
      console.error('Error updating order status:', err)
      toast.error('Failed to update order status.')
    }
  }

  const copyDispatchText = (order: Order) => {
    const itemsSummary = order.items
      .map((item) => `${item.name} (${item.quantityKg}kg)`)
      .join(', ')
    
    const totalWeight = order.items.reduce((sum, item) => sum + item.quantityKg, 0)
    
    const dispatchText = `--- MRITTIKA DISPATCH SHEET ---
Recipient: ${order.customer_name}
Phone: ${order.customer_phone}
Address: ${order.customer_address}
Zone: ${order.location === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
Items: ${itemsSummary}
Total Weight: ${totalWeight} kg
Total Amount: BDT ${order.total} (${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Mobile Banking'})
-------------------------------`

    navigator.clipboard.writeText(dispatchText)
    setCopiedId(order.id)
    toast.success('Dispatch details copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })

  // Delivery metrics
  const totalAssignedWeight = orders.reduce((sum, order) => {
    const orderWeight = order.items.reduce((iSum, item) => iSum + item.quantityKg, 0)
    return sum + orderWeight
  }, 0)
  
  const pendingDeliveries = orders.filter((o) => o.status !== 'Delivered').length

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-5 bg-surface/30">
          <p className="font-sans text-[10px] text-forest/45 tracking-wider uppercase mb-2">
            Total Cargo Weight
          </p>
          <div className="flex items-center gap-2">
            <Weight size={18} className="text-gold" />
            <p className="font-serif text-2xl font-black text-forest">
              {totalAssignedWeight} kg
            </p>
          </div>
          <p className="font-sans text-[11px] text-forest/35 mt-1">Across all assigned shipments</p>
        </div>

        <div className="border border-border p-5 bg-surface/30">
          <p className="font-sans text-[10px] text-forest/45 tracking-wider uppercase mb-2">
            Remaining Deliveries
          </p>
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-gold" />
            <p className="font-serif text-2xl font-black text-amber-600">
              {pendingDeliveries}
            </p>
          </div>
          <p className="font-sans text-[11px] text-forest/35 mt-1">Orders not yet delivered</p>
        </div>

        <div className="border border-border p-5 bg-surface/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-sans text-[10px] text-forest/45 tracking-wider uppercase">
                Assigned Orders
              </p>
              <p className="font-serif text-2xl font-black text-forest">
                {orders.length}
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1 font-sans text-xs text-forest/50 hover:text-gold transition-colors p-1"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Reload
            </button>
          </div>
          <p className="font-sans text-[11px] text-forest/35 mt-1">Total orders delegated to you</p>
        </div>
      </div>

      {/* Filters & Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          {['all', 'Pending', 'Paid', 'Shipped', 'Delivered'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 font-sans text-xs font-semibold border transition-all ${
                statusFilter === filter
                  ? 'border-gold bg-gold/5 text-forest'
                  : 'border-border text-forest/45 hover:border-gold/30 hover:text-forest'
              }`}
            >
              {filter === 'all' ? 'All Orders' : filter}
            </button>
          ))}
        </div>
        <p className="font-sans text-[11px] text-forest/45">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-surface/50 border border-border animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-surface/10">
          <ShoppingBag className="mx-auto text-forest/10 mb-4" size={40} />
          <p className="font-serif text-xl font-bold text-forest/40">No orders found</p>
          <p className="font-sans text-xs text-forest/30 mt-1">
            There are no orders matching your current filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const orderWeight = order.items.reduce((sum, item) => sum + item.quantityKg, 0)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border p-6 bg-cream hover:border-gold/30 transition-all flex flex-col justify-between shadow-sm relative group"
              >
                {/* Upper Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-forest">
                        {order.customer_name}
                      </h3>
                      <p className="font-sans text-xs text-forest/40">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-serif text-base font-black text-forest">
                        {formatBDT(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Scannable Contact Info */}
                  <div className="p-4 bg-surface/40 border border-border/50 space-y-2.5 font-sans">
                    <div className="flex items-center gap-2 text-sm text-forest font-semibold">
                      <Phone size={14} className="text-gold flex-shrink-0" />
                      <a href={`tel:${order.customer_phone}`} className="hover:text-gold transition-colors">
                        {order.customer_phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-forest/75 leading-relaxed">
                      <MapPin size={14} className="text-gold flex-shrink-0 mt-0.5" />
                      <span>{order.customer_address}</span>
                    </div>
                  </div>

                  {/* Items list and metrics */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-sans text-[10px] text-forest/45 tracking-wider uppercase font-semibold">
                      <ShoppingBag size={10} />
                      <span>Cargo Package</span>
                      <span className="text-gold">&bull; {orderWeight} kg total</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="font-sans text-[11px] bg-surface border border-border px-2 py-0.5 text-forest/70"
                        >
                          {item.name} &mdash; {item.quantityKg}kg
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lower Action Footer */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-4">
                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-sans text-[9px] text-forest/45 tracking-wider uppercase">
                      Update Status
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="w-full font-sans text-xs border border-border bg-cream text-forest px-3 py-2 focus:outline-none focus:border-gold"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Copy Dispatch Sheet */}
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[9px] text-forest/45 tracking-wider uppercase text-right">
                      Copy Dispatch
                    </span>
                    <button
                      onClick={() => copyDispatchText(order)}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 border font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                        copiedId === order.id
                          ? 'bg-green-700 text-cream border-green-700'
                          : 'bg-forest text-cream border-forest hover:bg-forest-light hover:text-gold'
                      }`}
                    >
                      {copiedId === order.id ? (
                        <>
                          <Check size={12} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Dispatch
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Info Box for Mobile Banking */}
                {order.payment_method === 'mobile_banking' && (
                  <div className="absolute top-2 left-2 group-hover:block hidden md:block md:static md:mt-3">
                    <div className="inline-flex items-center gap-1 bg-gold/5 border border-gold/20 px-2 py-1 text-[10px] text-gold-light font-sans font-medium">
                      <Info size={10} />
                      <span>Mobile Banking</span>
                      {order.transaction_id && (
                        <span className="text-forest/40">
                          (TxID: {order.transaction_id})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
