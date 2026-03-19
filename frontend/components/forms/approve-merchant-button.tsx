'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MerchantStatus } from '@/types'

const ACTION_MAP: Record<string, { status: MerchantStatus; label: string; style: string }> = {
  approve: { status: 'approved', label: '通过', style: 'bg-matcha text-washi hover:bg-matcha/80' },
  reject: { status: 'suspended', label: '拒绝', style: 'bg-red-100 text-red-600 hover:bg-red-200' },
  suspend: { status: 'suspended', label: '暂停', style: 'border border-earth text-earth hover:bg-mist' },
}

interface Props {
  merchantId: string
  action: 'approve' | 'reject' | 'suspend'
}

export function ApproveMerchantButton({ merchantId, action }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { status, label, style } = ACTION_MAP[action]

  const handleClick = async () => {
    setLoading(true)
    await supabase.from('merchants').update({ status }).eq('id', merchantId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-1.5 text-xs font-light rounded transition-colors disabled:opacity-50 ${style}`}
    >
      {loading ? '...' : label}
    </button>
  )
}
