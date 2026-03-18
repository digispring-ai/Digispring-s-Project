-- ============================================================
-- 和市 (Waichi) 日本→中国跨境电商平台 数据库 Schema
-- ============================================================

-- 用户档案（关联 auth.users）
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'buyer' check (role in ('buyer', 'merchant', 'admin')),
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 商家信息
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  store_name_ja text not null,
  store_name_zh text not null,
  store_name_en text,
  description_ja text,
  description_zh text,
  description_en text,
  logo_url text,
  banner_url text,
  prefecture text,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 商品分类
create table if not exists categories (
  id serial primary key,
  slug text unique not null,
  name_ja text not null,
  name_zh text not null,
  name_zh_hant text,
  name_en text,
  icon text,
  sort_order int default 0
);

-- 商品
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade not null,
  category_id int references categories(id),
  name_ja text not null,
  name_zh text not null,
  name_zh_hant text,
  name_en text,
  description_ja text,
  description_zh text,
  description_zh_hant text,
  description_en text,
  price_jpy numeric(10,2) not null check (price_jpy >= 0),
  price_cny numeric(10,2) not null check (price_cny >= 0),
  stock int default 0 not null check (stock >= 0),
  images text[] default '{}' not null,
  status text default 'draft' check (status in ('draft', 'active', 'inactive')) not null,
  tags text[] default '{}' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 收货地址
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text not null,
  province text not null,
  city text not null,
  district text,
  address text not null,
  postal_code text,
  is_default boolean default false not null,
  created_at timestamptz default now() not null
);

-- 购物车
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz default now() not null,
  unique(user_id, product_id)
);

-- 订单
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) not null,
  total_cny numeric(10,2) not null,
  shipping_address jsonb not null,
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 订单项
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  merchant_id uuid references merchants(id) on delete set null,
  product_name_zh text not null,
  product_image text,
  quantity int not null check (quantity > 0),
  price_cny numeric(10,2) not null
);

-- 评价
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  content text,
  created_at timestamptz default now() not null,
  unique(product_id, buyer_id)
);

-- ============================================================
-- 预置分类数据
-- ============================================================
insert into categories (slug, name_ja, name_zh, name_zh_hant, name_en, icon, sort_order) values
  ('home',       'ホーム・インテリア',   '家居·家装',   '家居·家裝',   'Home & Living',    '🏠', 1),
  ('daily',      '日用品',              '日用品',       '日用品',       'Daily Essentials', '🧴', 2),
  ('handmade',   '手作り・工芸品',      '手工艺',       '手工藝',       'Handmade',         '🎨', 3),
  ('sake',       '清酒・日本酒',        '清酒',         '清酒',         'Sake & Spirits',   '🍶', 4),
  ('beauty',     '美容・コスメ',        '美妆护肤',     '美妝護膚',     'Beauty',           '💄', 5),
  ('food',       '食品・グルメ',        '食品·特产',    '食品·特產',    'Food & Gourmet',   '🍱', 6),
  ('tea',        '茶道・茶器',          '茶道·茶具',    '茶道·茶具',    'Tea Culture',      '🍵', 7),
  ('stationery', '文具・紙雑貨',        '文具',         '文具',         'Stationery',       '✏️', 8),
  ('fashion',    'ファッション・和服',   '服装·和服',    '服裝·和服',    'Fashion',          '👘', 9),
  ('health',     '健康・ウェルネス',    '健康养生',     '健康養生',     'Health',           '🌿', 10),
  ('garden',     '園芸・植物',          '园艺',         '園藝',         'Garden',           '🌸', 11),
  ('pet',        'ペット用品',          '宠物用品',     '寵物用品',     'Pet Goods',        '🐾', 12)
on conflict (slug) do nothing;

-- ============================================================
-- 自动创建 profile（注册触发器）
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- updated_at 触发器
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at();
create trigger update_merchants_updated_at before update on merchants
  for each row execute procedure update_updated_at();
create trigger update_products_updated_at before update on products
  for each row execute procedure update_updated_at();
create trigger update_orders_updated_at before update on orders
  for each row execute procedure update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- merchants
alter table merchants enable row level security;
create policy "Approved merchants are viewable by everyone" on merchants for select using (status = 'approved' or auth.uid() = user_id);
create policy "Merchants can update own store" on merchants for update using (auth.uid() = user_id);
create policy "Users can create merchant application" on merchants for insert with check (auth.uid() = user_id);

-- categories
alter table categories enable row level security;
create policy "Categories are viewable by everyone" on categories for select using (true);

-- products
alter table products enable row level security;
create policy "Active products are viewable by everyone" on products for select using (status = 'active' or merchant_id in (select id from merchants where user_id = auth.uid()));
create policy "Merchants can manage own products" on products for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

-- cart_items
alter table cart_items enable row level security;
create policy "Users can manage own cart" on cart_items for all using (auth.uid() = user_id);

-- addresses
alter table addresses enable row level security;
create policy "Users can manage own addresses" on addresses for all using (auth.uid() = user_id);

-- orders
alter table orders enable row level security;
create policy "Buyers can view own orders" on orders for select using (auth.uid() = buyer_id);
create policy "Buyers can create orders" on orders for insert with check (auth.uid() = buyer_id);
create policy "Merchants can view orders with their products" on orders for select using (
  id in (select order_id from order_items where merchant_id in (select id from merchants where user_id = auth.uid()))
);

-- order_items
alter table order_items enable row level security;
create policy "Order items visible to buyer" on order_items for select using (
  order_id in (select id from orders where buyer_id = auth.uid())
);
create policy "Order items visible to merchant" on order_items for select using (
  merchant_id in (select id from merchants where user_id = auth.uid())
);
create policy "Order items can be inserted with order" on order_items for insert with check (
  order_id in (select id from orders where buyer_id = auth.uid())
);

-- reviews
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Buyers can create reviews" on reviews for insert with check (auth.uid() = buyer_id);
create policy "Buyers can update own reviews" on reviews for update using (auth.uid() = buyer_id);
