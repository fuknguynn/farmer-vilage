import type { ItemDef, QuestData, NPCRelationship, Season } from '../types/game';

export const ITEMS: Record<string, ItemDef> = {
  // ==================== CÔNG CỤ (TOOLS) ====================
  tool_hoe: {
    id: 'tool_hoe',
    name: 'Cuốc Đất',
    category: 'tool',
    description: 'Xới đất hoang thành ô ruộng sẵn sàng gieo hạt.',
    iconKey: 'icon_hoe',
    color: '#c87d4b'
  },
  tool_watering: {
    id: 'tool_watering',
    name: 'Bình Tưới Nước',
    category: 'tool',
    description: 'Tưới mát cho cây trồng phát triển mỗi ngày.',
    iconKey: 'icon_watering',
    color: '#4fa4e8'
  },
  tool_scythe: {
    id: 'tool_scythe',
    name: 'Liềm Gặt Thu Hoạch',
    category: 'tool',
    description: 'Thu hoạch nông sản đã chín hoặc phát quang cỏ dại.',
    iconKey: 'icon_scythe',
    color: '#a3b8c2'
  },
  tool_axe: {
    id: 'tool_axe',
    name: 'Rìu Đốn Gỗ',
    category: 'tool',
    description: 'Chặt nhánh cây khô và thu thập gỗ xây dựng nông trại.',
    iconKey: 'icon_axe',
    color: '#d96b43'
  },
  tool_rod: {
    id: 'tool_rod',
    name: 'Cần Câu Tre',
    category: 'tool',
    description: 'Thả câu bên bờ Hồ Gương để bắt những loài cá tươi ngon.',
    iconKey: 'icon_rod',
    color: '#8bc34a'
  },

  // ==================== 19 LOẠI HẠT GIỐNG COZY FARM (SEEDS) ====================
  seed_turnip: {
    id: 'seed_turnip',
    name: 'Hạt Củ Cải Trắng',
    category: 'seed',
    description: 'Cây ngắn ngày dễ trồng, nảy mầm nhanh. (2 ngày)',
    buyPrice: 20,
    sellPrice: 10,
    growDays: 2,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_turnip',
    iconKey: 'icon_seed_turnip',
    color: '#e8dfd5'
  },
  seed_carrot: {
    id: 'seed_carrot',
    name: 'Hạt Cà Rốt Cam',
    category: 'seed',
    description: 'Củ cà rốt giòn ngọt giàu vitamin, rất dễ chăm sóc. (2 ngày)',
    buyPrice: 25,
    sellPrice: 12,
    growDays: 2,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_carrot',
    iconKey: 'icon_seed_carrot',
    color: '#f57c00'
  },
  seed_potato: {
    id: 'seed_potato',
    name: 'Hạt Khoai Tây Vàng',
    category: 'seed',
    description: 'Khoai tây bùi béo, chịu sương lạnh rất tốt. (3 ngày)',
    buyPrice: 35,
    sellPrice: 17,
    growDays: 3,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_potato',
    iconKey: 'icon_seed_potato',
    color: '#d4a359'
  },
  seed_radish: {
    id: 'seed_radish',
    name: 'Hạt Củ Cải Đỏ',
    category: 'seed',
    description: 'Củ cải đỏ tròn xinh, vị thanh mát giòn tan. (2 ngày)',
    buyPrice: 30,
    sellPrice: 15,
    growDays: 2,
    seasons: ['Xuân', 'Hạ', 'Thu'],
    cropId: 'crop_radish',
    iconKey: 'icon_seed_radish',
    color: '#e53935'
  },
  seed_lettuce: {
    id: 'seed_lettuce',
    name: 'Hạt Xà Lách Xanh',
    category: 'seed',
    description: 'Rau xà lách xanh non mơn mởn cho món salad tươi mát. (2 ngày)',
    buyPrice: 28,
    sellPrice: 14,
    growDays: 2,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_lettuce',
    iconKey: 'icon_seed_lettuce',
    color: '#66bb6a'
  },
  seed_strawberry: {
    id: 'seed_strawberry',
    name: 'Hạt Dâu Tây Mộng Mơ',
    category: 'seed',
    description: 'Giống dâu đỏ mọng ngọt ngào đặc trưng của Làng Mây. (3 ngày)',
    buyPrice: 45,
    sellPrice: 22,
    growDays: 3,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_strawberry',
    iconKey: 'icon_seed_strawberry',
    color: '#f25c69'
  },
  seed_cauliflower: {
    id: 'seed_cauliflower',
    name: 'Hạt Súp Lơ Trắng',
    category: 'seed',
    description: 'Bông súp lơ trắng muốt, đầy đặn và bán rất được giá. (4 ngày)',
    buyPrice: 60,
    sellPrice: 30,
    growDays: 4,
    seasons: ['Xuân', 'Đông'],
    cropId: 'crop_cauliflower',
    iconKey: 'icon_seed_cauliflower',
    color: '#f5f5f5'
  },
  seed_cabbage: {
    id: 'seed_cabbage',
    name: 'Hạt Bắp Cải Xanh',
    category: 'seed',
    description: 'Bắp cải cuộn tròn chắc nịch, ngọt lành. (4 ngày)',
    buyPrice: 55,
    sellPrice: 27,
    growDays: 4,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_cabbage',
    iconKey: 'icon_seed_cabbage',
    color: '#81c784'
  },
  seed_broccoli: {
    id: 'seed_broccoli',
    name: 'Hạt Bông Cải Xanh',
    category: 'seed',
    description: 'Bông cải xanh đậm giàu dưỡng chất. (3 ngày)',
    buyPrice: 48,
    sellPrice: 24,
    growDays: 3,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_broccoli',
    iconKey: 'icon_seed_broccoli',
    color: '#388e3c'
  },
  seed_tomato: {
    id: 'seed_tomato',
    name: 'Hạt Cà Chua Đỏ',
    category: 'seed',
    description: 'Quả cà chua căng mọng, dễ chế biến. (3 ngày)',
    buyPrice: 40,
    sellPrice: 20,
    growDays: 3,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_tomato',
    iconKey: 'icon_seed_tomato',
    color: '#e64539'
  },
  seed_corn: {
    id: 'seed_corn',
    name: 'Hạt Bắp Nếp Vàng',
    category: 'seed',
    description: 'Bắp hạt vàng óng, chắc mẩy rất được ưa chuộng. (4 ngày)',
    buyPrice: 65,
    sellPrice: 30,
    growDays: 4,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_corn',
    iconKey: 'icon_seed_corn',
    color: '#f7c844'
  },
  seed_blueberry: {
    id: 'seed_blueberry',
    name: 'Hạt Việt Quất Xanh',
    category: 'seed',
    description: 'Trái việt quất tím xanh mọng nước thơm lừng. (4 ngày)',
    buyPrice: 70,
    sellPrice: 35,
    growDays: 4,
    seasons: ['Hạ', 'Thu'],
    cropId: 'crop_blueberry',
    iconKey: 'icon_seed_blueberry',
    color: '#5c6bc0'
  },
  seed_pepper: {
    id: 'seed_pepper',
    name: 'Hạt Ớt Chuông Đỏ',
    category: 'seed',
    description: 'Ớt chuông giòn thơm, màu sắc rực rỡ. (3 ngày)',
    buyPrice: 42,
    sellPrice: 21,
    growDays: 3,
    seasons: ['Hạ', 'Thu'],
    cropId: 'crop_pepper',
    iconKey: 'icon_seed_pepper',
    color: '#ff7043'
  },
  seed_melon: {
    id: 'seed_melon',
    name: 'Hạt Dưa Lưới Hoàng Kim',
    category: 'seed',
    description: 'Trái dưa lưới ngọt lịm, hương thơm ngào ngạt. (5 ngày)',
    buyPrice: 85,
    sellPrice: 42,
    growDays: 5,
    seasons: ['Hạ', 'Thu'],
    cropId: 'crop_melon',
    iconKey: 'icon_seed_melon',
    color: '#aed581'
  },
  seed_sunflower: {
    id: 'seed_sunflower',
    name: 'Hạt Hoa Hướng Dương',
    category: 'seed',
    description: 'Đóa hoa luôn hướng về ánh mặt trời rực rỡ. (3 ngày)',
    buyPrice: 50,
    sellPrice: 25,
    growDays: 3,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_sunflower',
    iconKey: 'icon_seed_sunflower',
    color: '#ffd52e'
  },
  seed_wheat: {
    id: 'seed_wheat',
    name: 'Hạt Lúa Mì Vàng',
    category: 'seed',
    description: 'Bông lúa mì trĩu hạt dùng làm bánh mì thơm ngon. (3 ngày)',
    buyPrice: 32,
    sellPrice: 16,
    growDays: 3,
    seasons: ['Xuân', 'Hạ', 'Thu'],
    cropId: 'crop_wheat',
    iconKey: 'icon_seed_wheat',
    color: '#ffd54f'
  },
  seed_eggplant: {
    id: 'seed_eggplant',
    name: 'Hạt Cà Tím Bóng',
    category: 'seed',
    description: 'Cà tím vỏ bóng mượt, nướng mỡ hành cực ngon. (4 ngày)',
    buyPrice: 58,
    sellPrice: 29,
    growDays: 4,
    seasons: ['Hạ', 'Thu'],
    cropId: 'crop_eggplant',
    iconKey: 'icon_seed_eggplant',
    color: '#7e57c2'
  },
  seed_onion: {
    id: 'seed_onion',
    name: 'Hạt Hành Tây Thơm',
    category: 'seed',
    description: 'Gia vị không thể thiếu trong căn bếp Làng Mây. (3 ngày)',
    buyPrice: 36,
    sellPrice: 18,
    growDays: 3,
    seasons: ['Xuân', 'Hạ', 'Thu'],
    cropId: 'crop_onion',
    iconKey: 'icon_seed_onion',
    color: '#ffb74d'
  },
  seed_garlic: {
    id: 'seed_garlic',
    name: 'Hạt Tỏi Trắng',
    category: 'seed',
    description: 'Củ tỏi trắng thơm nồng, tăng sức đề kháng. (2 ngày)',
    buyPrice: 30,
    sellPrice: 15,
    growDays: 2,
    seasons: ['Xuân', 'Thu', 'Đông'],
    cropId: 'crop_garlic',
    iconKey: 'icon_seed_garlic',
    color: '#eceff1'
  },
  seed_pumpkin: {
    id: 'seed_pumpkin',
    name: 'Hạt Bí Ngô Hoàng Kim',
    category: 'seed',
    description: 'Giống bí ngô khổng lồ mang lại nguồn thu hoạch cực lớn. (5 ngày)',
    buyPrice: 95,
    sellPrice: 45,
    growDays: 5,
    seasons: ['Xuân', 'Hạ', 'Thu', 'Đông'],
    cropId: 'crop_pumpkin',
    iconKey: 'icon_seed_pumpkin',
    color: '#f0812b'
  },

  // ==================== 19 NÔNG SẢN THU HOẠCH (CROPS) ====================
  crop_turnip: {
    id: 'crop_turnip',
    name: 'Củ Cải Trắng Tươi',
    category: 'crop',
    description: 'Củ cải trắng giòn ngọt vừa nhổ khỏi luống đất thơm.',
    sellPrice: 55,
    energyRestore: 18,
    iconKey: 'icon_crop_turnip',
    color: '#ffffff'
  },
  crop_carrot: {
    id: 'crop_carrot',
    name: 'Cà Rốt Cam Tươi',
    category: 'crop',
    description: 'Cà rốt đỏ cam giòn rụm, ngọt thanh tự nhiên.',
    sellPrice: 68,
    energyRestore: 22,
    iconKey: 'icon_crop_carrot',
    color: '#fb8c00'
  },
  crop_potato: {
    id: 'crop_potato',
    name: 'Khoai Tây Vàng Bùi',
    category: 'crop',
    description: 'Củ khoai tây chắc mẩy, nướng bơ thơm nức mũi.',
    sellPrice: 95,
    energyRestore: 28,
    iconKey: 'icon_crop_potato',
    color: '#d4a359'
  },
  crop_radish: {
    id: 'crop_radish',
    name: 'Củ Cải Đỏ Giòn',
    category: 'crop',
    description: 'Củ cải đỏ tươi rói mới thu hoạch sáng nay.',
    sellPrice: 78,
    energyRestore: 20,
    iconKey: 'icon_crop_radish',
    color: '#e53935'
  },
  crop_lettuce: {
    id: 'crop_lettuce',
    name: 'Xà Lách Xanh Non',
    category: 'crop',
    description: 'Búp xà lách xanh mướt còn đọng sương sớm.',
    sellPrice: 72,
    energyRestore: 19,
    iconKey: 'icon_crop_lettuce',
    color: '#66bb6a'
  },
  crop_strawberry: {
    id: 'crop_strawberry',
    name: 'Dâu Tây Đỏ Mọng',
    category: 'crop',
    description: 'Trái dâu tây chín đỏ, tỏa hương thơm dịu ngọt khó cưỡng.',
    sellPrice: 120,
    energyRestore: 30,
    iconKey: 'icon_crop_strawberry',
    color: '#ff3b56'
  },
  crop_cauliflower: {
    id: 'crop_cauliflower',
    name: 'Súp Lơ Trắng Thượng Hạng',
    category: 'crop',
    description: 'Bông súp lơ trắng mịn màng, nặng tay.',
    sellPrice: 155,
    energyRestore: 36,
    iconKey: 'icon_crop_cauliflower',
    color: '#f5f5f5'
  },
  crop_cabbage: {
    id: 'crop_cabbage',
    name: 'Bắp Cải Xanh Ngọt',
    category: 'crop',
    description: 'Bắp cải xanh cuộn chặt, nấu canh ngọt nước.',
    sellPrice: 145,
    energyRestore: 34,
    iconKey: 'icon_crop_cabbage',
    color: '#81c784'
  },
  crop_broccoli: {
    id: 'crop_broccoli',
    name: 'Bông Cải Xanh Tươi',
    category: 'crop',
    description: 'Bông cải xanh giòn ngon giàu năng lượng.',
    sellPrice: 125,
    energyRestore: 30,
    iconKey: 'icon_crop_broccoli',
    color: '#388e3c'
  },
  crop_tomato: {
    id: 'crop_tomato',
    name: 'Cà Chua Chín Mọng',
    category: 'crop',
    description: 'Quả cà chua đỏ tươi, ăn sống hay nấu súp đều tuyệt hảo.',
    sellPrice: 105,
    energyRestore: 25,
    iconKey: 'icon_crop_tomato',
    color: '#ff5252'
  },
  crop_corn: {
    id: 'crop_corn',
    name: 'Bắp Nếp Vàng Óng',
    category: 'crop',
    description: 'Bắp nếp dẻo thơm, hạt đều tăm tắp.',
    sellPrice: 165,
    energyRestore: 35,
    iconKey: 'icon_crop_corn',
    color: '#ffca28'
  },
  crop_blueberry: {
    id: 'crop_blueberry',
    name: 'Việt Quất Mọng Nước',
    category: 'crop',
    description: 'Chùm việt quất chín mọng, giàu chất chống oxy hóa.',
    sellPrice: 180,
    energyRestore: 38,
    iconKey: 'icon_crop_blueberry',
    color: '#5c6bc0'
  },
  crop_pepper: {
    id: 'crop_pepper',
    name: 'Ớt Chuông Đỏ Giòn',
    category: 'crop',
    description: 'Quả ớt chuông đỏ tươi, vị ngọt dịu.',
    sellPrice: 112,
    energyRestore: 26,
    iconKey: 'icon_crop_pepper',
    color: '#ff7043'
  },
  crop_melon: {
    id: 'crop_melon',
    name: 'Dưa Lưới Ngọt Lịm',
    category: 'crop',
    description: 'Trái dưa lưới ruột vàng thơm mát giải nhiệt mùa hè.',
    sellPrice: 230,
    energyRestore: 48,
    iconKey: 'icon_crop_melon',
    color: '#aed581'
  },
  crop_sunflower: {
    id: 'crop_sunflower',
    name: 'Hoa Hướng Dương Rực Rỡ',
    category: 'crop',
    description: 'Bông hoa vàng tươi tắn, món quà tuyệt vời tặng dân làng.',
    sellPrice: 135,
    energyRestore: 20,
    iconKey: 'icon_crop_sunflower',
    color: '#ffd600'
  },
  crop_wheat: {
    id: 'crop_wheat',
    name: 'Bó Lúa Mì Vàng',
    category: 'crop',
    description: 'Lúa mì chín vàng thơm hương nắng mới.',
    sellPrice: 88,
    energyRestore: 20,
    iconKey: 'icon_crop_wheat',
    color: '#ffd54f'
  },
  crop_eggplant: {
    id: 'crop_eggplant',
    name: 'Cà Tím Bóng Mượt',
    category: 'crop',
    description: 'Trái cà tím tươi ngon vừa hái từ giàn.',
    sellPrice: 150,
    energyRestore: 32,
    iconKey: 'icon_crop_eggplant',
    color: '#7e57c2'
  },
  crop_onion: {
    id: 'crop_onion',
    name: 'Hành Tây Vàng Thơm',
    category: 'crop',
    description: 'Củ hành tây chắc vỏ, vị ngọt dịu khi nấu chín.',
    sellPrice: 95,
    energyRestore: 22,
    iconKey: 'icon_crop_onion',
    color: '#ffb74d'
  },
  crop_garlic: {
    id: 'crop_garlic',
    name: 'Tỏi Trắng Làng Mây',
    category: 'crop',
    description: 'Củ tỏi tép đều, thơm nồng đặc trưng.',
    sellPrice: 80,
    energyRestore: 20,
    iconKey: 'icon_crop_garlic',
    color: '#eceff1'
  },
  crop_pumpkin: {
    id: 'crop_pumpkin',
    name: 'Bí Ngô Hoàng Kim',
    category: 'crop',
    description: 'Quả bí ngô nặng trịch, vỏ cam rực rỡ đạt chuẩn thượng hạng.',
    sellPrice: 260,
    energyRestore: 50,
    iconKey: 'icon_crop_pumpkin',
    color: '#ff9100'
  },

  // ==================== CHĂN NUÔI & CHẾ BIẾN (ANIMAL & ARTISAN) ====================
  item_fodder: {
    id: 'item_fodder',
    name: 'Cỏ Khô Chăn Nuôi',
    category: 'material',
    description: 'Thức ăn dinh dưỡng cho gà và bò sữa trong chuồng trại.',
    buyPrice: 15,
    sellPrice: 8,
    iconKey: 'icon_fodder',
    color: '#dce775'
  },
  product_egg: {
    id: 'product_egg',
    name: 'Trứng Gà Ta Tươi',
    category: 'animal_product',
    description: 'Quả trứng gà ấm nóng mới đẻ mỗi buổi sáng.',
    sellPrice: 75,
    energyRestore: 28,
    iconKey: 'icon_egg',
    color: '#fff3e0'
  },
  product_egg_brown: {
    id: 'product_egg_brown',
    name: 'Trứng Gà Nâu Đặc Sản',
    category: 'animal_product',
    description: 'Trứng gà nâu lòng đào béo ngậy từ giống gà nâu.',
    sellPrice: 95,
    energyRestore: 34,
    iconKey: 'icon_egg_brown',
    color: '#d7ccc8'
  },
  product_milk: {
    id: 'product_milk',
    name: 'Sữa Bò Tươi Nguyên Chất',
    category: 'animal_product',
    description: 'Bình sữa bò thơm béo, giàu năng lượng từ đồng cỏ xanh.',
    sellPrice: 150,
    energyRestore: 45,
    iconKey: 'icon_milk',
    color: '#e3f2fd'
  },
  product_cheese: {
    id: 'product_cheese',
    name: 'Phô MaiỦ Làng Mây',
    category: 'animal_product',
    description: 'Miếng phô mai vàng ươm thơm ngậy tại Tiệm Bánh.',
    buyPrice: 180,
    sellPrice: 210,
    energyRestore: 65,
    iconKey: 'icon_cheese',
    color: '#ffd54f'
  },
  product_wool: {
    id: 'product_wool',
    name: 'Cuộn Lông Cừu Mềm',
    category: 'animal_product',
    description: 'Lông cừu trắng muốt dùng dệt áo ấm mùa đông.',
    buyPrice: 140,
    sellPrice: 160,
    iconKey: 'icon_wool',
    color: '#f5f5f5'
  },

  // ==================== CÁ & THỦY SẢN (FISH) ====================
  fish_carp: {
    id: 'fish_carp',
    name: 'Cá Chép Hồ Gương',
    category: 'fish',
    description: 'Loài cá nước ngọt thân thuộc bơi lội dưới làn nước trong vắt.',
    sellPrice: 90,
    energyRestore: 30,
    iconKey: 'icon_fish_carp',
    color: '#ff8a65'
  },
  fish_perch: {
    id: 'fish_perch',
    name: 'Cá Hồi Suối Mây',
    category: 'fish',
    description: 'Cá hồi suối béo tròn, thịt chắc thơm lừng.',
    sellPrice: 110,
    energyRestore: 34,
    iconKey: 'icon_fish_perch',
    color: '#81c784'
  },
  fish_golden: {
    id: 'fish_golden',
    name: 'Cá Chép Vảy Rồng',
    category: 'fish',
    description: 'Loài cá quý hiếm lấp lánh ánh vàng dưới đáy Hồ Gương!',
    sellPrice: 280,
    energyRestore: 60,
    iconKey: 'icon_fish_golden',
    color: '#ffd700'
  },

  // ==================== MÓN ĂN, TRÁI CÂY RỪNG & VẬT LIỆU ====================
  food_bread: {
    id: 'food_bread',
    name: 'Bánh Mì Bơ Mật Ong',
    category: 'food',
    description: 'Ổ bánh mì nóng giòn phết bơ thơm phức của Tiệm Bánh Làng Mây.',
    buyPrice: 45,
    sellPrice: 25,
    energyRestore: 55,
    iconKey: 'icon_bread',
    color: '#ffb74d'
  },
  food_tea: {
    id: 'food_tea',
    name: 'Mật Ong Hoa Rừng',
    category: 'food',
    description: 'Hũ mật ong vàng sánh ngọt ngào giúp hồi phục nhanh thể lực.',
    buyPrice: 35,
    sellPrice: 18,
    energyRestore: 42,
    iconKey: 'icon_tea',
    color: '#aed581'
  },
  food_apple: {
    id: 'food_apple',
    name: 'Táo Đỏ Rừng Mây',
    category: 'food',
    description: 'Quả táo đỏ giòn ngọt hái từ những tán cây cổ thụ.',
    buyPrice: 30,
    sellPrice: 20,
    energyRestore: 32,
    iconKey: 'icon_apple',
    color: '#e53935'
  },
  food_orange: {
    id: 'food_orange',
    name: 'Cam Vàng Mọng Nước',
    category: 'food',
    description: 'Trái cam mọng nước giàu vitamin C tăng cường sức khỏe.',
    buyPrice: 32,
    sellPrice: 22,
    energyRestore: 35,
    iconKey: 'icon_orange',
    color: '#fb8c00'
  },
  food_berry: {
    id: 'food_berry',
    name: 'Quả Mọng Rừng Xanh',
    category: 'food',
    description: 'Trái quả mọng chua ngọt hái từ các bụi cây ven rừng.',
    sellPrice: 28,
    energyRestore: 25,
    iconKey: 'icon_berry',
    color: '#ec407a'
  },
  food_mushroom_red: {
    id: 'food_mushroom_red',
    name: 'Nấm Đỏ Rừng Thông',
    category: 'food',
    description: 'Loài nấm quý mọc dưới gốc thông sau cơn mưa.',
    sellPrice: 65,
    energyRestore: 28,
    iconKey: 'icon_mushroom_red',
    color: '#ef5350'
  },
  food_mushroom_brown: {
    id: 'food_mushroom_brown',
    name: 'Nấm Hương Rừng Sồi',
    category: 'food',
    description: 'Nấm hương thơm dịu dùng nấu súp cực bổ dưỡng.',
    sellPrice: 55,
    energyRestore: 30,
    iconKey: 'icon_mushroom_brown',
    color: '#8d6e63'
  },
  food_herb: {
    id: 'food_herb',
    name: 'Thảo Mộc Thanh Lương',
    category: 'food',
    description: 'Lá thảo mộc thơm mát mọc tự nhiên quanh suối.',
    sellPrice: 40,
    energyRestore: 26,
    iconKey: 'icon_herb',
    color: '#66bb6a'
  },
  mat_wood: {
    id: 'mat_wood',
    name: 'Khúc Gỗ Thông',
    category: 'material',
    description: 'Gỗ thông thơm tự nhiên thu thập quanh rừng, có thể bán hoặc làm quà.',
    sellPrice: 20,
    iconKey: 'icon_wood',
    color: '#8d6e63'
  }
};

export const INITIAL_QUESTS: QuestData[] = [
  {
    id: 'quest_1_till_water',
    title: 'Khởi Đầu Trên Đất Mới',
    description: 'Dùng Cuốc Đất xới 3 ô ruộng và dùng Bình Tưới Nước tưới ẩm chúng.',
    giver: 'Bác Ba Nông Dân',
    type: 'water',
    currentCount: 0,
    requiredCount: 3,
    rewardGold: 120,
    rewardItem: { itemId: 'seed_strawberry', quantity: 3 },
    completed: false,
    claimed: false
  },
  {
    id: 'quest_2_harvest_turnip',
    title: 'Mùa Vụ Đầu Tiên',
    description: 'Gieo hạt, chăm sóc và thu hoạch 3 Củ Cải Trắng Tươi từ khu vườn của bạn.',
    giver: 'Bác Ba Nông Dân',
    type: 'harvest',
    targetId: 'crop_turnip',
    currentCount: 0,
    requiredCount: 3,
    rewardGold: 200,
    rewardItem: { itemId: 'seed_carrot', quantity: 4 },
    completed: false,
    claimed: false
  },
  {
    id: 'quest_3_talk_villagers',
    title: 'Chào Hỏi Láng Giềng',
    description: 'Trò chuyện làm quen với 4 cư dân trong Thung Lũng Mây Trắng.',
    giver: 'Trưởng Làng Sơn',
    type: 'talk',
    currentCount: 0,
    requiredCount: 4,
    rewardGold: 180,
    rewardItem: { itemId: 'food_bread', quantity: 2 },
    completed: false,
    claimed: false
  },
  {
    id: 'quest_4_fishing',
    title: 'Buổi Chiều Bên Hồ Gương',
    description: 'Dùng Cần Câu Tre câu 2 con cá bất kỳ tại cầu gỗ Hồ Gương phía Tây Nam.',
    giver: 'Bé Mây',
    type: 'fish',
    currentCount: 0,
    requiredCount: 2,
    rewardGold: 220,
    rewardItem: { itemId: 'seed_melon', quantity: 3 },
    completed: false,
    claimed: false
  },
  {
    id: 'quest_5_animal_care',
    title: 'Niềm Vui Chăn Nuôi',
    description: 'Thu thập 2 quả Trứng Gà từ chuồng trại phía Tây Bắc.',
    giver: 'Dì Tư Hoa',
    type: 'collect_egg',
    currentCount: 0,
    requiredCount: 2,
    rewardGold: 280,
    rewardItem: { itemId: 'seed_pumpkin', quantity: 3 },
    completed: false,
    claimed: false
  },
  {
    id: 'quest_6_prosperous_farm',
    title: 'Nông Trại Trù Phú',
    description: 'Bán 6 mặt hàng nông sản qua Thùng Giao Hàng hoặc tại Cửa Hàng.',
    giver: 'Thương Nhân Phú',
    type: 'sell',
    currentCount: 0,
    requiredCount: 6,
    rewardGold: 500,
    rewardItem: { itemId: 'fish_golden', quantity: 1 },
    completed: false,
    claimed: false
  }
];

export const INITIAL_NPCS: Record<string, NPCRelationship> = {
  npc_bac_ba: {
    id: 'npc_bac_ba',
    name: 'Bác Ba Nông Dân',
    role: 'Lão nông thông thái',
    hearts: 2,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_turnip', 'crop_corn', 'food_tea', 'crop_potato'],
    portraitKey: 'npc_bac_ba'
  },
  npc_di_tu: {
    id: 'npc_di_tu',
    name: 'Dì Tư Hoa',
    role: 'Chủ Tiệm Hoa & Hạt Giống',
    hearts: 2,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_strawberry', 'crop_sunflower', 'crop_blueberry', 'food_apple'],
    portraitKey: 'npc_di_tu'
  },
  npc_chu_bay: {
    id: 'npc_chu_bay',
    name: 'Chú Bảy Thợ Rèn',
    role: 'Nghệ nhân rèn nông cụ',
    hearts: 1,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_pumpkin', 'fish_carp', 'mat_wood', 'crop_garlic'],
    portraitKey: 'npc_chu_bay'
  },
  npc_be_may: {
    id: 'npc_be_may',
    name: 'Bé Mây',
    role: 'Cô bé yêu thiên nhiên',
    hearts: 2,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_strawberry', 'crop_melon', 'food_bread', 'food_berry'],
    portraitKey: 'npc_be_may'
  },
  npc_tho_banh: {
    id: 'npc_tho_banh',
    name: 'Đầu Bếp Bánh Mì',
    role: 'Chủ Tiệm Bánh Làng Mây',
    hearts: 2,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_wheat', 'product_milk', 'product_egg', 'product_cheese'],
    portraitKey: 'npc_tho_banh'
  },
  npc_thuong_nhan: {
    id: 'npc_thuong_nhan',
    name: 'Thương Nhân Phú',
    role: 'Chủ Quầy Chợ Phiên',
    hearts: 1,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_pumpkin', 'crop_cauliflower', 'fish_golden', 'product_cheese'],
    portraitKey: 'npc_thuong_nhan'
  },
  npc_truong_lang: {
    id: 'npc_truong_lang',
    name: 'Trưởng Làng Sơn',
    role: 'Trưởng Làng Mây Trắng',
    hearts: 2,
    talkedToday: false,
    giftedToday: false,
    favoriteItems: ['crop_cabbage', 'food_tea', 'fish_perch', 'crop_eggplant'],
    portraitKey: 'npc_truong_lang'
  }
};

export const NPC_DIALOGUES: Record<string, Record<Season | 'default', string[]>> = {
  npc_bac_ba: {
    default: [
      'Chào cháu! Đất đai ở Thung Lũng Mây Trắng màu mỡ lắm, chỉ cần chăm chỉ xới đất và tưới nước mỗi ngày là mầm xanh sẽ vươn lên thôi.',
      'Bác rất vui khi thấy cháu trồng đủ loại rau củ từ Củ Cải, Cà Rốt cho tới Khoai Tây và Súp Lơ!'
    ],
    Xuân: ['Gió xuân ấm áp thế này mà gieo Củ Cải, Cà Rốt hay Dâu Tây thì chẳng mấy chốc mà đầy giỏ!'],
    Hạ: ['Nắng mùa hạ rực rỡ giúp Bắp Nếp, Dưa Lưới và Việt Quất lớn nhanh như thổi.'],
    Thu: ['Tiết trời mùa thu dịu mát rất hợp để trồng Bí Ngô Hoàng Kim, Cà Tím và Bông Cải Xanh!'],
    Đông: ['Mùa đông mặt hồ đóng băng lấp lánh, nhớ ghé ngắm người tuyết cạnh vườn nhé!']
  },
  npc_di_tu: {
    default: [
      'Chào mừng cháu ghé Quảng Trường Làng! Cửa hàng của Dì Tư nay đã nhập đủ 19 loại hạt giống bốn mùa rồi nhé.',
      'Xung quanh bìa rừng có nhiều bụi quả mọng và nấm tươi, rảnh rỗi cháu nhớ dạo quanh thu hoạch nha!'
    ],
    Xuân: ['Dâu Tây Mộng Mơ và Hoa Hướng Dương mùa này thơm lừng cả góc chợ!'],
    Hạ: ['Trời nắng ấm, thưởng thức Dưa Lưới hay Mật Ong Hoa Rừng là khỏe khoắn liền!'],
    Thu: ['Mùa thu lá phong đỏ rực đẹp quá, dì đã bày sẵn hạt giống vụ thu cho cháu rồi đây.'],
    Đông: ['Trời đông tuyết trắng mà nhìn những luống rau bắp cải, súp lơ của cháu vẫn xanh tốt thật đáng khen!']
  },
  npc_chu_bay: {
    default: [
      'Khà khà! Nông cụ sắc bén thì làm đồng mới nhàn! Khi nào tích góp đủ vàng, hãy ghé chỗ Chú Bảy nâng cấp Cuốc và Bình Tưới nhé!',
      'Nâng cấp công cụ giúp cháu tiết kiệm thể lực mỗi lần thao tác trên cánh đồng rộng lớn.'
    ],
    Xuân: ['Đầu năm mới tiếng búa đe vang lên nghe giòn giã chưa kìa!'],
    Hạ: ['Lò rèn mùa hạ hơi nóng một chút, nhưng nhìn những lưỡi cuốc sáng bóng là chú quên hết mệt nhọc.'],
    Thu: ['Vụ mùa lớn sắp tới rồi, nhớ kiểm tra xem nông cụ của cháu đã nâng cấp chưa nhé!'],
    Đông: ['Đứng cạnh lò rèn mùa đông là ấm nhất cả cái làng này đấy cháu ạ!']
  },
  npc_be_may: {
    default: [
      'Anh/Chị chủ nông trại ơi! Hôm nay mặt nước Hồ Gương trong vắt luôn, em thấy có mấy chú cá bơi lấp lánh dưới cầu gỗ!',
      'Đàn gà trắng và gà nâu trong chuồng chạy lon ton đáng yêu quá chừng!'
    ],
    Xuân: ['Cánh đồng hoa nở rực rỡ khắp lối đi, em ngắm mãi không chán luôn!'],
    Hạ: ['Chiều mát ra cầu gỗ Hồ Gương ngồi câu cá là thích nhất trên đời!'],
    Thu: ['Đống lá vàng mùa thu rơi xào xạc vui tai ghê!'],
    Đông: ['Mùa đông em đắp được một chú Người Tuyết to đùng ở ngay sân làng đấy!']
  },
  npc_tho_banh: {
    default: [
      'Chào cháu! Tiệm Bánh Làng Mây lúc nào cũng đỏ lửa. Cháu trồng được Lúa Mì hay thu hoạch Sữa Bò, Trứng Gà mang qua đây là tuyệt nhất!',
      'Bánh mì bơ mật ong và Phô mai ủ của tiệm giúp hồi phục cực kỳ nhiều thể lực khi làm đồng đấy.'
    ],
    Xuân: ['Sáng mùa xuân nướng mẻ bánh mì dâu tây thơm phức cả con phố!'],
    Hạ: ['Mùa hè có bánh tart việt quất mát lạnh ngon tuyệt cú mèo!'],
    Thu: ['Bánh nướng bí ngô là món đặc sản không thể thiếu của tiệm vào mùa thu!'],
    Đông: ['Ghé tiệm bánh sưởi ấm và nhâm nhi bánh mì nóng giòn nào cháu ơi!']
  },
  npc_thuong_nhan: {
    default: [
      'Xin chào nông dân trẻ! Quầy chợ của tôi thu mua mọi loại nông sản tươi sạch từ trang trại của bạn với giá tốt nhất vùng!',
      'Cứ trồng thêm nhiều giống cây quý như Dưa Lưới, Bí Ngô Hoàng Kim hay Súp Lơ, bạn sẽ sớm trở thành đại điền chủ!'
    ],
    Xuân: ['Chợ phiên mùa xuân nhộn nhịp khách phương xa tới mua rau củ tươi!'],
    Hạ: ['Trái cây mùa hạ của trang trại bạn luôn cháy hàng ngay khi vừa lên kệ!'],
    Thu: ['Mùa thu hoạch lớn nhất năm đây rồi, hãy chở thật nhiều nông sản tới nhé!'],
    Đông: ['Hàng hóa mùa đông khan hiếm nên nông sản tươi của bạn càng thêm quý giá!']
  },
  npc_truong_lang: {
    default: [
      'Thay mặt toàn thể cư dân Làng Mây Trắng, bác cảm ơn cháu đã mang sức sống mới về cho nông trại cổ của ông nội!',
      'Từ ngày cháu về đây, đường làng rộn ràng hơn hẳn, quán trọ và tiệm bánh cũng đông vui suốt ngày.'
    ],
    Xuân: ['Lễ hội mùa xuân năm nay chắc chắn sẽ rực rỡ nhờ những luống hoa của cháu!'],
    Hạ: ['Cầu cảng bên Hồ Gương vừa được tu sửa khang trang, rảnh cháu ghé câu cá thư giãn nhé.'],
    Thu: ['Nhìn kho lương thực của làng đầy ắp nông sản mùa thu mà bác tự hào về cháu lắm!'],
    Đông: ['Tuyết phủ trắng mái nhà đẹp như tranh vẽ, chúc cháu một mùa đông ấm áp bên gia đình làng Mây!']
  }
};

export const TOOL_UPGRADE_INFO: Record<number, { name: string; cost: number; energySave: number; color: string }> = {
  1: { name: 'Cơ Bản (Sắt)', cost: 0, energySave: 0, color: '#90a4ae' },
  2: { name: 'Bậc Đồng Đỏ', cost: 250, energySave: 0.5, color: '#d87a4a' },
  3: { name: 'Bậc Bạc Sáng', cost: 600, energySave: 1.0, color: '#cfd8dc' },
  4: { name: 'Bậc Hoàng Kim', cost: 1200, energySave: 1.5, color: '#ffd54f' }
};
