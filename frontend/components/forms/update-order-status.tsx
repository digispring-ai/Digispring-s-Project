'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types'

const NEXT_STATUS: Record<string, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
}

const LABELS: Record<string, string> = {
  confirmed: '确认订单',
  shipped: '标记发货',
  delivered: '标记收货',
}

interface Props {
  orderId: string
  currentStatus: string
}

export function UpdateOrderStatusButton({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const nextStatus = NEXT_STATUS[currentStatus]
  if (!nextStatus) return null

  const handleUpdate = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="px-3 py-1.5 border border-ink text-ink text-xs font-light hover:bg-ink hover:text-washi transition-colors rounded disabled:opacity-50"
    >
      {loading ? '...' : LABELS[nextStatus]}
    </button>
  )
}
