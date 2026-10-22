import React from 'react';
import { PixelArtGenerator } from '../game/PixelArtGenerator';

interface PixelIconProps {
  iconKey: string;
  size?: number;
  className?: string;
  alt?: string;
}

const COZY_FARM_ICON_URLS: Record<string, string> = {
  // Công cụ (Tools) từ Cozy Farm Starter & Extracted
  icon_hoe: '/assets/cozy-farm/starter/items/hoe.png',
  icon_watering: '/assets/cozy-farm/starter/items/watering-can.png',
  icon_rod: '/assets/cozy-farm/extracted/items/fishing-rod.png',

  // 19 loại Hạt giống (Seeds) từ Cozy Farm
  icon_seed_turnip: '/assets/cozy-farm/extracted/items/seed-turnip.png',
  icon_seed_carrot: '/assets/cozy-farm/extracted/items/seed-carrot.png',
  icon_seed_potato: '/assets/cozy-farm/extracted/items/seed-potato.png',
  icon_seed_radish: '/assets/cozy-farm/extracted/items/seed-radish.png',
  icon_seed_lettuce: '/assets/cozy-farm/extracted/items/seed-lettuce.png',
  icon_seed_strawberry: '/assets/cozy-farm/extracted/items/seed-strawberry.png',
  icon_seed_cauliflower: '/assets/cozy-farm/extracted/items/seed-cauliflower.png',
  icon_seed_cabbage: '/assets/cozy-farm/extracted/items/seed-cabbage.png',
  icon_seed_broccoli: '/assets/cozy-farm/extracted/items/seed-broccoli.png',
  icon_seed_tomato: '/assets/cozy-farm/extracted/items/seed-tomato.png',
  icon_seed_corn: '/assets/cozy-farm/extracted/items/seed-corn.png',
  icon_seed_blueberry: '/assets/cozy-farm/extracted/items/seed-blueberry.png',
  icon_seed_pepper: '/assets/cozy-farm/extracted/items/seed-pepper.png',
  icon_seed_melon: '/assets/cozy-farm/extracted/items/seed-melon.png',
  icon_seed_sunflower: '/assets/cozy-farm/extracted/items/seed-sunflower.png',
  icon_seed_wheat: '/assets/cozy-farm/extracted/items/seed-wheat.png',
  icon_seed_eggplant: '/assets/cozy-farm/extracted/items/seed-eggplant.png',
  icon_seed_onion: '/assets/cozy-farm/extracted/items/seed-onion.png',
  icon_seed_garlic: '/assets/cozy-farm/extracted/items/seed-garlic.png',
  icon_seed_pumpkin: '/assets/cozy-farm/extracted/items/seed-pumpkin.png',

  // 19 loại Nông sản thu hoạch (Crops) từ Cozy Farm
  icon_crop_turnip: '/assets/cozy-farm/extracted/items/turnip.png',
  icon_crop_carrot: '/assets/cozy-farm/extracted/items/carrot.png',
  icon_crop_potato: '/assets/cozy-farm/extracted/items/potato.png',
  icon_crop_radish: '/assets/cozy-farm/extracted/items/radish.png',
  icon_crop_lettuce: '/assets/cozy-farm/extracted/items/lettuce.png',
  icon_crop_strawberry: '/assets/cozy-farm/extracted/items/strawberry.png',
  // icon_crop_cauliflower: pack không có art súp lơ (file gốc là củ cải đỏ) -> vẽ bằng PixelArtGenerator
  icon_crop_cabbage: '/assets/cozy-farm/extracted/items/cabbage.png',
  icon_crop_broccoli: '/assets/cozy-farm/extracted/items/broccoli.png',
  icon_crop_tomato: '/assets/cozy-farm/extracted/items/tomato.png',
  icon_crop_corn: '/assets/cozy-farm/extracted/items/corn.png',
  icon_crop_blueberry: '/assets/cozy-farm/extracted/items/blueberry.png',
  icon_crop_pepper: '/assets/cozy-farm/extracted/items/pepper.png',
  icon_crop_melon: '/assets/cozy-farm/extracted/items/melon.png',
  icon_crop_sunflower: '/assets/cozy-farm/extracted/items/sunflower.png',
  icon_crop_wheat: '/assets/cozy-farm/extracted/items/wheat.png',
  icon_crop_eggplant: '/assets/cozy-farm/extracted/items/eggplant.png',
  icon_crop_onion: '/assets/cozy-farm/extracted/items/onion.png',
  icon_crop_garlic: '/assets/cozy-farm/extracted/items/garlic.png',
  icon_crop_pumpkin: '/assets/cozy-farm/extracted/items/pumpkin.png',

  // Chăn nuôi & Sản phẩm chế biến (Animal & Artisan)
  // Lưu ý: các file trong extracted/items/ bị đặt tên sai (vd. egg.png là cái cuốc,
  // axe.png là cái búa, wool.png là cái búa, bread.png là hũ mật ong...). Những key
  // dưới đây được vẽ trực tiếp trong PixelArtGenerator để icon luôn đúng tên vật phẩm.

  // Cá & Thủy sản (Fish) từ Cozy Farm Fishing
  icon_fish_carp: '/assets/cozy-farm/cozy-farm-fishing/fish/1x/carp.png',
  icon_fish_perch: '/assets/cozy-farm/cozy-farm-fishing/fish/1x/trout.png',
  icon_fish_golden: '/assets/cozy-farm/extracted/items/golden-carp.png',

  // Món ăn, Trái cây rừng, Nấm & Vật liệu (icon vẽ bằng PixelArtGenerator)
  icon_wood: '/assets/cozy-farm/extracted/items/wood.png',

  // Biểu tượng UI gốc của Cozy Farm (cozy-farm-ui)
  icon_coin: '/assets/cozy-farm/cozy-farm-ui/icons/2x/coin.png',
  icon_season_spring: '/assets/cozy-farm/extracted/items/sunflower.png',
  icon_season_summer: '/assets/cozy-farm/cozy-farm-ui/icons/2x/season-summer.png',
  icon_season_autumn: '/assets/cozy-farm/cozy-farm-ui/icons/2x/season-autumn.png',
  icon_season_winter: '/assets/cozy-farm/cozy-farm-ui/icons/2x/season-winter.png',

  // Chân dung 7 Dân Làng (NPC Portraits) từ Cozy Farm Characters
  npc_bac_ba: '/assets/cozy-farm/extracted/portraits/elder.png',
  portrait_bac_ba: '/assets/cozy-farm/extracted/portraits/elder.png',
  npc_di_tu: '/assets/cozy-farm/extracted/portraits/florist.png',
  portrait_di_tu: '/assets/cozy-farm/extracted/portraits/florist.png',
  npc_chu_bay: '/assets/cozy-farm/extracted/portraits/blacksmith.png',
  portrait_chu_bay: '/assets/cozy-farm/extracted/portraits/blacksmith.png',
  npc_be_may: '/assets/cozy-farm/extracted/portraits/villager-blue.png',
  npc_co_may: '/assets/cozy-farm/extracted/portraits/villager-blue.png',
  portrait_be_may: '/assets/cozy-farm/extracted/portraits/villager-blue.png',
  npc_tho_banh: '/assets/cozy-farm/extracted/portraits/baker.png',
  portrait_tho_banh: '/assets/cozy-farm/extracted/portraits/baker.png',
  npc_thuong_nhan: '/assets/cozy-farm/extracted/portraits/merchant.png',
  portrait_thuong_nhan: '/assets/cozy-farm/extracted/portraits/merchant.png',
  npc_truong_lang: '/assets/cozy-farm/extracted/portraits/mayor.png',
  portrait_truong_lang: '/assets/cozy-farm/extracted/portraits/mayor.png'
};

export const PixelIcon: React.FC<PixelIconProps> = ({ iconKey, size = 36, className = '', alt = '' }) => {
  const src = React.useMemo(() => {
    return COZY_FARM_ICON_URLS[iconKey] || PixelArtGenerator.getIconDataUrl(iconKey);
  }, [iconKey]);

  return (
    <img
      src={src}
      alt={alt || iconKey}
      width={size}
      height={size}
      className={`pixel-icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
        objectFit: 'contain'
      }}
      draggable={false}
    />
  );
};
