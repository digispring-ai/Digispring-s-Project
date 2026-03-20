-- ============================================================
-- 和市 Demo Seed Data
-- 3 sample shops · 6 products
-- Run with:  supabase db reset  (local dev)
--   or paste directly into Supabase SQL editor
-- ============================================================

do $$
declare
  -- Fixed UUIDs so the seed is idempotent
  demo_user1    uuid := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  demo_user2    uuid := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  demo_user3    uuid := 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
  merchant1_id  uuid := '11111111-1111-4111-1111-111111111111';
  merchant2_id  uuid := '22222222-2222-4222-2222-222222222222';
  merchant3_id  uuid := '33333333-3333-4333-3333-333333333333';
  cat_tea       int;
  cat_handmade  int;
  cat_beauty    int;
  cat_home      int;
begin
  -- ── Category IDs ──────────────────────────────────────────
  select id into cat_tea      from categories where slug = 'tea';
  select id into cat_handmade from categories where slug = 'handmade';
  select id into cat_beauty   from categories where slug = 'beauty';
  select id into cat_home     from categories where slug = 'home';

  -- ── Auth users (local Supabase only) ──────────────────────
  -- Wrapped in its own block so seed doesn't abort on hosted Supabase
  begin
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values
      ('00000000-0000-0000-0000-000000000000', demo_user1,
       'authenticated', 'authenticated', 'kyoto-ceramics@demo.waichi.local', '',
       now(), '{"provider":"email","providers":["email"]}',
       '{"full_name":"京都陶芸工房"}', now(), now(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000000', demo_user2,
       'authenticated', 'authenticated', 'wagasa-tokyo@demo.waichi.local', '',
       now(), '{"provider":"email","providers":["email"]}',
       '{"full_name":"東京和傘堂"}', now(), now(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000000', demo_user3,
       'authenticated', 'authenticated', 'bihada-honpo@demo.waichi.local', '',
       now(), '{"provider":"email","providers":["email"]}',
       '{"full_name":"美肌本舗"}', now(), now(), '', '', '', '')
    on conflict (id) do nothing;
  exception when others then
    raise notice 'Skipping auth.users insert (hosted Supabase — add users via dashboard): %', sqlerrm;
  end;

  -- ── Profiles ──────────────────────────────────────────────
  insert into profiles (id, role, full_name) values
    (demo_user1, 'merchant', '京都陶芸工房'),
    (demo_user2, 'merchant', '東京和傘堂'),
    (demo_user3, 'merchant', '美肌本舗')
  on conflict (id) do nothing;

  -- ── Merchants ─────────────────────────────────────────────
  insert into merchants (
    id, user_id,
    store_name_ja, store_name_zh, store_name_en,
    description_ja, description_zh, description_en,
    prefecture, status
  ) values
    -- 1. Kyoto Ceramics Studio
    (merchant1_id, demo_user1,
     '京都陶芸工房', '京都陶艺工坊', 'Kyoto Ceramics Studio',
     '京都の伝統的な陶芸技術を守り続ける工房です。匠の手による一点物の器を丁寧にお届けします。',
     '传承京都传统陶艺技术的工坊，每件器皿均由匠人手工打造，独一无二。',
     'A studio preserving traditional Kyoto ceramics. Each piece is handcrafted by skilled artisans.',
     '京都府', 'approved'),

    -- 2. Tokyo Wagasa House
    (merchant2_id, demo_user2,
     '東京和傘堂', '东京和伞堂', 'Tokyo Wagasa House',
     '江戸時代から受け継がれる和傘・提灯の専門店。伝統の技法で一本一本丁寧に仕上げています。',
     '传承江户时代工艺的和伞、提灯专门店，以传统工法精心制作每一件作品。',
     'Traditional Japanese umbrella & lantern shop with Edo-period heritage. Each piece is handmade.',
     '東京都', 'approved'),

    -- 3. Bihada Honpo (Skincare)
    (merchant3_id, demo_user3,
     '美肌本舗', '美肌本铺', 'Bihada Honpo',
     '日本の厳選された美容成分を使用したスキンケアブランド。自然の恵みでやさしく肌を育てます。',
     '采用日本严选美容成分的护肤品牌，以自然之精华温和滋养肌肤。',
     'Japanese skincare brand using carefully selected natural beauty ingredients.',
     '大阪府', 'approved')
  on conflict (id) do nothing;

  -- ── Products — Kyoto Ceramics Studio ──────────────────────
  insert into products (
    merchant_id, category_id,
    name_ja, name_zh, name_zh_hant, name_en,
    description_ja, description_zh, description_zh_hant, description_en,
    price_jpy, price_cny, stock, images, status, tags
  ) values
    -- Product 1: Sakura tea cup set (matches image 1 — black sakura cups)
    (merchant1_id, cat_tea,
     '桜絵付け 茶碗セット（2個）',
     '樱花彩绘茶碗套装（2只）',
     '櫻花彩繪茶碗套裝（2只）',
     'Sakura Hand-painted Tea Cup Set (×2)',
     'マット調の黒釉に桜の花びらを一つ一つ手描きで仕上げた茶碗セット。温かい飲み物を注ぐと釉薬の色合いが変化し、より風情を醸します。食洗機不可。',
     '哑光黑釉上逐一手绘樱花花瓣的茶碗套装。注入热饮时，釉色随温度变化，别有韵味。不可机洗。',
     '啞光黑釉上逐一手繪樱花花瓣的茶碗套裝。注入熱飲時，釉色隨溫度變化，別有韻味。不可機洗。',
     'Two tea bowls hand-painted with sakura blossoms on a matte black glaze. The glaze shifts subtly with heat. Handwash only.',
     4800, 238, 15,
     ARRAY[
       'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['茶器', '手绘', '京都', 'sakura', 'tea', 'ceramic']),

    -- Product 2: Botanical hand-thrown ceramic tea set (matches image 2 — rustic cup & saucer)
    (merchant1_id, cat_handmade,
     '草花文様 手轆轤 茶碗・茶托セット',
     '草花纹手拉坯茶碗茶托套装',
     '草花紋手拉坯茶碗茶托套裝',
     'Botanical Hand-thrown Ceramic Cup & Saucer',
     '手轆轤で成形し、草花文様を施した一点物の茶器セット。土の温かみが感じられる粗めの質感と、菊の花をモチーフにした繊細な絵付けが特徴です。使うたびに味わいが増します。',
     '手拉坯成型，饰以草花纹样的孤品茶器套装。土坯的温润质感与菊花纹样的细腻彩绘相得益彰，越用越有韵味。',
     '手拉坯成型，飾以草花紋樣的孤品茶器套裝。土坯的溫潤質感與菊花紋樣的細膩彩繪相得益彰，越用越有韻味。',
     'A one-of-a-kind cup and saucer hand-thrown on the wheel with chrysanthemum botanical motifs. Rustic texture develops rich character with use.',
     12000, 596, 3,
     ARRAY[
       'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['陶器', '手工', '一点物', 'ceramic', 'handmade', 'botanical']);

  -- ── Products — Tokyo Wagasa House ─────────────────────────
  insert into products (
    merchant_id, category_id,
    name_ja, name_zh, name_zh_hant, name_en,
    description_ja, description_zh, description_zh_hant, description_en,
    price_jpy, price_cny, stock, images, status, tags
  ) values
    -- Product 3: Chrysanthemum wagasa (matches image 3 — black/red umbrella)
    (merchant2_id, cat_handmade,
     '菊花和傘 黒×赤',
     '菊花和伞 黑×红',
     '菊花和傘 黑×紅',
     'Chrysanthemum Wagasa Umbrella — Black & Red',
     '菊の花をモチーフにした伝統的な和傘。職人が一本一本手作業で仕上げており、黒と赤のコントラストが華やかです。和室のインテリアやフォトスタジオ小道具としても人気。直径約90cm、竹骨32本。',
     '以菊花为主题的传统和伞，工匠手工精制，黑红两色对比鲜明华美。可用作和室装饰或摄影道具，广受好评。直径约90cm，32根竹骨。',
     '以菊花為主題的傳統和傘，工匠手工精製，黑紅兩色對比鮮明華美。可用作和室裝飾或攝影道具，廣受好評。直徑約90cm，32根竹骨。',
     'Traditional wagasa hand-crafted with a chrysanthemum motif. Bold black and red contrast. Popular as room decor and photo props. 90 cm diameter, 32 bamboo ribs.',
     18000, 894, 8,
     ARRAY[
       'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['和傘', '伝統工芸', '菊', 'wagasa', 'umbrella', 'traditional']),

    -- Product 4: Sakura paper lantern (matches image 4 — red paper lantern)
    (merchant2_id, cat_home,
     '桜提灯 大（直径30cm）',
     '樱花提灯 大号（直径30cm）',
     '櫻花提燈 大號（直徑30cm）',
     'Sakura Paper Lantern — Large (30 cm)',
     '職人が手染めした和紙製の桜提灯。灯すと和紙を通して桜のシルエットが幻想的に浮かび上がります。吊り下げ紐・電球ソケット付き。直径30cm。',
     '工匠手染和纸制作的樱花提灯。点亮后，樱花剪影透过和纸幻美浮现。附悬挂绳和灯座。直径30cm。',
     '工匠手染和紙製作的樱花提燈。點亮後，樱花剪影透過和紙幻美浮現。附懸掛繩和燈座。直徑30cm。',
     'Hand-dyed washi paper sakura lantern. When lit, cherry blossom silhouettes glow beautifully through the paper. Includes hanging cord and bulb socket. 30 cm.',
     6800, 338, 20,
     ARRAY[
       'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['提灯', '和紙', '桜', 'lantern', 'washi', 'home']);

  -- ── Products — Bihada Honpo ────────────────────────────────
  insert into products (
    merchant_id, category_id,
    name_ja, name_zh, name_zh_hant, name_en,
    description_ja, description_zh, description_zh_hant, description_en,
    price_jpy, price_cny, stock, images, status, tags
  ) values
    -- Product 5: Full skincare set (matches image 5 — Biore/Aqua skincare range)
    (merchant3_id, cat_beauty,
     'アクア モイスチャー 4点セット',
     '水润保湿护肤四件套',
     '水潤保濕護膚四件套',
     'Aqua Moisture 4-Piece Skincare Set',
     '日本で人気の保湿ケアライン。洗顔料・化粧水・乳液・クリームの4点セット。ヒアルロン酸・コラーゲン配合で、朝晩のケアでぷるぷる潤い肌へ導きます。敏感肌にも使いやすい低刺激処方。',
     '日本热销的保湿护肤系列。洗面奶、化妆水、乳液、面霜四件套。添加玻尿酸、胶原蛋白，早晚坚持使用，肌肤水润弹嫩。低刺激配方，敏感肌同样适用。',
     '日本熱銷的保濕護膚系列。洗面奶、化妝水、乳液、面霜四件套。添加玻尿酸、膠原蛋白，早晚堅持使用，肌膚水潤彈嫩。低刺激配方，敏感肌同樣適用。',
     'Japan''s popular moisturizing skincare line — 4-piece set including cleanser, toner, lotion and cream. Hyaluronic acid & collagen formula. Low-irritation for sensitive skin.',
     9800, 486, 30,
     ARRAY[
       'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['スキンケア', '保湿', '日本製', 'skincare', 'moisturizer', 'set']),

    -- Product 6: Whitening serum
    (merchant3_id, cat_beauty,
     'ホワイトニング 美容液 30ml',
     '美白精华液 30ml',
     '美白精華液 30ml',
     'Whitening Brightening Serum 30 ml',
     '厳選されたビタミンC誘導体を高配合した美容液。くすみや色ムラを整え、透明感のある明るい肌へ導きます。ナイアシンアミド・アルブチン配合。医薬部外品。30ml入り。',
     '高浓度配合严选维生素C衍生物的精华液。改善暗沉与色斑，还原肌肤通透亮泽感。含烟酰胺、熊果苷。准药品。30ml。',
     '高濃度配合嚴選維生素C衍生物的精華液。改善暗沉與色斑，還原肌膚通透亮澤感。含菸鹼醯胺、熊果苷。準藥品。30ml。',
     'High-concentration vitamin C derivative serum. Evens skin tone and clears dullness for a luminous complexion. With niacinamide & arbutin. Quasi-drug. 30 ml.',
     4200, 208, 50,
     ARRAY[
       'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['美白', 'ビタミンC', '美容液', 'whitening', 'serum', 'brightening']);

  raise notice '✓ Demo seed — merchants 1-3 done';
end $$;

-- ============================================================
-- Merchant 4: 職人靴工房 田中 (Tanaka Artisan Footwear)
-- ============================================================
do $$
declare
  demo_user4    uuid := 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
  merchant4_id  uuid := '44444444-4444-4444-4444-444444444444';
  cat_fashion   int;
begin
  select id into cat_fashion from categories where slug = 'fashion';

  -- ── Auth user ─────────────────────────────────────────────
  begin
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_user4,
      'authenticated', 'authenticated', 'tanaka-footwear@demo.waichi.local', '',
      now(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"職人靴工房 田中"}', now(), now(), '', '', '', ''
    )
    on conflict (id) do nothing;
  exception when others then
    raise notice 'Skipping auth.users insert (hosted Supabase): %', sqlerrm;
  end;

  -- ── Profile ───────────────────────────────────────────────
  insert into profiles (id, role, full_name)
  values (demo_user4, 'merchant', '職人靴工房 田中')
  on conflict (id) do nothing;

  -- ── Merchant ──────────────────────────────────────────────
  insert into merchants (
    id, user_id,
    store_name_ja, store_name_zh, store_name_en,
    description_ja, description_zh, description_en,
    prefecture, status
  ) values (
    merchant4_id, demo_user4,
    '職人靴工房 田中',
    '田中手工皮鞋工坊',
    'Tanaka Artisan Footwear',
    '奈良で三代続く革靴工房。国内産ヌバックレザーを一枚一枚手縫いで仕上げ、足に馴染む履き心地と長く使える耐久性を両立。注文から約3週間でお届けします。',
    '奈良三代传承的手工皮鞋工坊。采用国产绒面皮革逐一手工缝制，兼顾贴合脚型的舒适感与经久耐用。接单后约3周发货。',
    'Three-generation artisan shoe workshop in Nara. Each pair is hand-stitched from domestic nubuck leather for a perfect fit and lasting durability. Ships in approx. 3 weeks.',
    '奈良県', 'approved'
  )
  on conflict (id) do nothing;

  -- ── Products ──────────────────────────────────────────────
  insert into products (
    merchant_id, category_id,
    name_ja, name_zh, name_zh_hant, name_en,
    description_ja, description_zh, description_zh_hant, description_en,
    price_jpy, price_cny, stock, images, status, tags
  ) values

    -- Product 7: Natural nubuck slip-on (craftsman + workbench shots)
    (merchant4_id, cat_fashion,
     '手縫いスリッポン ナチュラルヌバック',
     '手工缝制一脚蹬 天然绒面革',
     '手縫一脚蹬 天然絨面革',
     'Hand-stitched Slip-on — Natural Nubuck',
     '柔らかな国産ヌバックレザーを職人が一針一針手縫い。シンプルなシルエットの中に素材の質感と手仕事の温もりが宿るスリッポン。長く履くほど足の形に馴染み、経年変化をお楽しみいただけます。23〜28cm（0.5cm刻み）。',
     '采用柔软国产绒面革，由职人逐针手工缝制。简洁的轮廓中蕴含材质质感与手工温度。越穿越贴脚，尽享岁月变化之美。23〜28cm（0.5cm间隔）。',
     '採用柔軟國產絨面革，由職人逐針手工縫製。簡潔的輪廓中蘊含材質質感與手工溫度。越穿越貼腳，盡享歲月變化之美。23〜28cm（0.5cm間隔）。',
     'Hand-stitched slip-on crafted from soft domestic nubuck leather. The clean silhouette showcases the warmth of artisan craftsmanship. Moulds to your foot over time. Sizes 23–28 cm.',
     32000, 1588, 10,
     ARRAY[
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['革靴', '手縫い', 'ヌバック', '奈良', 'leather', 'slip-on', 'handmade']),

    -- Product 8: Floral embroidered slip-on
    (merchant4_id, cat_fashion,
     '刺繍スリッポン 花柄（ベージュ）',
     '刺绣一脚蹬 花卉图案（米色）',
     '刺繡一脚蹬 花卉圖案（米色）',
     'Embroidered Slip-on — Floral Beige',
     'ナチュラルヌバックに熟練の職人が草花の刺繍を一面に施した限定モデル。同じ柄は二つとなく、履くたびに新たな発見がある一足。フォーマルにもカジュアルにも合わせやすい上品なベージュ。',
     '天然绒面革上由熟练职人遍刺草花刺绣的限量款式。每双图案独一无二，每次穿着都有新发现。优雅米色，正式休闲均可搭配。',
     '天然絨面革上由熟練職人遍刺草花刺繡的限量款式。每雙圖案獨一無二，每次穿著都有新發現。優雅米色，正式休閒均可搭配。',
     'Limited edition slip-on with hand-embroidered floral motifs on natural nubuck. Each pair is unique. Elegant beige suits both formal and casual styles.',
     42000, 2085, 5,
     ARRAY[
       'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['刺繍', '花柄', '革靴', '限定', 'embroidery', 'floral', 'leather']),

    -- Product 9: Signature slip-on in black
    (merchant4_id, cat_fashion,
     'シグネチャースリッポン ブラック',
     '签名款一脚蹬 黑色',
     '簽名款一脚蹬 黑色',
     'Signature Slip-on — Black',
     '工房の定番、漆黒に染めたスムースレザーのシグネチャーモデル。どんなコーディネートにも馴染む洗練されたブラック。マッケイ製法でソールが薄く、スマートな履き心地。踵の金文字「田中」が工房の誇りの証。',
     '工坊经典款，漆黑光滑皮革的招牌款式。深邃黑色百搭任何造型。麦凯制法让鞋底纤薄，穿着利落。鞋跟金色「田中」字样，是工坊匠心的印证。',
     '工坊經典款，漆黑光滑皮革的招牌款式。深邃黑色百搭任何造型。麥凱製法讓鞋底纖薄，穿著俐落。鞋跟金色「田中」字樣，是工坊匠心的印證。',
     'The workshop''s iconic signature model in polished black smooth leather. Versatile black suits any outfit. Blake-stitched construction for a slim, sleek sole. Gold "Tanaka" stamp on the heel.',
     38000, 1886, 8,
     ARRAY[
       'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&fit=crop',
       'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80&fit=crop'
     ],
     'active',
     ARRAY['革靴', 'ブラック', 'シグネチャー', '奈良', 'leather', 'black', 'signature']);

  raise notice '✓ Merchant 4 (職人靴工房 田中) + 3 products inserted';
end $$;
