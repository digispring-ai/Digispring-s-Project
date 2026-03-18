export type Locale = 'zh-hans' | 'ja' | 'zh-hant' | 'en'

export type UserRole = 'buyer' | 'merchant' | 'admin'

export type MerchantStatus = 'pending' | 'approved' | 'suspended'

export type ProductStatus = 'draft' | 'active' | 'inactive'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  user_id: string
  store_name_ja: string
  store_name_zh: string
  store_name_en: string | null
  description_ja: string | null
  description_zh: string | null
  description_en: string | null
  logo_url: string | null
  banner_url: string | null
  prefecture: string | null
  status: MerchantStatus
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  slug: string
  name_ja: string
  name_zh: string
  name_zh_hant: string | null
  name_en: string | null
  icon: string | null
  sort_order: number
}

export interface Product {
  id: string
  merchant_id: string
  category_id: number | null
  name_ja: string
  name_zh: string
  name_zh_hant: string | null
  name_en: string | null
  description_ja: string | null
  description_zh: string | null
  description_zh_hant: string | null
  description_en: string | null
  price_jpy: number
  price_cny: number
  stock: number
  images: string[]
  status: ProductStatus
  tags: string[]
  created_at: string
  updated_at: string
  // joined
  merchants?: Merchant
  categories?: Category
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  products?: Product
}

export interface Address {
  id: string
  user_id: string
  name: string
  phone: string
  province: string
  city: string
  district: string | null
  address: string
  postal_code: string | null
  is_default: boolean
}

export interface Order {
  id: string
  buyer_id: string
  status: OrderStatus
  total_cny: number
  shipping_address: ShippingAddress
  note: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  merchant_id: string | null
  product_name_zh: string
  product_image: string | null
  quantity: number
  price_cny: number
  merchants?: Merchant
}

export interface ShippingAddress {
  name: string
  phone: string
  province: string
  city: string
  district?: string
  address: string
  postal_code?: string
}

export interface Review {
  id: string
  product_id: string
  buyer_id: string
  rating: number
  content: string | null
  created_at: string
  profiles?: Profile
}

// Helper to get localized field
export type LocalizedField = {
  ja: string | null
  zh: string | null
  zh_hant?: string | null
  en?: string | null
}
