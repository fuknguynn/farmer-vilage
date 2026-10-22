import Phaser from 'phaser';

/**
 * Bộ tạo Pixel Art 16-bit thủ công độ sắc nét cao (True 16-bit Cozy Pixel Art Studio)
 * Đồng bộ 100% với toàn bộ mã vật phẩm, cây trồng và NPC trong gameData.ts:
 * - Hạt giống & Cây trồng: Củ Cải Trắng (turnip), Dâu Tây (strawberry), Bắp Nếp (corn), Cà Chua (tomato), Bí Ngô (pumpkin), Hoa Hướng Dương (sunflower)
 * - Dân làng NPC: Bác Ba Nông Dân (npc_bac_ba), Dì Tư Hoa (npc_di_tu), Chú Bảy Thợ Rèn (npc_chu_bay), Bé Mây (npc_be_may)
 */
export class PixelArtGenerator {
  private static iconCache: Record<string, string> = {};

  private static createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return [canvas, ctx];
  }

  private static p(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  private static outlinedBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    outline: string = '#231309',
    highlight?: string
  ) {
    this.p(ctx, x, y, w, h, outline);
    if (w > 2 && h > 2) {
      this.p(ctx, x + 1, y + 1, w - 2, h - 2, fill);
      if (highlight && w > 4 && h > 3) {
        this.p(ctx, x + 1, y + 1, w - 2, 1, highlight);
      }
    }
  }

  public static getIconDataUrl(key: string): string {
    if (this.iconCache[key]) return this.iconCache[key];

    const [canvas, ctx] = this.createCanvas(24, 24);
    this.drawIcon(ctx, key);
    const url = canvas.toDataURL('image/png');
    this.iconCache[key] = url;
    return url;
  }

  private static drawIcon(ctx: CanvasRenderingContext2D, key: string) {
    ctx.clearRect(0, 0, 24, 24);
    const p = (x: number, y: number, w: number, h: number, c: string) => this.p(ctx, x, y, w, h, c);
    const out = '#1f1108';

    switch (key) {
      case 'icon_hoe': {
        p(4, 19, 14, 2, 'rgba(0,0,0,0.18)');
        for (let i = 0; i < 13; i++) {
          p(4 + i, 18 - i, 3, 3, out);
          p(5 + i, 18 - i, 2, 2, i % 2 === 0 ? '#a86434' : '#854920');
          p(5 + i, 17 - i, 1, 1, '#d18a52');
        }
        p(13, 3, 8, 5, out);
        p(14, 4, 6, 3, '#b0bec5');
        p(14, 4, 5, 1, '#eceff1');
        p(17, 7, 4, 5, out);
        p(18, 7, 2, 4, '#90a4ae');
        p(19, 9, 1, 2, '#ffffff');
        break;
      }
      case 'icon_watering': {
        this.outlinedBox(ctx, 5, 9, 12, 11, '#26a69a', out, '#80cbc4');
        p(6, 17, 10, 2, '#00796b');
        p(9, 12, 4, 4, '#ffd54f');
        p(10, 13, 2, 2, '#fff8e1');
        this.outlinedBox(ctx, 7, 4, 8, 5, '#00897b', out, '#4db6ac');
        ctx.clearRect(9, 6, 4, 3);
        p(16, 10, 5, 4, out);
        p(16, 11, 4, 2, '#4db6ac');
        this.outlinedBox(ctx, 19, 7, 4, 6, '#ffd54f', out, '#fff59d');
        break;
      }
      case 'icon_scythe': {
        // Cán dài + lưỡi liềm cong
        for (let i = 0; i < 14; i++) {
          p(3 + i, 20 - i, 3, 3, out);
          p(4 + i, 20 - i, 1, 2, '#a86434');
        }
        const scytheBlade: Array<[number, number, number]> = [
          [3, 14, 20], [4, 12, 20], [5, 10, 19], [6, 8, 16], [7, 6, 12], [8, 5, 9],
        ];
        for (const [y, x0, x1] of scytheBlade) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of scytheBlade) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#cfd8dc');
        }
        p(15, 4, 4, 1, '#ffffff');
        p(11, 6, 4, 1, '#b0bec5');
        break;
      }
      case 'icon_rod': {
        for (let i = 0; i < 16; i++) {
          p(3 + i, 19 - i, 2, 2, i % 3 === 0 ? '#5d3716' : '#d49b35');
        }
        this.outlinedBox(ctx, 6, 14, 4, 4, '#d32f2f', out, '#ff8a80');
        p(18, 5, 1, 10, '#cfd8dc');
        this.outlinedBox(ctx, 16, 14, 5, 6, '#ffffff', out);
        p(17, 17, 3, 2, '#ff1744');
        break;
      }
      case 'icon_axe': {
        for (let i = 0; i < 13; i++) {
          p(4 + i, 20 - i, 3, 3, out);
          p(5 + i, 20 - i, 1, 2, '#a86434');
        }
        // Đầu rìu thép: lưỡi sáng bên trái, lỗ tra cán ở giữa
        p(12, 3, 10, 9, out);
        p(13, 4, 8, 7, '#90a4ae');
        p(12, 5, 2, 5, '#cfd8dc');
        p(20, 4, 1, 7, '#78909c');
        p(15, 7, 4, 2, '#546e7a');
        p(14, 4, 3, 1, '#eceff1');
        break;
      }
      case 'icon_seed_turnip':
      case 'icon_seed_strawberry':
      case 'icon_seed_tomato':
      case 'icon_seed_corn':
      case 'icon_seed_pumpkin':
      case 'icon_seed_sunflower': {
        this.outlinedBox(ctx, 4, 4, 16, 17, '#e6cba5', out, '#fff3db');
        p(5, 17, 14, 3, '#c8a273');
        p(5, 6, 14, 2, '#a37b4c');
        const badgeColor =
          key === 'icon_seed_turnip'
            ? '#ffffff'
            : key === 'icon_seed_strawberry'
              ? '#ff1744'
              : key === 'icon_seed_tomato'
                ? '#e53935'
                : key === 'icon_seed_corn'
                  ? '#ffd600'
                  : key === 'icon_seed_pumpkin'
                    ? '#ff6d00'
                    : '#ffeb3b';
        this.outlinedBox(ctx, 7, 9, 10, 8, badgeColor, out);
        p(10, 7, 4, 2, '#2e7d32');
        p(9, 11, 2, 2, '#ffffff');
        break;
      }
      case 'icon_turnip':
      case 'icon_crop_turnip': {
        this.outlinedBox(ctx, 8, 2, 8, 6, '#43a047', out, '#81c784');
        p(6, 4, 3, 3, '#2e7d32');
        p(15, 4, 3, 3, '#2e7d32');
        this.outlinedBox(ctx, 5, 7, 14, 13, '#f5f5f5', out, '#ffffff');
        p(6, 8, 12, 4, '#ab47bc');
        p(7, 8, 10, 2, '#ce93d8');
        p(7, 13, 2, 3, '#ffffff');
        p(10, 20, 4, 2, '#d7ccc8');
        break;
      }
      case 'icon_strawberry':
      case 'icon_crop_strawberry': {
        this.outlinedBox(ctx, 7, 3, 10, 4, '#2e7d32', out, '#66bb6a');
        this.outlinedBox(ctx, 5, 6, 14, 13, '#e53935', out, '#ff5252');
        this.outlinedBox(ctx, 7, 17, 10, 4, '#c62828', out);
        p(7, 8, 2, 3, '#ff8a80');
        p(8, 10, 1, 1, '#ffd54f');
        p(12, 9, 1, 1, '#ffd54f');
        p(15, 11, 1, 1, '#ffd54f');
        p(10, 14, 1, 1, '#ffd54f');
        p(14, 15, 1, 1, '#ffd54f');
        break;
      }
      case 'icon_tomato':
      case 'icon_crop_tomato': {
        // Đài lá xanh 5 cánh trên đỉnh quả cà chua
        this.outlinedBox(ctx, 7, 3, 10, 4, '#2e7d32', out, '#66bb6a');
        p(11, 2, 2, 2, '#1b5e20');
        // Quả cà chua đỏ căng tròn bóng bẩy
        this.outlinedBox(ctx, 4, 6, 16, 15, '#e53935', out, '#ff5252');
        p(5, 17, 14, 3, '#b71c1c');
        p(7, 9, 3, 3, '#ffcdd2');
        break;
      }
      case 'icon_cauliflower':
      case 'icon_crop_cauliflower': {
        // Súp lơ trắng: đầu trắng dạng vòm nhiều múi + lá xanh ôm gốc
        p(11, 12, 2, 5, '#2e7d32');
        p(7, 12, 2, 2, '#2e7d32');
        p(5, 13, 2, 2, '#43a047');
        p(3, 14, 2, 2, '#4caf50');
        p(4, 14, 1, 1, '#81c784');
        p(15, 12, 2, 2, '#2e7d32');
        p(17, 13, 2, 2, '#43a047');
        p(19, 14, 3, 2, '#4caf50');
        p(19, 14, 1, 1, '#a5d6a7');
        const head: Array<[number, number, number]> = [
          [3, 9, 14],
          [4, 7, 16],
          [5, 6, 17],
          [6, 5, 18],
          [7, 5, 18],
          [8, 5, 18],
          [9, 6, 17],
          [10, 7, 16],
          [11, 9, 14]
        ];
        const inside = (x: number, y: number) => head.some(([ry, a, b]) => ry === y && x >= a && x <= b);
        for (const [y, a, b] of head) p(a, y, b - a + 1, 1, '#f5f5f0');
        for (let y = 2; y <= 12; y++) {
          for (let x = 0; x < 24; x++) {
            if (inside(x, y)) continue;
            if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) {
              p(x, y, 1, 1, out);
            }
          }
        }
        p(8, 4, 3, 2, '#ffffff');
        p(6, 6, 2, 2, '#ffffff');
        p(15, 7, 2, 3, '#e0e0d1');
        p(12, 9, 3, 2, '#e0e0d1');
        p(11, 5, 1, 4, '#e0e0d1');
        p(13, 5, 1, 2, '#e0e0d1');
        break;
      }
      case 'icon_corn':
      case 'icon_crop_corn': {
        this.outlinedBox(ctx, 4, 9, 5, 12, '#43a047', out, '#81c784');
        this.outlinedBox(ctx, 15, 9, 5, 12, '#2e7d32', out, '#66bb6a');
        this.outlinedBox(ctx, 7, 3, 10, 17, '#ffb300', out, '#ffe082');
        for (let r = 5; r < 18; r += 3) {
          p(9, r, 2, 2, '#fff8e1');
          p(13, r, 2, 2, '#ffa000');
        }
        break;
      }
      case 'icon_pumpkin':
      case 'icon_crop_pumpkin': {
        this.outlinedBox(ctx, 10, 2, 4, 5, '#33691e', out, '#689f38');
        this.outlinedBox(ctx, 3, 6, 18, 15, '#ef6c00', out, '#ffa726');
        this.outlinedBox(ctx, 7, 6, 10, 15, '#fb8c00', out, '#ffcc80');
        p(9, 8, 2, 4, '#ffe0b2');
        break;
      }
      case 'icon_sunflower':
      case 'icon_crop_sunflower': {
        // Thân và lá xanh
        this.outlinedBox(ctx, 10, 14, 4, 8, '#2e7d32', out, '#66bb6a');
        this.outlinedBox(ctx, 5, 16, 6, 4, '#43a047', out);
        this.outlinedBox(ctx, 13, 16, 6, 4, '#43a047', out);
        // Cánh hoa hướng dương vàng rực rỡ
        this.outlinedBox(ctx, 4, 2, 16, 15, '#ffd600', out, '#ffff8d');
        this.outlinedBox(ctx, 7, 5, 10, 9, '#5d4037', out, '#8d6e63');
        p(9, 7, 2, 2, '#ffb300');
        p(13, 9, 2, 2, '#ffb300');
        break;
      }
      case 'icon_egg':
      case 'icon_egg_brown': {
        // Trứng gà trắng / trứng nâu — thân tròn bầu dục
        const shell = key === 'icon_egg_brown' ? '#d7a86e' : '#fff8e1';
        const shellHi = key === 'icon_egg_brown' ? '#f3d5a5' : '#ffffff';
        const shellShade = key === 'icon_egg_brown' ? '#b97a3e' : '#ffe0b2';
        const egg: Array<[number, number, number]> = [
          [3, 9, 14], [4, 7, 16], [5, 6, 17],
          [6, 5, 18], [7, 5, 18], [8, 5, 18], [9, 5, 18], [10, 5, 18],
          [11, 5, 18], [12, 5, 18], [13, 5, 18], [14, 5, 18], [15, 5, 18],
          [16, 5, 18], [17, 6, 17], [18, 7, 16], [19, 9, 14],
        ];
        for (const [y, x0, x1] of egg) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of egg) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, shell);
        }
        p(7, 6, 3, 3, shellHi);
        p(8, 15, 9, 2, shellShade);
        if (key === 'icon_egg_brown') p(11, 9, 2, 2, '#b97a3e');
        break;
      }
      case 'icon_cheese': {
        // Miếng phô mai vàng có lỗ (sản phẩm từ bò sữa)
        const wedge: Array<[number, number, number]> = [
          [7, 3, 20], [8, 4, 20], [9, 5, 20], [10, 6, 20], [11, 7, 20],
          [12, 8, 20], [13, 9, 20], [14, 10, 20], [15, 11, 20], [16, 12, 20],
          [17, 13, 20], [18, 14, 20],
        ];
        for (const [y, x0, x1] of wedge) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of wedge) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#ffd54f');
        }
        p(5, 8, 9, 1, '#ffe082');
        p(14, 8, 6, 1, '#ffb300');
        p(7, 11, 2, 2, '#ffb300');
        p(11, 14, 2, 2, '#ffb300');
        break;
      }
      case 'icon_wool': {
        // Cuộn len trắng (sản phẩm từ cừu)
        const ball: Array<[number, number, number]> = [
          [5, 8, 16], [6, 6, 18], [7, 5, 19], [8, 4, 20],
          [9, 3, 21], [10, 3, 21], [11, 3, 21], [12, 3, 21], [13, 3, 21],
          [14, 3, 21], [15, 4, 20], [16, 5, 19], [17, 7, 17],
        ];
        for (const [y, x0, x1] of ball) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of ball) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#f5f5f5');
        }
        p(6, 12, 5, 1, '#cfd8dc');
        p(8, 9, 5, 1, '#cfd8dc');
        p(11, 14, 5, 1, '#cfd8dc');
        p(14, 8, 1, 4, '#cfd8dc');
        p(7, 7, 3, 2, '#ffffff');
        p(12, 17, 6, 1, '#e0e0e0');
        break;
      }
      case 'icon_shovel': {
        // Xẻng xúc đất — cán gỗ + lưỡi thép
        for (let i = 0; i < 13; i++) {
          p(4 + i, 20 - i, 3, 3, out);
          p(5 + i, 20 - i, 1, 2, '#a86434');
        }
        const blade: Array<[number, number, number]> = [
          [2, 13, 22], [3, 12, 23], [4, 12, 23], [5, 12, 23], [6, 12, 23],
          [7, 13, 22], [8, 14, 21], [9, 16, 19],
        ];
        for (const [y, x0, x1] of blade) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of blade) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#b0bec5');
        }
        p(14, 3, 3, 4, '#eceff1');
        p(15, 6, 6, 1, '#90a4ae');
        break;
      }
      case 'icon_milk': {
        this.outlinedBox(ctx, 7, 3, 10, 4, '#e53935', out, '#ff8a80');
        this.outlinedBox(ctx, 5, 7, 14, 14, '#ffffff', out, '#e3f2fd');
        p(6, 11, 12, 4, '#42a5f5');
        p(9, 12, 6, 2, '#ffffff');
        break;
      }
      case 'icon_fodder': {
        this.outlinedBox(ctx, 3, 6, 18, 14, '#fbc02d', out, '#fff176');
        p(4, 11, 16, 3, '#c62828');
        p(6, 8, 3, 2, '#f57f17');
        p(14, 15, 4, 2, '#f57f17');
        break;
      }
      case 'icon_fish_carp':
      case 'icon_fish_perch':
      case 'icon_fish_golden': {
        const body =
          key === 'icon_fish_golden'
            ? '#ffd600'
            : key === 'icon_fish_carp'
              ? '#ff7043'
              : '#29b6f6';
        const hi =
          key === 'icon_fish_golden'
            ? '#ffff8d'
            : key === 'icon_fish_carp'
              ? '#ffab91'
              : '#81d4fa';
        this.outlinedBox(ctx, 16, 7, 6, 10, body, out, hi);
        this.outlinedBox(ctx, 3, 6, 15, 12, body, out, hi);
        p(6, 9, 3, 3, '#ffffff');
        p(6, 10, 2, 2, '#000000');
        this.outlinedBox(ctx, 9, 3, 6, 4, hi, out);
        break;
      }
      case 'icon_bread': {
        // Ổ bánh mì bơ mật ong — vỏ vàng nâu, rạch chéo trên mặt
        const loaf: Array<[number, number, number]> = [
          [7, 8, 16], [8, 5, 19], [9, 4, 20],
          [10, 3, 21], [11, 3, 21], [12, 3, 21], [13, 3, 21], [14, 3, 21], [15, 3, 21],
          [16, 4, 20], [17, 5, 19], [18, 7, 17],
        ];
        for (const [y, x0, x1] of loaf) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of loaf) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#e0a45e');
        }
        p(6, 9, 4, 2, '#f7cf9a');
        p(11, 8, 4, 1, '#f7cf9a');
        p(5, 11, 5, 1, '#b9772f');
        p(10, 13, 5, 1, '#b9772f');
        p(15, 15, 3, 1, '#b9772f');
        p(6, 16, 12, 1, '#c98a3f');
        break;
      }
      case 'icon_tea': {
        // Hũ mật ong cho vật phẩm "Mật Ong Hoa Rừng"
        this.outlinedBox(ctx, 5, 8, 14, 13, '#ffb300', out, '#ffe082');
        p(6, 17, 12, 3, '#f57f17');
        this.outlinedBox(ctx, 7, 3, 10, 5, '#8d6e63', out, '#a1887f');
        this.outlinedBox(ctx, 8, 11, 8, 5, '#fff8e1', out, '#ffffff');
        p(10, 12, 4, 2, '#ffb300');
        p(11, 12, 2, 1, '#ff6d00');
        break;
      }
      case 'icon_apple': {
        // Táo đỏ (vật phẩm "Táo Đỏ Rừng Mây") — thân tròn, núm + lá
        const apple: Array<[number, number, number]> = [
          [6, 8, 16], [7, 6, 18], [8, 5, 19], [9, 4, 20],
          [10, 3, 21], [11, 3, 21], [12, 3, 21], [13, 3, 21], [14, 3, 21],
          [15, 3, 21], [16, 4, 20], [17, 5, 19], [18, 7, 17], [19, 9, 15],
        ];
        for (const [y, x0, x1] of apple) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of apple) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#e53935');
        }
        p(7, 9, 3, 3, '#ff8a80');
        p(8, 12, 2, 2, '#ffcdd2');
        p(14, 14, 5, 3, '#c62828');
        p(10, 17, 6, 1, '#b71c1c');
        p(11, 2, 2, 5, '#5d4037');
        this.outlinedBox(ctx, 13, 3, 6, 3, '#43a047', out, '#81c784');
        break;
      }
      case 'icon_orange': {
        // Quả cam vàng (vật phẩm "Cam Vàng Mọng Nước") — thân tròn, núm + lá
        const orange: Array<[number, number, number]> = [
          [5, 8, 16], [6, 6, 18], [7, 5, 19], [8, 4, 20],
          [9, 3, 21], [10, 3, 21], [11, 3, 21], [12, 3, 21], [13, 3, 21],
          [14, 3, 21], [15, 4, 20], [16, 5, 19], [17, 6, 18], [18, 8, 16],
        ];
        for (const [y, x0, x1] of orange) p(x0, y, x1 - x0 + 1, 1, out);
        for (const [y, x0, x1] of orange) {
          if (x1 - x0 > 2) p(x0 + 1, y, x1 - x0 - 1, 1, '#fb8c00');
        }
        p(6, 8, 4, 3, '#ffb74d');
        p(7, 9, 2, 2, '#ffe0b2');
        p(13, 13, 5, 4, '#ef6c00');
        p(9, 15, 1, 1, '#e65100');
        p(15, 12, 1, 1, '#e65100');
        p(11, 1, 2, 5, '#5d4037');
        this.outlinedBox(ctx, 13, 2, 6, 3, '#43a047', out, '#81c784');
        break;
      }
      case 'icon_berry': {
        // Chùm quả mọng rừng (vật phẩm "Quả Mọng Rừng Xanh") — 3 quả tròn
        const blob = (bx: number, by: number, fill: string, hi: string) => {
          const pat: Array<[number, number]> = [
            [2, 4], [1, 6], [0, 8], [0, 8], [0, 8], [1, 6], [2, 4],
          ];
          pat.forEach(([inset, w], dy) => p(bx + inset, by + dy, w, 1, out));
          pat.forEach(([inset, w], dy) => p(bx + inset + 1, by + dy, w - 2, 1, fill));
          p(bx + 2, by + 1, 3, 2, hi);
        };
        p(9, 3, 6, 3, '#2e7d32');
        p(11, 1, 3, 2, '#43a047');
        blob(2, 8, '#7b1fa2', '#ce93d8');
        blob(12, 8, '#8e24aa', '#e1bee7');
        blob(7, 13, '#6a1b9a', '#ba68c8');
        break;
      }
      case 'icon_mushroom_red':
      case 'icon_mushroom_brown': {
        const cap = key === 'icon_mushroom_red' ? '#d32f2f' : '#8d6e63';
        const capHi = key === 'icon_mushroom_red' ? '#ff5252' : '#a1887f';
        const capShade = key === 'icon_mushroom_red' ? '#b71c1c' : '#5d4037';
        this.outlinedBox(ctx, 8, 13, 8, 9, '#ffe0b2', out, '#fff3e0');
        p(9, 18, 6, 2, '#ffcc80');
        this.outlinedBox(ctx, 3, 6, 18, 8, cap, out, capHi);
        p(5, 11, 14, 2, capShade);
        if (key === 'icon_mushroom_red') {
          p(6, 8, 3, 2, '#fff8e1');
          p(13, 8, 3, 2, '#fff8e1');
          p(10, 10, 2, 1, '#fff8e1');
        } else {
          p(6, 8, 3, 1, '#bcaaa4');
          p(13, 9, 3, 1, '#bcaaa4');
        }
        break;
      }
      case 'icon_herb': {
        // Bó thảo mộc xanh (vật phẩm "Thảo Mộc Thanh Lương")
        p(11, 7, 2, 14, '#2e7d32');
        this.outlinedBox(ctx, 3, 8, 8, 5, '#43a047', out, '#81c784');
        this.outlinedBox(ctx, 13, 10, 8, 5, '#4caf50', out, '#a5d6a7');
        this.outlinedBox(ctx, 8, 3, 8, 6, '#2e7d32', out, '#66bb6a');
        p(5, 10, 4, 1, '#1b5e20');
        p(15, 12, 4, 1, '#1b5e20');
        p(10, 5, 4, 1, '#1b5e20');
        break;
      }
      case 'icon_wood': {
        this.outlinedBox(ctx, 3, 7, 18, 11, '#795548', out, '#a1887f');
        this.outlinedBox(ctx, 15, 7, 6, 11, '#d7ccc8', out, '#efebe9');
        p(17, 11, 2, 3, '#8d6e63');
        break;
      }
      case 'npc_bac_ba':
      case 'portrait_bac_ba': {
        this.outlinedBox(ctx, 2, 2, 20, 20, '#ffe0b2', out);
        this.outlinedBox(ctx, 2, 2, 20, 7, '#ffd54f', out, '#fff59d');
        p(5, 5, 14, 2, '#fbc02d');
        p(7, 11, 2, 2, '#2b1708');
        p(15, 11, 2, 2, '#2b1708');
        p(8, 15, 8, 4, '#eeeeee');
        p(9, 14, 6, 2, '#d84315');
        break;
      }
      case 'npc_di_tu':
      case 'portrait_di_tu': {
        this.outlinedBox(ctx, 2, 2, 20, 20, '#ffe0b2', out);
        this.outlinedBox(ctx, 3, 2, 18, 7, '#4e342e', out, '#795548');
        p(16, 3, 4, 4, '#ff4081');
        p(7, 11, 2, 2, '#2b1708');
        p(15, 11, 2, 2, '#2b1708');
        p(6, 14, 3, 2, '#ff8a80');
        p(15, 14, 3, 2, '#ff8a80');
        p(9, 15, 6, 2, '#e53935');
        break;
      }
      case 'npc_be_may':
      case 'portrait_co_may':
      case 'portrait_be_may': {
        this.outlinedBox(ctx, 2, 2, 20, 20, '#ffe0b2', out);
        this.outlinedBox(ctx, 3, 2, 18, 8, '#5d4037', out, '#8d6e63');
        p(3, 8, 4, 10, '#4e342e');
        p(17, 8, 4, 10, '#4e342e');
        p(16, 4, 4, 4, '#ffd600');
        p(8, 11, 2, 3, '#2b1708');
        p(14, 11, 2, 3, '#2b1708');
        p(6, 14, 3, 2, '#ff8a80');
        p(15, 14, 3, 2, '#ff8a80');
        p(10, 15, 4, 2, '#e53935');
        break;
      }
      case 'npc_chu_bay':
      case 'portrait_chu_bay': {
        this.outlinedBox(ctx, 2, 2, 20, 20, '#ffccbc', out);
        this.outlinedBox(ctx, 3, 3, 18, 6, '#c62828', out, '#ef5350');
        p(5, 5, 3, 2, '#ffffff');
        p(11, 5, 3, 2, '#ffffff');
        p(7, 11, 2, 2, '#1f1108');
        p(15, 11, 2, 2, '#1f1108');
        p(5, 15, 14, 5, '#3e2723');
        p(10, 16, 4, 2, '#ffab91');
        break;
      }

      // ==================== BIỂU TƯỢNG GIAO DIỆN (UI) ====================
      // Các key ui_* trước đây không có case riêng nên rơi hết vào default và vẽ
      // trùng một ô vàng -> 6 nút HUD trông giống hệt nhau. Mỗi case dưới đây dùng
      // hình khối + màu riêng để phân biệt được ở kích thước 16-20px.
      case 'ui_bag': {
        p(4, 3, 3, 4, out);
        p(17, 3, 3, 4, out);
        this.outlinedBox(ctx, 4, 6, 16, 15, '#8d6e63', out, '#a1887f');
        this.outlinedBox(ctx, 5, 7, 14, 6, '#6d4c41', out, '#8d6e63');
        this.outlinedBox(ctx, 10, 11, 4, 5, '#ffd54f', out, '#fff59d');
        p(11, 14, 2, 1, '#8d6e63');
        break;
      }
      case 'ui_quest': {
        this.outlinedBox(ctx, 5, 3, 14, 18, '#f5e6c8', out, '#fff8e7');
        p(8, 7, 8, 1, '#8d6e63');
        p(8, 10, 8, 1, '#8d6e63');
        p(8, 13, 5, 1, '#8d6e63');
        this.outlinedBox(ctx, 12, 14, 5, 5, '#e53935', out, '#ff8a80');
        this.outlinedBox(ctx, 3, 2, 18, 3, '#d7b98a', out, '#f0dbb2');
        this.outlinedBox(ctx, 3, 19, 18, 3, '#d7b98a', out, '#f0dbb2');
        break;
      }
      case 'ui_shop': {
        p(2, 3, 20, 5, out);
        p(3, 4, 4, 3, '#e53935');
        p(7, 4, 4, 3, '#fff8e7');
        p(11, 4, 4, 3, '#e53935');
        p(15, 4, 4, 3, '#fff8e7');
        p(19, 4, 2, 3, '#e53935');
        this.outlinedBox(ctx, 4, 8, 16, 13, '#c98a52', out, '#e0a96d');
        p(5, 10, 3, 3, '#81d4fa');
        p(16, 10, 3, 3, '#81d4fa');
        this.outlinedBox(ctx, 9, 13, 6, 8, '#6d4c41', out, '#8d6e63');
        break;
      }
      case 'ui_social': {
        // Hai cư dân đứng cạnh nhau: tượng trưng cho "Dân làng" (sổ tay dân cư),
        // thay cho biểu tượng trái tim không còn liên quan tới chức năng này.
        // Người bên trái: tóc nâu, áo cam
        p(5, 4, 7, 7, out);
        p(6, 5, 5, 5, '#ffccbc');
        p(6, 5, 5, 2, '#5d4037');
        p(3, 11, 11, 10, out);
        p(4, 12, 9, 8, '#ef6c00');
        p(5, 12, 7, 2, '#ffb74d');
        // Người bên phải (đứng trước): tóc đen, áo xanh ngọc
        p(13, 3, 7, 7, out);
        p(14, 4, 5, 5, '#ffe0b2');
        p(14, 4, 5, 2, '#3e2723');
        p(11, 10, 11, 11, out);
        p(12, 11, 9, 9, '#26a69a');
        p(13, 11, 7, 2, '#80cbc4');
        // Mắt
        p(7, 8, 1, 1, '#2b1708');
        p(9, 8, 1, 1, '#2b1708');
        p(15, 7, 1, 1, '#2b1708');
        p(17, 7, 1, 1, '#2b1708');
        break;
      }
      case 'ui_paw': {
        // Dấu chân thú: 4 ngón + đệm chân (Sổ Tay Vật Nuôi)
        p(2, 6, 5, 6, out);
        p(3, 7, 3, 4, '#ffb74d');
        p(7, 2, 5, 6, out);
        p(8, 3, 3, 4, '#ffb74d');
        p(12, 2, 5, 6, out);
        p(13, 3, 3, 4, '#ffb74d');
        p(17, 6, 5, 6, out);
        p(18, 7, 3, 4, '#ffb74d');
        // Đệm chân (3 lớp bo tròn, fill liền mạch để không lộ vạch tối bên trong)
        p(6, 11, 12, 3, out);
        p(5, 13, 14, 7, out);
        p(6, 19, 12, 2, out);
        p(7, 12, 10, 2, '#ffb74d');
        p(6, 14, 12, 5, '#ffb74d');
        p(7, 19, 10, 1, '#ffb74d');
        p(7, 12, 6, 1, '#ffd180');
        break;
      }
      case 'ui_settings': {
        p(9, 1, 6, 4, '#78909c');
        p(9, 19, 6, 4, '#78909c');
        p(1, 9, 4, 6, '#78909c');
        p(19, 9, 4, 6, '#78909c');
        p(3, 3, 18, 18, out);
        p(4, 4, 16, 16, '#b0bec5');
        p(5, 5, 14, 14, '#90a4ae');
        p(8, 8, 8, 8, out);
        p(9, 9, 6, 6, '#546e7a');
        p(10, 10, 4, 4, '#1f1108');
        break;
      }
      case 'ui_coin': {
        p(8, 1, 8, 2, out);
        p(5, 3, 14, 2, out);
        p(3, 5, 18, 2, out);
        p(2, 7, 20, 10, out);
        p(3, 17, 18, 2, out);
        p(5, 19, 14, 2, out);
        p(8, 21, 8, 1, out);
        p(8, 3, 8, 2, '#ffd54f');
        p(5, 5, 14, 2, '#ffd54f');
        p(3, 7, 18, 10, '#ffc107');
        p(4, 17, 16, 2, '#ffc107');
        p(6, 19, 12, 1, '#f9a825');
        p(6, 6, 3, 3, '#fff59d');
        p(9, 9, 6, 6, '#f9a825');
        p(10, 10, 4, 4, '#ffd54f');
        break;
      }
      case 'ui_energy': {
        this.outlinedBox(ctx, 3, 7, 17, 11, '#8bc34a', out, '#c5e1a5');
        p(20, 10, 2, 5, out);
        p(20, 11, 1, 3, '#fbc02d');
        p(5, 9, 4, 7, '#ffd600');
        p(10, 9, 4, 7, '#ffd600');
        break;
      }
      case 'ui_sun': {
        p(11, 1, 2, 2, '#ffb300');
        p(11, 21, 2, 2, '#ffb300');
        p(1, 11, 2, 2, '#ffb300');
        p(21, 11, 2, 2, '#ffb300');
        p(4, 4, 3, 3, '#ffb300');
        p(17, 4, 3, 3, '#ffb300');
        p(4, 17, 3, 3, '#ffb300');
        p(17, 17, 3, 3, '#ffb300');
        p(5, 5, 14, 14, out);
        p(6, 6, 12, 12, '#ffd600');
        p(8, 8, 8, 8, '#ffeb3b');
        p(9, 9, 3, 3, '#fffde7');
        break;
      }
      case 'ui_summer': {
        p(11, 1, 2, 4, '#ff8f00');
        p(11, 19, 2, 4, '#ff8f00');
        p(1, 11, 4, 2, '#ff8f00');
        p(19, 11, 4, 2, '#ff8f00');
        p(4, 4, 16, 16, out);
        p(5, 5, 14, 14, '#ff8f00');
        p(8, 8, 8, 8, '#ffd600');
        p(9, 9, 3, 3, '#fff59d');
        break;
      }
      case 'ui_rain': {
        p(4, 4, 6, 6, out);
        p(9, 2, 8, 8, out);
        p(16, 5, 5, 5, out);
        p(3, 8, 19, 7, out);
        p(5, 5, 4, 4, '#cfd8dc');
        p(10, 3, 6, 6, '#e3e8ea');
        p(17, 5, 3, 4, '#cfd8dc');
        p(4, 9, 17, 5, '#b0bec5');
        p(6, 16, 2, 4, '#42a5f5');
        p(11, 17, 2, 4, '#42a5f5');
        p(16, 15, 2, 4, '#42a5f5');
        break;
      }
      case 'ui_spring': {
        p(10, 14, 4, 8, '#43a047');
        p(6, 16, 4, 3, '#66bb6a');
        p(14, 18, 4, 3, '#66bb6a');
        p(6, 4, 6, 6, '#f06292');
        p(14, 4, 6, 6, '#f06292');
        p(10, 2, 6, 6, '#f48fb1');
        p(6, 11, 6, 5, '#f48fb1');
        p(14, 11, 6, 5, '#f48fb1');
        p(10, 8, 4, 4, '#ffd54f');
        p(11, 9, 2, 2, '#fff59d');
        break;
      }
      case 'ui_autumn': {
        p(10, 18, 2, 5, '#6d4c41');
        p(9, 2, 6, 4, '#e64a19');
        p(5, 5, 14, 3, '#ef6c00');
        p(3, 8, 18, 4, '#f57c00');
        p(5, 12, 14, 4, '#e64a19');
        p(8, 16, 8, 3, '#d84315');
        p(11, 5, 2, 12, '#bf360c');
        break;
      }
      case 'ui_winter': {
        const ice = '#4fc3f7';
        p(11, 1, 2, 22, ice);
        p(1, 11, 22, 2, ice);
        for (let i = 0; i < 7; i++) {
          p(4 + i, 4 + i, 2, 2, ice);
          p(18 - i, 4 + i, 2, 2, ice);
          p(4 + i, 18 - i, 2, 2, ice);
          p(18 - i, 18 - i, 2, 2, ice);
        }
        p(10, 10, 4, 4, '#b3e5fc');
        break;
      }

      default: {
        // Icon chưa được định nghĩa: vẽ dấu "?" xám để lỗi lộ ra ngay, thay vì
        // âm thầm vẽ trùng ô vàng khiến người chơi không phân biệt được các nút.
        this.outlinedBox(ctx, 3, 3, 18, 18, '#9e9e9e', out, '#e0e0e0');
        p(9, 7, 6, 2, '#c62828');
        p(13, 9, 2, 3, '#c62828');
        p(11, 11, 4, 2, '#c62828');
        p(11, 13, 2, 2, '#c62828');
        p(11, 17, 2, 2, '#c62828');
        break;
      }
    }
  }

  public static preloadCozyFarmAssets(scene: Phaser.Scene) {
    // 1. Nền Cỏ 4 Mùa (16x16 CC0 PNG từ Cozy Farm & Cozy Farm Seasons)
    scene.load.image('cf_grass_spring_0', '/assets/cozy-farm/starter/tiles/tile-grass-1.png');
    scene.load.image('cf_grass_spring_1', '/assets/cozy-farm/starter/tiles/tile-grass-2.png');
    scene.load.image('cf_grass_spring_2', '/assets/cozy-farm/starter/tiles/tile-grass-3.png');
    scene.load.image('cf_grass_spring_3', '/assets/cozy-farm/starter/props/flowers.png');

    scene.load.image('cf_grass_autumn_0', '/assets/cozy-farm/cozy-farm-seasons/autumn/tiles/1x/autumn-grass-1.png');
    scene.load.image('cf_grass_autumn_1', '/assets/cozy-farm/cozy-farm-seasons/autumn/tiles/1x/autumn-grass-2.png');
    scene.load.image('cf_grass_autumn_2', '/assets/cozy-farm/cozy-farm-seasons/autumn/tiles/1x/autumn-grass-3.png');

    scene.load.image('cf_grass_winter_0', '/assets/cozy-farm/cozy-farm-seasons/winter/tiles/1x/snow-1.png');
    scene.load.image('cf_grass_winter_1', '/assets/cozy-farm/cozy-farm-seasons/winter/tiles/1x/snow-2.png');
    scene.load.image('cf_grass_winter_2', '/assets/cozy-farm/cozy-farm-seasons/winter/tiles/1x/snow-3.png');

    // 2. Bộ 9-Slice Autotiles cho Đường đi, Đất cày, Đất ướt, Hồ nước 3 frame & Mặt băng mùa Đông
    const dirs9 = ['c', 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    dirs9.forEach((d) => {
      scene.load.image(`cf_path_${d}`, `/assets/cozy-farm/starter/tiles/tile-path-${d}.png`);
      scene.load.image(`cf_soil_${d}`, `/assets/cozy-farm/starter/tiles/tile-soil-${d}.png`);
      scene.load.image(`cf_soil_wet_${d}`, `/assets/cozy-farm/starter/tiles/tile-soil-wet-${d}.png`);
      scene.load.image(`cf_soil_snow_${d}`, `/assets/cozy-farm/cozy-farm-seasons/winter/tiles/1x/snowy-soil-${d}.png`);

      // Mặt nước 3 frames mỗi hướng
      scene.load.image(`cf_water_${d}_0`, `/assets/cozy-farm/cozy-farm/tiles/1x/tile-water-${d}.png`);
      scene.load.image(`cf_water_${d}_1`, `/assets/cozy-farm/cozy-farm/tiles/1x/tile-water-${d}-frame2.png`);
      scene.load.image(`cf_water_${d}_2`, `/assets/cozy-farm/cozy-farm/tiles/1x/tile-water-${d}-frame3.png`);

      // Mặt băng mùa Đông
      scene.load.image(`cf_ice_${d}`, `/assets/cozy-farm/cozy-farm-seasons/winter/tiles/1x/ice-${d}.png`);
    });

    // Đường lát đá Quảng Trường Làng
    scene.load.image('cf_cobble_n', '/assets/cozy-farm/cozy-farm-village/tiles/1x/cobble-n.png');
    scene.load.image('cf_cobble_s', '/assets/cozy-farm/cozy-farm-village/tiles/1x/cobble-s.png');

    // Cầu cảng 4 mảnh & Hoa súng
    scene.load.image('cf_dock_side_w', '/assets/cozy-farm/cozy-farm-fishing/dock/1x/dock-side-w.png');
    scene.load.image('cf_dock_side_e', '/assets/cozy-farm/cozy-farm-fishing/dock/1x/dock-side-e.png');
    scene.load.image('cf_dock_end_w', '/assets/cozy-farm/cozy-farm-fishing/dock/1x/dock-end-w.png');
    scene.load.image('cf_dock_end_e', '/assets/cozy-farm/cozy-farm-fishing/dock/1x/dock-end-e.png');
    scene.load.image('cf_prop_lotus', '/assets/cozy-farm/cozy-farm-fishing/pond/1x/lily-pad.png');

    // Bộ Hàng rào & Cổng đóng/mở (16 mảnh)
    const fenceKeys = [
      'fence-nw',
      'fence-ne',
      'fence-sw',
      'fence-se',
      'fence-h',
      'fence-h-post',
      'fence-v',
      'fence-v-post',
      'fence-end-n',
      'fence-end-s',
      'fence-end-e',
      'fence-end-w',
      'fence-post',
      'fence-cross',
      'gate-closed',
      'gate-open'
    ];
    fenceKeys.forEach((fk) => {
      scene.load.image(`cf_${fk}`, `/assets/cozy-farm/starter/fences/${fk}.png`);
    });

    // 3. Đầy đủ 19 loại Cây trồng 4 giai đoạn sinh trưởng (64x16 strip -> 4 frames x 16x16)
    const cropNames = [
      'turnip',
      'carrot',
      'potato',
      'radish',
      'lettuce',
      'strawberry',
      'cauliflower',
      'cabbage',
      'broccoli',
      'tomato',
      'corn',
      'blueberry',
      'pepper',
      'melon',
      'sunflower',
      'wheat',
      'eggplant',
      'onion',
      'garlic',
      'pumpkin'
    ];
    cropNames.forEach((name) => {
      // Súp lơ trắng: file cauliflower-stages.png trong pack thực chất là củ cải đỏ,
      // nên bỏ qua file và vẽ bộ sprite 4 giai đoạn riêng bên dưới.
      if (name === 'cauliflower') return;
      scene.load.image(`cf_crop_${name}_sheet`, `/assets/cozy-farm/extracted/crops/${name}-stages.png`);
    });

    // 4. Nhân vật chính & 7 Dân làng NPC (48x64 sprite sheet -> 3 cols x 4 rows of 16x16)
    scene.load.image('cf_char_farmer', '/assets/cozy-farm/extracted/characters/farmer.png');
    scene.load.image('cf_char_elder', '/assets/cozy-farm/extracted/characters/elder.png');
    scene.load.image('cf_char_florist', '/assets/cozy-farm/extracted/characters/florist.png');
    scene.load.image('cf_char_blacksmith', '/assets/cozy-farm/extracted/characters/blacksmith.png');
    scene.load.image('cf_char_villager_blue', '/assets/cozy-farm/extracted/characters/villager-blue.png');
    scene.load.image('cf_char_merchant', '/assets/cozy-farm/extracted/characters/merchant.png');
    scene.load.image('cf_char_baker', '/assets/cozy-farm/extracted/characters/baker.png');
    scene.load.image('cf_char_mayor', '/assets/cozy-farm/extracted/characters/mayor.png');

    // 5. Vật nuôi 4 biến thể (Gà Trắng, Gà Nâu, Bò Trắng, Bò Nâu)
    scene.load.image('cf_animal_chicken', '/assets/cozy-farm/extracted/animals/chicken-white.png');
    scene.load.image('cf_animal_chicken_brown', '/assets/cozy-farm/extracted/animals/chicken-brown.png');
    scene.load.image('cf_animal_cow', '/assets/cozy-farm/extracted/animals/cow-white.png');
    scene.load.image('cf_animal_cow_brown', '/assets/cozy-farm/extracted/animals/cow-brown.png');

    // 6. Công trình kiến trúc, Cây cối 4 mùa & Đạo cụ trang trí chuẩn 1x sạch nền 100%
    scene.load.image('cf_building_house', '/assets/cozy-farm/cozy-farm/buildings/1x/farmhouse.png');
    scene.load.image('cf_building_house_snow', '/assets/cozy-farm/cozy-farm-seasons/winter/buildings/1x/snowy-farmhouse.png');
    scene.load.image('cf_building_shop', '/assets/cozy-farm/cozy-farm-village/buildings/1x/general-store.png');
    scene.load.image('cf_building_barn', '/assets/cozy-farm/extracted/buildings/barn.png');
    scene.load.image('cf_building_bakery', '/assets/cozy-farm/cozy-farm-village/buildings/1x/bakery.png');
    scene.load.image('cf_building_inn', '/assets/cozy-farm/cozy-farm-village/buildings/1x/inn.png');
    scene.load.image('cf_building_cottage', '/assets/cozy-farm/cozy-farm-village/buildings/1x/cottage-blue.png');
    scene.load.image('cf_building_silo', '/assets/cozy-farm/extracted/buildings/well.png');
    scene.load.image('cf_building_stall', '/assets/cozy-farm/extracted/buildings/stall-wood.png');

    scene.load.image('cf_tree_oak', '/assets/cozy-farm/cozy-farm/trees/1x/oak.png');
    scene.load.image('cf_tree_pine', '/assets/cozy-farm/cozy-farm/trees/1x/pine.png');
    scene.load.image('cf_tree_maple', '/assets/cozy-farm/cozy-farm-seasons/autumn/trees/1x/maple.png');
    scene.load.image('cf_tree_snowy', '/assets/cozy-farm/cozy-farm-seasons/winter/trees/1x/snowy-pine.png');
    scene.load.image('cf_tree_bare', '/assets/cozy-farm/cozy-farm-seasons/winter/trees/1x/bare-oak.png');
    scene.load.image('cf_tree_golden', '/assets/cozy-farm/extracted/buildings/tree-golden.png');

    scene.load.image('cf_prop_shipping_bin', '/assets/cozy-farm/cozy-farm-village/props/1x/crate-apples.png');
    scene.load.image('cf_prop_lantern', '/assets/cozy-farm/cozy-farm-village/props/1x/lamppost.png');
    scene.load.image('cf_prop_well', '/assets/cozy-farm/extracted/buildings/well.png');
    scene.load.image('cf_prop_flowerbed', '/assets/cozy-farm/cozy-farm-village/props/1x/flower-bed.png');
    scene.load.image('cf_prop_bench', '/assets/cozy-farm/cozy-farm-village/props/1x/bench.png');
    scene.load.image('cf_prop_scarecrow', '/assets/cozy-farm/cozy-farm/props/1x/scarecrow.png');
    scene.load.image('cf_prop_scarecrow_snow', '/assets/cozy-farm/cozy-farm-seasons/winter/props/1x/snowy-scarecrow.png');
    scene.load.image('cf_prop_snowman', '/assets/cozy-farm/cozy-farm-seasons/winter/props/1x/snowman.png');
    scene.load.image('cf_prop_leaf_pile', '/assets/cozy-farm/cozy-farm-seasons/autumn/props/1x/leaf-pile.png');
    scene.load.image('cf_prop_bush', '/assets/cozy-farm/starter/props/bush.png');
    scene.load.image('cf_prop_bush_autumn', '/assets/cozy-farm/cozy-farm-seasons/autumn/props/1x/autumn-bush.png');
    scene.load.image('cf_prop_bush_snow', '/assets/cozy-farm/cozy-farm-seasons/winter/props/1x/snowy-bush.png');
    scene.load.image('cf_prop_bush_berry', '/assets/cozy-farm/extracted/items/bush-berry.png');
    scene.load.image('cf_prop_flower_pot', '/assets/cozy-farm/extracted/items/flower-pot.png');
    scene.load.image('cf_prop_rock_large', '/assets/cozy-farm/extracted/items/rock-large.png');
    scene.load.image('cf_prop_rock_small', '/assets/cozy-farm/extracted/items/rock-small.png');
    scene.load.image('cf_prop_mushroom_red', '/assets/cozy-farm/extracted/items/mushroom-red.png');
    scene.load.image('cf_prop_mushroom_brown', '/assets/cozy-farm/extracted/items/mushroom-brown.png');
    scene.load.image('cf_prop_hay', '/assets/cozy-farm/starter/props/hay-bale.png');
    scene.load.image('cf_prop_barrel', '/assets/cozy-farm/starter/props/barrel.png');
    scene.load.image('cf_prop_crate', '/assets/cozy-farm/starter/props/crate.png');
  }

  private static drawScaledImageToTex(
    scene: Phaser.Scene,
    targetKey: string,
    sourceKey: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dw: number,
    dh: number,
    overlayKey?: string,
    withGroundShadow: boolean = false
  ) {
    if (scene.textures.exists(targetKey)) {
      scene.textures.remove(targetKey);
    }
    if (!scene.textures.exists(sourceKey)) return;
    const srcImg = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    if (!srcImg) return;
    const safeSw = sx === 0 && sw > srcImg.width ? srcImg.width : sw;
    const safeSh = sy === 0 && sh > srcImg.height ? srcImg.height : sh;
    const [canvas, ctx] = this.createCanvas(dw, dh);
    ctx.imageSmoothingEnabled = false;
    if (withGroundShadow) {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.28)';
      ctx.beginPath();
      ctx.ellipse(dw * 0.5, dh - 8, dw * 0.34, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.drawImage(srcImg, sx, sy, safeSw, safeSh, 0, 0, dw, dh);
    if (overlayKey && scene.textures.exists(overlayKey)) {
      const ovImg = scene.textures.get(overlayKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (ovImg) {
        ctx.drawImage(ovImg, 0, 0, ovImg.width, ovImg.height, 0, 0, dw, dh);
      }
    }
    scene.textures.addCanvas(targetKey, canvas);
  }

  public static registerAllTextures(scene: Phaser.Scene) {
    if (scene.textures.exists('tile_grass_Xuân_0')) return;

    if (scene.textures.exists('cf_char_farmer')) {
      this.registerCozyFarmTextures(scene);
      return;
    }

    this.generateSeasonGrassTiles(scene);
    this.generateSoilAndPathTiles(scene);
    this.generateCropSprites(scene);
    this.generateCharacterAndAnimalSprites(scene);
    this.generateBuildingsAndProps(scene);
  }

  private static registerCozyFarmTextures(scene: Phaser.Scene) {
    // 1. Nền cỏ 4 mùa (16x16 -> 32x32) — giữ mặt cỏ mịn tự nhiên, không phủ khóm hoa dày đặc lên ô đất
    for (let v = 0; v < 3; v++) {
      this.drawScaledImageToTex(scene, `tile_grass_Xuân_${v}`, `cf_grass_spring_${v}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_grass_Hạ_${v}`, `cf_grass_spring_${v}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_grass_Thu_${v}`, `cf_grass_autumn_${v}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_grass_Đông_${v}`, `cf_grass_winter_${v}`, 0, 0, 16, 16, 32, 32);
    }
    this.drawScaledImageToTex(scene, 'tile_grass_Xuân_3', 'cf_grass_spring_0', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_grass_Hạ_3', 'cf_grass_spring_1', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_grass_Thu_3', 'cf_grass_autumn_1', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_grass_Đông_3', 'cf_grass_winter_1', 0, 0, 16, 16, 32, 32);
    // Khóm hoa dại tách riêng để chỉ điểm xuyết thưa thớt ngoài đồng cỏ tự nhiên
    this.drawScaledImageToTex(scene, 'prop_wildflower', 'cf_grass_spring_3', 0, 0, 16, 16, 28, 28);

    // 2. Bộ 9-Slice Autotiles cho Đường đi, Đất canh tác, Mặt nước 3 frame & Mặt băng mùa Đông
    const dirs9 = ['c', 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    dirs9.forEach((d) => {
      this.drawScaledImageToTex(scene, `tile_path_${d}`, `cf_path_${d}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_soil_${d}`, `cf_soil_${d}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_soil_wet_${d}`, `cf_soil_wet_${d}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_soil_snow_${d}`, `cf_soil_snow_${d}`, 0, 0, 16, 16, 32, 32);
      this.drawScaledImageToTex(scene, `tile_ice_${d}`, `cf_ice_${d}`, 0, 0, 16, 16, 32, 32);
      for (let f = 0; f < 3; f++) {
        this.drawScaledImageToTex(scene, `tile_water_${d}_${f}`, `cf_water_${d}_${f}`, 0, 0, 16, 16, 32, 32);
      }
    });

    // Giữ các khóa mặc định tương thích ngược
    this.drawScaledImageToTex(scene, 'tile_path', 'cf_path_c', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_soil_tilled', 'cf_soil_c', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_soil_watered', 'cf_soil_wet_c', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_water_0', 'cf_water_c_0', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'tile_water_1', 'cf_water_c_1', 0, 0, 16, 16, 32, 32);

    // Đường đá cuội Quảng trường làng (lát kín liền mạch cả 32x32, không để hở vệt cỏ xanh)
    ['tile_cobble_n', 'tile_cobble_s'].forEach((key, idx) => {
      this.addTex(scene, key, 32, 32, (ctx) => {
        this.p(ctx, 0, 0, 32, 32, '#706b66');
        const stones = [
          [1, 1, 13, 6],
          [16, 1, 14, 6],
          [0, 9, 9, 6],
          [11, 9, 12, 6],
          [25, 9, 7, 6],
          [2, 17, 14, 6],
          [18, 17, 13, 6],
          [0, 25, 10, 6],
          [12, 25, 11, 6],
          [25, 25, 7, 6]
        ];
        stones.forEach(([sx, sy, sw, sh], i) => {
          const baseCol = (i + idx) % 2 === 0 ? '#9e9992' : '#8f8a83';
          this.p(ctx, sx, sy, sw, sh, baseCol);
          this.p(ctx, sx, sy, sw, 2, '#b5b0a8');
          this.p(ctx, sx, sy + sh - 1, sw, 1, '#59544f');
        });
      });
    });

    // Cầu cảng 4 mảnh & Hoa súng
    this.drawScaledImageToTex(scene, 'tile_wood_bridge', 'cf_dock_side_e', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'dock_side_w', 'cf_dock_side_w', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'dock_side_e', 'cf_dock_side_e', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'dock_end_w', 'cf_dock_end_w', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'dock_end_e', 'cf_dock_end_e', 0, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'prop_lotus', 'cf_prop_lotus', 0, 0, 16, 16, 32, 32);

    // Bộ 3 mảnh Cầu Gỗ Bắc Ngang Sông chuyên dụng (32x48): mố Tây, nhịp Giữa (trên mặt nước), mố Đông
    (['bridge_west', 'bridge_center', 'bridge_east'] as const).forEach((part) => {
      this.addTex(scene, part, 32, 48, (ctx) => {
        const isCenter = part === 'bridge_center';
        const isWest = part === 'bridge_west';
        const isEast = part === 'bridge_east';

        // 1. Cọc trụ gỗ và bóng đổ dưới mặt nước (chỉ vẽ ở nhịp cầu nằm trên dòng suối)
        if (isCenter) {
          this.p(ctx, 0, 38, 32, 7, 'rgba(22, 38, 58, 0.35)');
          // 2 cọc gỗ trụ cầu cắm xuống nước
          this.outlinedBox(ctx, 4, 35, 6, 11, '#784922', '#3e2a28', '#966033');
          this.outlinedBox(ctx, 22, 35, 6, 11, '#784922', '#3e2a28', '#966033');
        }

        // 2. Dầm cầu ngang đỡ sàn gỗ (y: 8..36)
        this.p(ctx, 0, 8, 32, 28, '#3e2a28');
        this.p(ctx, 0, 34, 32, 3, '#6e421f');

        // 3. Các thanh ván gỗ lát mặt cầu (4 thanh mỗi ô 32px, thông suốt lối đi y: 10..32)
        for (let i = 0; i < 4; i++) {
          const px = i * 8;
          const plankColor = i % 2 === 0 ? '#b87d4b' : '#ab7140';
          this.p(ctx, px + 1, 9, 6, 24, plankColor);
          this.p(ctx, px + 1, 9, 6, 2, '#cc9260'); // Highlight mép trên ván
          this.p(ctx, px + 1, 31, 6, 2, '#8a562b'); // Đổ bóng mép dưới ván
          // Đinh tán gỗ hai đầu ván
          this.p(ctx, px + 3, 12, 2, 2, '#5c381b');
          this.p(ctx, px + 3, 28, 2, 2, '#5c381b');
        }

        // Bậc tam cấp thoải ở mố cầu Tây và mố cầu Đông nối êm vào đường đất
        if (isWest) {
          this.outlinedBox(ctx, 0, 10, 4, 22, '#9c6334', '#3e2a28', '#b87d4b');
        }
        if (isEast) {
          this.outlinedBox(ctx, 28, 10, 4, 22, '#9c6334', '#3e2a28', '#b87d4b');
        }

        // 4. Lan can gỗ phía Bắc (y: 2..10) — chạy dọc mép trên, không chắn lối đi
        this.outlinedBox(ctx, 0, 4, 32, 5, '#9c6334', '#3e2a28', '#c48854');
        if (isWest) {
          this.outlinedBox(ctx, 1, 1, 6, 10, '#8a5429', '#3e2a28', '#b87d4b');
        } else if (isEast) {
          this.outlinedBox(ctx, 25, 1, 6, 10, '#8a5429', '#3e2a28', '#b87d4b');
        } else {
          this.outlinedBox(ctx, 13, 2, 6, 8, '#8a5429', '#3e2a28', '#b87d4b');
        }

        // 5. Lan can gỗ phía Nam (y: 30..37) — chạy dọc mép dưới
        this.outlinedBox(ctx, 0, 31, 32, 5, '#8a5429', '#3e2a28', '#b07543');
        if (isWest) {
          this.outlinedBox(ctx, 1, 28, 6, 9, '#784922', '#3e2a28', '#a36836');
        } else if (isEast) {
          this.outlinedBox(ctx, 25, 28, 6, 9, '#784922', '#3e2a28', '#a36836');
        } else {
          this.outlinedBox(ctx, 13, 29, 6, 8, '#784922', '#3e2a28', '#a36836');
        }
      });
    });

    // Bộ 16 mảnh Hàng rào & Cổng đóng/mở
    this.drawScaledImageToTex(scene, 'prop_fence', 'cf_fence-h-post', 0, 0, 16, 16, 32, 32);
    const fenceKeys = [
      'fence-nw',
      'fence-ne',
      'fence-sw',
      'fence-se',
      'fence-h',
      'fence-h-post',
      'fence-v',
      'fence-v-post',
      'fence-end-n',
      'fence-end-s',
      'fence-end-e',
      'fence-end-w',
      'fence-post',
      'fence-cross',
      'gate-closed',
      'gate-open'
    ];
    fenceKeys.forEach((fk) => {
      this.drawScaledImageToTex(scene, `prop_${fk.replace(/-/g, '_')}`, `cf_${fk}`, 0, 0, 16, 16, 32, 32);
    });

    // Ô đất chưa cuốc: chỉ viền góc cực mảnh để không làm rối mắt trên đồng cỏ
    this.addTex(scene, 'tile_plot_untilled', 32, 32, (ctx) => {
      this.p(ctx, 3, 3, 26, 26, 'rgba(104, 66, 44, 0.08)');
      const corners = [
        [3, 3],
        [26, 3],
        [3, 26],
        [26, 26]
      ];
      corners.forEach(([cx, cy]) => {
        this.p(ctx, cx, cy, 3, 3, 'rgba(62, 42, 40, 0.45)');
      });
    });

    // Tile Địa hình phân tầng: Vách đá Cao Nguyên & Bậc thang đá tạo chiều sâu 3D cho thung lũng
    this.addTex(scene, 'tile_cliff_wall', 32, 32, (ctx) => {
      this.p(ctx, 0, 0, 32, 32, '#7b5842');
      this.p(ctx, 0, 0, 32, 6, '#568d46');
      this.p(ctx, 0, 5, 32, 3, '#3e2a28');
      this.p(ctx, 2, 10, 12, 8, '#8f694f');
      this.p(ctx, 16, 9, 14, 9, '#987257');
      this.p(ctx, 4, 20, 15, 8, '#694935');
      this.p(ctx, 21, 20, 9, 8, '#856047');
      this.p(ctx, 0, 18, 32, 2, '#4e3528');
      this.p(ctx, 15, 8, 2, 10, '#4e3528');
      this.p(ctx, 19, 19, 2, 10, '#4e3528');
      this.p(ctx, 0, 28, 32, 4, 'rgba(34, 20, 16, 0.42)');
    });

    this.addTex(scene, 'tile_stone_stairs', 32, 32, (ctx) => {
      this.p(ctx, 0, 0, 32, 32, '#5e4434');
      for (let step = 0; step < 4; step++) {
        const sy = step * 8;
        this.p(ctx, 2, sy, 28, 6, step % 2 === 0 ? '#b2aba1' : '#9c958b');
        this.p(ctx, 2, sy, 28, 2, '#cdc6bc');
        this.p(ctx, 2, sy + 6, 28, 2, '#3e2a28');
      }
      this.p(ctx, 0, 0, 3, 32, '#787168');
      this.p(ctx, 29, 0, 3, 32, '#787168');
    });

    // 3. Toàn bộ 19 loại Cây trồng 4 giai đoạn
    // Súp lơ trắng vẽ tay: pack gốc không có art súp lơ (file cauliflower-stages.png là củ cải đỏ)
    this.addTex(scene, 'cf_crop_cauliflower_sheet', 64, 16, (ctx) => {
      const out = '#1f1108';
      const p = (x: number, y: number, w: number, h: number, c: string) => this.p(ctx, x, y, w, h, c);
      // Đầu súp lơ dạng vòm: tô khối theo từng hàng rồi viền quanh silhouette
      const blob = (ox: number, rows: Array<[number, number, number]>, body: string) => {
        const inside = (x: number, y: number) => rows.some(([ry, a, b]) => ry === y && x >= a && x <= b);
        for (const [y, a, b] of rows) p(ox + a, y, b - a + 1, 1, body);
        for (let y = rows[0][0] - 1; y <= rows[rows.length - 1][0] + 1; y++) {
          for (let x = 0; x < 16; x++) {
            if (inside(x, y)) continue;
            if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) {
              p(ox + x, y, 1, 1, out);
            }
          }
        }
      };

      // Giai đoạn 0: hạt giống trên luống đất
      p(2, 12, 12, 2, '#3e2723');
      p(3, 11, 10, 2, '#8d6e63');
      p(4, 10, 8, 1, '#a1887f');
      p(5, 12, 1, 1, '#3e2723');
      p(8, 11, 1, 1, '#5d4037');
      p(11, 12, 1, 1, '#3e2723');

      // Giai đoạn 1: mầm non
      p(16 + 7, 9, 2, 4, '#2e7d32');
      p(16 + 4, 8, 3, 2, '#43a047');
      p(16 + 4, 8, 3, 1, '#81c784');
      p(16 + 9, 9, 3, 2, '#4caf50');
      p(16 + 9, 9, 3, 1, '#a5d6a7');
      p(16 + 6, 7, 2, 2, '#66bb6a');

      // Giai đoạn 2: cây lá lớn và nụ trắng nhỏ
      p(32 + 7, 10, 2, 5, '#2e7d32');
      p(32 + 4, 11, 2, 3, '#2e7d32');
      p(32 + 3, 12, 2, 2, '#43a047');
      p(32 + 10, 11, 2, 3, '#2e7d32');
      p(32 + 11, 12, 2, 2, '#4caf50');
      blob(32, [[6, 6, 9], [7, 5, 10], [8, 5, 10]], '#f5f5f0');
      p(32 + 6, 7, 2, 1, '#ffffff');
      p(32 + 9, 8, 1, 1, '#e0e0d1');

      // Giai đoạn 3: súp lơ trắng đã lớn, thu hoạch được
      p(48 + 7, 10, 2, 5, '#2e7d32');
      p(48 + 2, 9, 2, 3, '#2e7d32');
      p(48 + 1, 11, 2, 3, '#43a047');
      p(48 + 0, 13, 2, 1, '#4caf50');
      p(48 + 12, 9, 2, 3, '#2e7d32');
      p(48 + 13, 11, 2, 3, '#4caf50');
      p(48 + 14, 13, 2, 1, '#4caf50');
      blob(
        48,
        [[3, 6, 9], [4, 5, 11], [5, 3, 13], [6, 3, 13], [7, 3, 13], [8, 4, 12], [9, 5, 11]],
        '#f5f5f0'
      );
      // Múi súp lơ và vùng sáng/tối
      p(48 + 5, 4, 3, 2, '#ffffff');
      p(48 + 4, 5, 2, 2, '#ffffff');
      p(48 + 11, 5, 2, 3, '#e0e0d1');
      p(48 + 9, 7, 2, 2, '#e0e0d1');
      p(48 + 7, 5, 1, 3, '#e0e0d1');
      p(48 + 8, 8, 1, 1, '#d6d6c8');
    });

    const cropNames = [
      'turnip',
      'carrot',
      'potato',
      'radish',
      'lettuce',
      'strawberry',
      'cauliflower',
      'cabbage',
      'broccoli',
      'tomato',
      'corn',
      'blueberry',
      'pepper',
      'melon',
      'sunflower',
      'wheat',
      'eggplant',
      'onion',
      'garlic',
      'pumpkin'
    ];
    cropNames.forEach((name) => {
      for (let stage = 0; stage < 4; stage++) {
        this.drawScaledImageToTex(
          scene,
          `crop_${name}_stage_${stage}`,
          `cf_crop_${name}_sheet`,
          stage * 16,
          0,
          16,
          16,
          32,
          32
        );
      }
    });

    // 4. Nhân vật chính & 7 Dân làng NPC với đầy đủ 4 hướng x 3 frame bước đi
    // QUAN TRỌNG: Trong Cozy Farm sprite sheet (48x64), thứ tự hàng chuẩn là:
    // Row 0 = down, Row 1 = up, Row 2 = right (quay phải), Row 3 = left (quay trái)
    const dirRows: Record<'down' | 'up' | 'right' | 'left', number> = {
      down: 0,
      up: 1,
      right: 2,
      left: 3
    };
    const stepCols = [1, 0, 2];
    (Object.keys(dirRows) as Array<'down' | 'up' | 'right' | 'left'>).forEach((dir) => {
      const row = dirRows[dir];
      for (let step = 0; step < 3; step++) {
        const col = stepCols[step];
        this.drawScaledImageToTex(scene, `player_${dir}_${step}`, 'cf_char_farmer', col * 16, row * 16, 16, 16, 32, 32);
      }
    });

    const npcMap: Record<string, string> = {
      npc_bac_ba: 'cf_char_elder',
      npc_di_tu: 'cf_char_florist',
      npc_chu_bay: 'cf_char_blacksmith',
      npc_be_may: 'cf_char_villager_blue',
      npc_tho_banh: 'cf_char_baker',
      npc_thuong_nhan: 'cf_char_merchant',
      npc_truong_lang: 'cf_char_mayor'
    };
    Object.entries(npcMap).forEach(([npcKey, sheetKey]) => {
      // Frame mặc định đứng nhìn xuống
      this.drawScaledImageToTex(scene, npcKey, sheetKey, 16, 0, 16, 16, 32, 32);
      // Cắt đủ 4 hướng x 3 bước đi để NPC đi dạo sống động quanh làng
      (Object.keys(dirRows) as Array<'down' | 'up' | 'right' | 'left'>).forEach((dir) => {
        const row = dirRows[dir];
        for (let step = 0; step < 3; step++) {
          const col = stepCols[step];
          this.drawScaledImageToTex(scene, `${npcKey}_${dir}_${step}`, sheetKey, col * 16, row * 16, 16, 16, 32, 32);
        }
      });
    });

    // 5. Vật nuôi 4 biến thể với hoạt ảnh bước đi 4 hướng chuẩn xác
    this.drawScaledImageToTex(scene, 'animal_chicken', 'cf_animal_chicken', 16, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'animal_chicken_brown', 'cf_animal_chicken_brown', 16, 0, 16, 16, 32, 32);
    this.drawScaledImageToTex(scene, 'animal_cow', 'cf_animal_cow', 32, 0, 32, 32, 48, 48);
    this.drawScaledImageToTex(scene, 'animal_cow_brown', 'cf_animal_cow_brown', 32, 0, 32, 32, 48, 48);
    (Object.keys(dirRows) as Array<'down' | 'up' | 'right' | 'left'>).forEach((dir) => {
      const row = dirRows[dir];
      for (let step = 0; step < 3; step++) {
        const col = stepCols[step];
        this.drawScaledImageToTex(scene, `animal_chicken_${dir}_${step}`, 'cf_animal_chicken', col * 16, row * 16, 16, 16, 32, 32);
        this.drawScaledImageToTex(scene, `animal_chicken_brown_${dir}_${step}`, 'cf_animal_chicken_brown', col * 16, row * 16, 16, 16, 32, 32);
        this.drawScaledImageToTex(scene, `animal_cow_${dir}_${step}`, 'cf_animal_cow', col * 32, row * 32, 32, 32, 48, 48);
        this.drawScaledImageToTex(scene, `animal_cow_brown_${dir}_${step}`, 'cf_animal_cow_brown', col * 32, row * 32, 32, 32, 48, 48);
      }
    });

    // 6. Công trình kiến trúc, Cây cổ thụ 4 mùa (kèm bóng đổ dưới gốc) & Đạo cụ từ Cozy Farm
    this.drawScaledImageToTex(scene, 'building_house', 'cf_building_house', 0, 0, 48, 48, 108, 108, undefined, true);
    this.drawScaledImageToTex(scene, 'building_house_snow', 'cf_building_house_snow', 0, 0, 48, 48, 108, 108, undefined, true);
    this.drawScaledImageToTex(scene, 'building_shop', 'cf_building_shop', 0, 0, 64, 64, 128, 128, undefined, true);
    this.drawScaledImageToTex(scene, 'building_barn', 'cf_building_barn', 0, 0, 86, 82, 128, 122, undefined, true);
    this.drawScaledImageToTex(scene, 'building_bakery', 'cf_building_bakery', 0, 0, 48, 64, 96, 128, undefined, true);
    this.drawScaledImageToTex(scene, 'building_inn', 'cf_building_inn', 0, 0, 64, 80, 128, 160, undefined, true);
    this.drawScaledImageToTex(scene, 'building_cottage', 'cf_building_cottage', 0, 0, 48, 48, 96, 96, undefined, true);
    // Tháp Silo dự trữ thức ăn chăn nuôi (48x80) chuẩn bảng màu Cozy Farm
    this.addTex(scene, 'building_silo', 48, 80, (ctx) => {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.26)';
      ctx.beginPath();
      ctx.ellipse(24, 73, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Thân tháp gạch đỏ kem ấm áp
      this.outlinedBox(ctx, 8, 22, 32, 52, '#c85a48', '#3e2a28', '#dc7260');
      this.p(ctx, 14, 24, 20, 48, '#d96b59');
      // Đai sắt ngang thân Silo
      this.p(ctx, 8, 36, 32, 3, '#59544f');
      this.p(ctx, 8, 52, 32, 3, '#59544f');
      // Cửa lấy cỏ khô dưới chân
      this.outlinedBox(ctx, 18, 58, 12, 16, '#784922', '#3e2a28', '#9c6334');
      // Mái vòm kim loại xám xanh
      this.outlinedBox(ctx, 6, 14, 36, 10, '#7c8d9e', '#3e2a28', '#9cb0c4');
      this.outlinedBox(ctx, 12, 8, 24, 8, '#8fa2b5', '#3e2a28', '#b0c4d8');
      this.outlinedBox(ctx, 20, 4, 8, 5, '#9cb0c4', '#3e2a28', '#c2d6eb');
    });
    this.drawScaledImageToTex(scene, 'building_stall', 'cf_building_stall', 0, 0, 27, 23, 64, 56, undefined, true);

    this.drawScaledImageToTex(scene, 'prop_tree', 'cf_tree_oak', 0, 0, 32, 48, 64, 96, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_tree_pine', 'cf_tree_pine', 0, 0, 32, 48, 64, 96, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_tree_maple', 'cf_tree_maple', 0, 0, 32, 48, 64, 96, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_tree_snowy', 'cf_tree_snowy', 0, 0, 32, 48, 64, 96, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_tree_bare', 'cf_tree_bare', 0, 0, 32, 48, 64, 96, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_tree_golden', 'cf_tree_golden', 0, 0, 32, 48, 64, 96, undefined, true);

    this.drawScaledImageToTex(scene, 'prop_shipping_bin', 'cf_prop_shipping_bin', 0, 0, 32, 16, 48, 28, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_lantern', 'cf_prop_lantern', 0, 0, 16, 32, 32, 64, undefined, true);

    // Giếng Cổ Làng Mây (56x64) — thay thế file well.png bị cắt nhầm vào hình bù nhìn
    this.addTex(scene, 'prop_well', 56, 64, (ctx) => {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.28)';
      ctx.beginPath();
      ctx.ellipse(28, 57, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cột gỗ đỡ mái giếng
      this.outlinedBox(ctx, 12, 18, 5, 26, '#784922', '#3e2a28', '#9c6334');
      this.outlinedBox(ctx, 39, 18, 5, 26, '#784922', '#3e2a28', '#9c6334');
      // Trục quay dây thừng & gàu gỗ
      this.p(ctx, 17, 24, 22, 3, '#5c381b');
      this.p(ctx, 27, 24, 2, 14, '#d8b078');
      this.outlinedBox(ctx, 24, 34, 8, 7, '#9c6334', '#3e2a28', '#b87d4b');
      // Thành giếng xây đá cuội tròn & lòng nước xanh mát
      this.outlinedBox(ctx, 8, 38, 40, 18, '#8f8a83', '#3e2a28', '#b5b0a8');
      this.p(ctx, 13, 40, 30, 5, '#4fa4b8');
      this.p(ctx, 12, 46, 10, 5, '#78726a');
      this.p(ctx, 24, 47, 12, 5, '#9e9992');
      this.p(ctx, 38, 46, 7, 5, '#78726a');
      // Mái ngói gỗ ấm áp trên đỉnh giếng
      this.outlinedBox(ctx, 6, 12, 44, 8, '#a84a3a', '#3e2a28', '#c85a48');
      this.outlinedBox(ctx, 12, 6, 32, 7, '#b85242', '#3e2a28', '#d96b59');
      this.outlinedBox(ctx, 20, 2, 16, 5, '#c85a48', '#3e2a28', '#e68270');
    });
    this.drawScaledImageToTex(scene, 'prop_flowerbed', 'cf_prop_flowerbed', 0, 0, 32, 16, 64, 32);
    this.drawScaledImageToTex(scene, 'prop_bench', 'cf_prop_bench', 0, 0, 32, 16, 64, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_scarecrow', 'cf_prop_scarecrow', 0, 0, 16, 32, 32, 64, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_scarecrow_snow', 'cf_prop_scarecrow_snow', 0, 0, 16, 32, 32, 64, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_snowman', 'cf_prop_snowman', 0, 0, 32, 32, 48, 48, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_leaf_pile', 'cf_prop_leaf_pile', 0, 0, 32, 16, 48, 24);
    this.drawScaledImageToTex(scene, 'prop_bush', 'cf_prop_bush', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_bush_autumn', 'cf_prop_bush_autumn', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_bush_snow', 'cf_prop_bush_snow', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_bush_berry', 'cf_prop_bush_berry', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_flower_pot', 'cf_prop_flower_pot', 0, 0, 16, 16, 28, 28);
    this.drawScaledImageToTex(scene, 'prop_rock_large', 'cf_prop_rock_large', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_rock_small', 'cf_prop_rock_small', 0, 0, 16, 16, 28, 28);
    this.drawScaledImageToTex(scene, 'prop_mushroom_red', 'cf_prop_mushroom_red', 0, 0, 16, 16, 24, 24);
    this.drawScaledImageToTex(scene, 'prop_mushroom_brown', 'cf_prop_mushroom_brown', 0, 0, 16, 16, 24, 24);
    this.drawScaledImageToTex(scene, 'prop_hay', 'cf_prop_hay', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_barrel', 'cf_prop_barrel', 0, 0, 16, 16, 32, 32, undefined, true);
    this.drawScaledImageToTex(scene, 'prop_crate', 'cf_prop_crate', 0, 0, 16, 16, 32, 32, undefined, true);

    this.addTex(scene, 'prop_tree_stump', 32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.28)';
      ctx.beginPath();
      ctx.ellipse(16, 25, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      this.outlinedBox(ctx, 8, 14, 16, 11, '#8a5836', '#3e2a28', '#a67048');
      this.outlinedBox(ctx, 9, 11, 14, 5, '#d8b078', '#3e2a28', '#ebd09e');
      this.p(ctx, 13, 13, 6, 2, '#b08450');
    });

    this.addTex(scene, 'prop_quest_board', 32, 32, (ctx) => {
      this.p(ctx, 4, 27, 24, 3, 'rgba(62, 42, 40, 0.28)');
      this.outlinedBox(ctx, 6, 18, 4, 12, '#68422c', '#3e2a28');
      this.outlinedBox(ctx, 22, 18, 4, 12, '#68422c', '#3e2a28');
      this.outlinedBox(ctx, 3, 5, 26, 16, '#92603c', '#3e2a28', '#b88052');
      this.outlinedBox(ctx, 2, 3, 28, 4, '#dc5454', '#3e2a28', '#e88078');
      this.p(ctx, 6, 8, 20, 10, '#d8c4a0');
      this.p(ctx, 7, 9, 7, 8, '#f6f0e2');
      this.p(ctx, 10, 9, 2, 2, '#dc5454');
      this.p(ctx, 16, 10, 8, 7, '#f6f0e2');
      this.p(ctx, 19, 10, 2, 2, '#5a94c0');
    });

    // 7. Bộ Công Trình & Đạo Cụ Môi Trường Đa Dạng (Chuồng Gà, Cối Xay Gió, Tổ Ong, Xe Kéo, Lửa Trại, Thảm Picnic...)
    // Chuồng Gà Gỗ Mái Đỏ (80x68)
    this.addTex(scene, 'building_coop', 80, 68, (ctx) => {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.26)';
      ctx.beginPath();
      ctx.ellipse(40, 60, 34, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Chân sàn gỗ cao ráo
      this.outlinedBox(ctx, 12, 52, 6, 10, '#68422c', '#3e2a28');
      this.outlinedBox(ctx, 62, 52, 6, 10, '#68422c', '#3e2a28');
      // Thân chuồng gỗ vàng ấm
      this.outlinedBox(ctx, 10, 24, 60, 32, '#d8a868', '#3e2a28', '#ecc488');
      this.p(ctx, 12, 34, 56, 2, '#b08044');
      this.p(ctx, 12, 44, 56, 2, '#b08044');
      // Ô cửa vòm nhỏ cho gà ra vào + cầu thang gỗ
      this.outlinedBox(ctx, 22, 38, 14, 18, '#4a2e1e', '#3e2a28');
      this.outlinedBox(ctx, 23, 52, 12, 12, '#a67048', '#3e2a28', '#c89264');
      this.p(ctx, 25, 55, 8, 2, '#5c381b');
      this.p(ctx, 25, 59, 8, 2, '#5c381b');
      // Cửa sổ thông gió & ổ rơm bên hông
      this.outlinedBox(ctx, 46, 34, 16, 12, '#f6f0e2', '#3e2a28');
      this.p(ctx, 48, 36, 5, 8, '#7ab8d6');
      this.p(ctx, 55, 36, 5, 8, '#7ab8d6');
      // Mái ngói đỏ cam ấm cúng
      this.outlinedBox(ctx, 6, 16, 68, 10, '#b84a3c', '#3e2a28', '#d46454');
      this.outlinedBox(ctx, 12, 9, 56, 9, '#c85646', '#3e2a28', '#e27464');
      this.outlinedBox(ctx, 20, 4, 40, 7, '#d46454', '#3e2a28', '#ee8878');
    });

    // Cối Xay Gió Nông Trại (76x108)
    this.addTex(scene, 'prop_windmill', 76, 108, (ctx) => {
      ctx.fillStyle = 'rgba(38, 24, 20, 0.28)';
      ctx.beginPath();
      ctx.ellipse(38, 99, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Chân đế đá cuội & thân tháp gỗ trắng kem
      this.outlinedBox(ctx, 18, 72, 40, 28, '#8f8a83', '#3e2a28', '#b5b0a8');
      this.outlinedBox(ctx, 21, 34, 34, 40, '#e8dcc8', '#3e2a28', '#f6f0e2');
      this.outlinedBox(ctx, 31, 78, 14, 22, '#784922', '#3e2a28', '#9c6334');
      this.outlinedBox(ctx, 32, 48, 12, 12, '#6ea8c8', '#3e2a28', '#96cce8');
      // Mái vòm gỗ nâu đỏ
      this.outlinedBox(ctx, 18, 24, 40, 12, '#a84a3a', '#3e2a28', '#c85a48');
      this.outlinedBox(ctx, 24, 17, 28, 9, '#b85242', '#3e2a28', '#dc7260');
      // 4 Cánh quạt gỗ căng vải trắng lớn
      this.outlinedBox(ctx, 36, 2, 5, 62, '#68422c', '#3e2a28', '#8a5836');
      this.outlinedBox(ctx, 7, 31, 62, 5, '#68422c', '#3e2a28', '#8a5836');
      this.outlinedBox(ctx, 41, 4, 10, 22, '#f6f0e2', '#3e2a28', '#ffffff');
      this.outlinedBox(ctx, 26, 40, 10, 22, '#f6f0e2', '#3e2a28', '#ffffff');
      this.outlinedBox(ctx, 8, 21, 22, 10, '#f6f0e2', '#3e2a28', '#ffffff');
      this.outlinedBox(ctx, 46, 36, 22, 10, '#f6f0e2', '#3e2a28', '#ffffff');
      this.outlinedBox(ctx, 33, 28, 10, 10, '#d89e48', '#3e2a28', '#f4c068');
    });

    // Máng Ăn Gia Súc & Máng Nước Dài (64x24)
    this.addTex(scene, 'prop_trough', 64, 24, (ctx) => {
      this.p(ctx, 4, 18, 56, 5, 'rgba(38, 24, 20, 0.25)');
      this.outlinedBox(ctx, 4, 6, 56, 14, '#8a5836', '#3e2a28', '#ab7140');
      // Nửa trái đựng cỏ khô vàng, nửa phải đựng nước mát
      this.p(ctx, 8, 9, 23, 7, '#e2b848');
      this.p(ctx, 10, 10, 18, 3, '#f4d468');
      this.p(ctx, 33, 9, 23, 7, '#58a8c8');
      this.p(ctx, 36, 10, 16, 2, '#8ed2ec');
    });

    // Nhà Tổ Ong Mật (32x36)
    this.addTex(scene, 'prop_beehive', 32, 36, (ctx) => {
      this.p(ctx, 5, 30, 22, 4, 'rgba(38, 24, 20, 0.26)');
      this.outlinedBox(ctx, 8, 24, 4, 8, '#68422c', '#3e2a28');
      this.outlinedBox(ctx, 20, 24, 4, 8, '#68422c', '#3e2a28');
      this.outlinedBox(ctx, 6, 14, 20, 13, '#d89a44', '#3e2a28', '#f0b85c');
      this.outlinedBox(ctx, 7, 7, 18, 9, '#e4a84e', '#3e2a28', '#f8c870');
      this.outlinedBox(ctx, 4, 4, 24, 5, '#8a5836', '#3e2a28', '#b07543');
      this.p(ctx, 13, 21, 6, 3, '#3e2a28');
      // 2 chú ong nhỏ bay quanh
      this.p(ctx, 2, 10, 3, 2, '#ffd54f');
      this.p(ctx, 27, 13, 3, 2, '#ffd54f');
    });

    // Xe Kéo Gỗ Chở Nông Sản (64x44)
    this.addTex(scene, 'prop_cart', 64, 44, (ctx) => {
      this.p(ctx, 6, 36, 50, 6, 'rgba(38, 24, 20, 0.28)');
      // Thùng xe gỗ
      this.outlinedBox(ctx, 8, 14, 40, 18, '#9c6334', '#3e2a28', '#b87d4b');
      this.p(ctx, 48, 24, 12, 4, '#68422c');
      // Nông sản chất đầy trong xe (Bí ngô cam, Bắp cải xanh, Cà rốt)
      this.outlinedBox(ctx, 12, 7, 12, 10, '#e67838', '#3e2a28', '#f49858');
      this.outlinedBox(ctx, 25, 8, 11, 9, '#68b048', '#3e2a28', '#88cc64');
      this.outlinedBox(ctx, 35, 9, 10, 8, '#d85040', '#3e2a28', '#f07060');
      // Bánh xe gỗ lớn
      this.outlinedBox(ctx, 14, 25, 14, 14, '#5c381b', '#3e2a28', '#8a5836');
      this.p(ctx, 19, 30, 4, 4, '#d8c4a0');
      this.outlinedBox(ctx, 32, 25, 14, 14, '#5c381b', '#3e2a28', '#8a5836');
      this.p(ctx, 37, 30, 4, 4, '#d8c4a0');
    });

    // Bếp Lửa Trại Ven Hồ (36x36) & Khúc Gỗ Ngồi Nghỉ (40x20)
    this.addTex(scene, 'prop_campfire', 36, 36, (ctx) => {
      this.p(ctx, 4, 24, 28, 8, 'rgba(38, 24, 20, 0.3)');
      // Vòng đá cuội
      const rocks = [
        [6, 22],
        [14, 25],
        [22, 24],
        [26, 19],
        [4, 17]
      ];
      rocks.forEach(([rx, ry]) => {
        this.outlinedBox(ctx, rx, ry, 7, 6, '#8f8a83', '#3e2a28', '#b5b0a8');
      });
      // Củi chéo & Ngọn lửa hồng ấm
      this.p(ctx, 10, 18, 16, 4, '#68422c');
      this.outlinedBox(ctx, 12, 8, 12, 13, '#e65c38', '#3e2a28', '#ff8a50');
      this.p(ctx, 15, 11, 6, 8, '#ffd54f');
      this.p(ctx, 17, 13, 2, 5, '#fff8e1');
    });

    this.addTex(scene, 'prop_log_seat', 40, 20, (ctx) => {
      this.p(ctx, 3, 14, 34, 4, 'rgba(38, 24, 20, 0.25)');
      this.outlinedBox(ctx, 3, 5, 34, 11, '#8a5836', '#3e2a28', '#a67048');
      this.outlinedBox(ctx, 3, 5, 6, 11, '#d8b078', '#3e2a28', '#ebd09e');
    });

    // Thảm Dã Ngoại Caro Đỏ Trắng (64x48)
    this.addTex(scene, 'prop_picnic', 64, 48, (ctx) => {
      this.p(ctx, 4, 6, 56, 38, 'rgba(38, 24, 20, 0.18)');
      this.outlinedBox(ctx, 4, 4, 56, 38, '#f6f0e2', '#3e2a28');
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
          if ((r + c) % 2 === 0) {
            this.p(ctx, 6 + c * 9, 6 + r * 8, 9, 8, '#d85850');
          }
        }
      }
      // Giỏ mây dã ngoại & đĩa trái cây
      this.outlinedBox(ctx, 14, 10, 18, 14, '#b88048', '#3e2a28', '#d8a468');
      this.outlinedBox(ctx, 38, 18, 12, 10, '#fff8e7', '#3e2a28');
      this.p(ctx, 41, 20, 6, 5, '#e65048');
    });

    // Biển Chỉ Đường Ngã Tư (32x40) & Giá Cần Câu Bến Hồ (48x36) & Bơm Nước Cánh Đồng (32x40)
    this.addTex(scene, 'prop_signpost', 32, 40, (ctx) => {
      this.p(ctx, 10, 34, 12, 4, 'rgba(38, 24, 20, 0.28)');
      this.outlinedBox(ctx, 13, 8, 6, 28, '#68422c', '#3e2a28', '#8a5836');
      this.outlinedBox(ctx, 3, 10, 24, 8, '#b88048', '#3e2a28', '#d8a468');
      this.outlinedBox(ctx, 5, 19, 24, 8, '#9c6334', '#3e2a28', '#b87d4b');
    });

    this.addTex(scene, 'prop_fishing_rack', 48, 36, (ctx) => {
      this.p(ctx, 4, 30, 40, 4, 'rgba(38, 24, 20, 0.26)');
      this.outlinedBox(ctx, 6, 8, 4, 24, '#68422c', '#3e2a28', '#8a5836');
      this.outlinedBox(ctx, 38, 8, 4, 24, '#68422c', '#3e2a28', '#8a5836');
      this.outlinedBox(ctx, 4, 10, 40, 4, '#8a5836', '#3e2a28', '#b87d4b');
      // Lưới đánh cá & giỏ cá bên dưới
      this.p(ctx, 12, 14, 16, 12, 'rgba(216, 196, 160, 0.75)');
      this.outlinedBox(ctx, 28, 20, 12, 12, '#9c6334', '#3e2a28', '#b87d4b');
      this.p(ctx, 31, 22, 6, 4, '#58a8c8');
    });

    this.addTex(scene, 'prop_water_pump', 32, 40, (ctx) => {
      this.p(ctx, 4, 33, 24, 4, 'rgba(38, 24, 20, 0.28)');
      this.outlinedBox(ctx, 6, 26, 20, 9, '#8f8a83', '#3e2a28', '#b5b0a8');
      this.outlinedBox(ctx, 10, 10, 8, 18, '#4e788c', '#3e2a28', '#6ea4bc');
      this.p(ctx, 18, 14, 8, 4, '#4e788c');
      this.outlinedBox(ctx, 18, 20, 9, 9, '#9c6334', '#3e2a28', '#b87d4b');
      this.p(ctx, 20, 22, 5, 3, '#58a8c8');
    });
  }

  private static addTex(scene: Phaser.Scene, key: string, w: number, h: number, drawFn: (ctx: CanvasRenderingContext2D) => void) {
    if (scene.textures.exists(key)) return;
    const [canvas, ctx] = this.createCanvas(w, h);
    drawFn(ctx);
    scene.textures.addCanvas(key, canvas);
  }

  private static generateSeasonGrassTiles(scene: Phaser.Scene) {
    const palettes: Record<
      string,
      { base: string; mid: string; shade: string; light: string; flower1: string; flower2: string }
    > = {
      Xuân: {
        base: '#5cb847',
        mid: '#4ea33b',
        shade: '#3b852c',
        light: '#7fd15c',
        flower1: '#ff80ab',
        flower2: '#fff59d'
      },
      Hạ: {
        base: '#46a340',
        mid: '#388e34',
        shade: '#297027',
        light: '#6abf56',
        flower1: '#ffd54f',
        flower2: '#ffffff'
      },
      Thu: {
        base: '#c98a32',
        mid: '#b37524',
        shade: '#8f5815',
        light: '#e0a94c',
        flower1: '#ff5722',
        flower2: '#ffe082'
      },
      Đông: {
        base: '#d8ecf8',
        mid: '#c2dff0',
        shade: '#9ec4de',
        light: '#f2faff',
        flower1: '#81d4fa',
        flower2: '#ffffff'
      }
    };

    Object.entries(palettes).forEach(([season, pal]) => {
      for (let v = 0; v < 4; v++) {
        this.addTex(scene, `tile_grass_${season}_${v}`, 32, 32, (ctx) => {
          this.p(ctx, 0, 0, 32, 32, pal.base);
          this.p(ctx, 2, 2, 12, 10, pal.mid);
          this.p(ctx, 18, 16, 12, 12, pal.mid);
          this.p(ctx, 4, 4, 6, 4, pal.light);
          this.p(ctx, 20, 18, 6, 4, pal.light);

          const drawTuft = (tx: number, ty: number) => {
            this.p(ctx, tx, ty + 2, 5, 2, pal.shade);
            this.p(ctx, tx, ty, 1, 3, pal.shade);
            this.p(ctx, tx + 2, ty - 1, 1, 4, pal.shade);
            this.p(ctx, tx + 4, ty, 1, 3, pal.shade);
            this.p(ctx, tx + 2, ty - 1, 1, 2, pal.light);
          };

          drawTuft(5 + v * 2, 8);
          drawTuft(21 - v * 2, 23);
          if (v % 2 === 0) {
            drawTuft(15, 13);
          }

          if (v === 1) {
            this.p(ctx, 22, 6, 4, 4, pal.shade);
            this.p(ctx, 22, 5, 3, 3, pal.flower1);
            this.p(ctx, 23, 6, 1, 1, '#ffd600');

            this.p(ctx, 8, 22, 3, 3, pal.flower2);
            this.p(ctx, 9, 23, 1, 1, '#ff6d00');
          } else if (v === 2) {
            this.p(ctx, 9, 18, 3, 3, pal.flower1);
            this.p(ctx, 10, 19, 1, 1, '#fff59d');
          } else if (v === 3) {
            this.p(ctx, 12, 7, 2, 2, pal.light);
            this.p(ctx, 25, 14, 2, 2, pal.light);
          }
        });
      }
    });
  }

  private static generateSoilAndPathTiles(scene: Phaser.Scene) {
    this.addTex(scene, 'tile_path', 32, 32, (ctx) => {
      this.p(ctx, 0, 0, 32, 32, '#d4ab72');
      this.p(ctx, 0, 0, 32, 2, '#b88c52');
      this.p(ctx, 0, 30, 32, 2, '#b88c52');
      const stones = [
        { x: 3, y: 4, w: 10, h: 8 },
        { x: 16, y: 3, w: 12, h: 9 },
        { x: 6, y: 15, w: 13, h: 8 },
        { x: 21, y: 15, w: 8, h: 7 },
        { x: 3, y: 24, w: 11, h: 6 },
        { x: 16, y: 24, w: 13, h: 6 }
      ];
      stones.forEach((s, idx) => {
        this.p(ctx, s.x, s.y + 1, s.w, s.h, '#9c733e');
        this.p(ctx, s.x, s.y, s.w, s.h - 1, idx % 2 === 0 ? '#e6c38c' : '#dec092');
        this.p(ctx, s.x + 1, s.y + 1, s.w - 3, 1, '#fff1d6');
      });
    });

    this.addTex(scene, 'tile_plot_untilled', 32, 32, (ctx) => {
      this.p(ctx, 2, 2, 28, 28, 'rgba(92, 58, 30, 0.22)');
      const corners = [
        [2, 2],
        [27, 2],
        [2, 27],
        [27, 27]
      ];
      corners.forEach(([cx, cy]) => {
        this.p(ctx, cx, cy, 3, 3, '#4a2a14');
        this.p(ctx, cx, cy, 2, 2, '#9c6234');
      });
    });

    this.addTex(scene, 'tile_soil_tilled', 32, 32, (ctx) => {
      this.p(ctx, 1, 1, 30, 30, '#3b200e');
      this.p(ctx, 2, 2, 28, 28, '#8a552f');
      for (let ry = 4; ry <= 22; ry += 6) {
        this.p(ctx, 4, ry, 24, 2, '#b37649');
        this.p(ctx, 4, ry + 2, 24, 2, '#6b3e1f');
        this.p(ctx, 6, ry, 3, 1, '#cfa076');
        this.p(ctx, 19, ry, 4, 1, '#cfa076');
      }
    });

    this.addTex(scene, 'tile_soil_watered', 32, 32, (ctx) => {
      this.p(ctx, 1, 1, 30, 30, '#1f0f05');
      this.p(ctx, 2, 2, 28, 28, '#4a2610');
      for (let ry = 4; ry <= 22; ry += 6) {
        this.p(ctx, 4, ry, 24, 2, '#633417');
        this.p(ctx, 4, ry + 2, 24, 2, '#2e1608');
      }
      this.p(ctx, 7, 6, 2, 1, '#81d4fa');
      this.p(ctx, 21, 12, 2, 1, '#81d4fa');
      this.p(ctx, 12, 24, 2, 1, '#81d4fa');
    });

    for (let f = 0; f < 2; f++) {
      this.addTex(scene, `tile_water_${f}`, 32, 32, (ctx) => {
        this.p(ctx, 0, 0, 32, 32, '#1e88b5');
        this.p(ctx, 2, 2, 28, 28, '#289dd2');
        const shift = f * 5;
        this.p(ctx, (4 + shift) % 24, 7, 8, 2, '#7ce0ff');
        this.p(ctx, (14 - shift + 24) % 24, 17, 9, 2, '#7ce0ff');
        this.p(ctx, (8 + shift) % 24, 25, 6, 2, '#b3f0ff');
      });
    }

    this.addTex(scene, 'tile_wood_bridge', 32, 32, (ctx) => {
      this.p(ctx, 0, 3, 32, 4, '#3e210d');
      this.p(ctx, 0, 25, 32, 4, '#3e210d');
      for (let x = 0; x < 32; x += 8) {
        this.outlinedBox(ctx, x, 1, 8, 30, '#9c5d32', '#2b1608', '#c48352');
        this.p(ctx, x + 2, 4, 1, 1, '#2b1608');
        this.p(ctx, x + 2, 26, 1, 1, '#2b1608');
      }
    });
  }

  /**
   * Tạo 4 giai đoạn sinh trưởng rõ rệt cho toàn bộ cây trồng trong gameData.ts
   */
  private static generateCropSprites(scene: Phaser.Scene) {
    const crops = [
      { id: 'crop_turnip', leaf: '#43a047' },
      { id: 'crop_strawberry', leaf: '#2e7d32' },
      { id: 'crop_tomato', leaf: '#2e7d32' },
      { id: 'crop_corn', leaf: '#43a047' },
      { id: 'crop_pumpkin', leaf: '#2e7d32' },
      { id: 'crop_sunflower', leaf: '#388e3c' }
    ];

    const out = '#1b2614';

    crops.forEach((crop) => {
      // Stage 0: Hạt giống vừa gieo
      this.addTex(scene, `${crop.id}_stage_0`, 32, 32, (ctx) => {
        const seeds = [
          [9, 11],
          [20, 10],
          [14, 18],
          [8, 22],
          [21, 21]
        ];
        seeds.forEach(([sx, sy]) => {
          this.p(ctx, sx, sy + 1, 4, 3, '#2b1608');
          this.p(ctx, sx + 1, sy, 2, 2, '#ffe082');
        });
      });

      // Stage 1: Chồi non 2 lá mầm
      this.addTex(scene, `${crop.id}_stage_1`, 32, 32, (ctx) => {
        this.p(ctx, 11, 23, 10, 3, 'rgba(0,0,0,0.25)');
        this.outlinedBox(ctx, 14, 16, 4, 8, '#66bb6a', out);
        this.outlinedBox(ctx, 9, 13, 6, 5, '#43a047', out, '#9ccc65');
        this.outlinedBox(ctx, 17, 13, 6, 5, '#43a047', out, '#9ccc65');
      });

      // Stage 2: Thân cành & nụ hoa
      this.addTex(scene, `${crop.id}_stage_2`, 32, 32, (ctx) => {
        this.p(ctx, 7, 24, 18, 4, 'rgba(0,0,0,0.28)');
        this.outlinedBox(ctx, 8, 12, 16, 12, crop.leaf, out, '#81c784');
        this.outlinedBox(ctx, 6, 15, 6, 8, '#2e7d32', out, '#66bb6a');
        this.outlinedBox(ctx, 20, 15, 6, 8, '#2e7d32', out, '#66bb6a');
        this.p(ctx, 12, 14, 3, 3, '#fff59d');
        this.p(ctx, 18, 16, 3, 3, '#fff59d');
      });

      // Stage 3: Nông sản chín rực rỡ
      this.addTex(scene, `${crop.id}_stage_3`, 32, 32, (ctx) => {
        this.p(ctx, 5, 25, 22, 4, 'rgba(0,0,0,0.32)');

        if (crop.id === 'crop_turnip') {
          this.outlinedBox(ctx, 9, 3, 14, 9, '#2e7d32', out, '#81c784');
          this.outlinedBox(ctx, 8, 10, 16, 16, '#ffffff', out, '#f5f5f5');
          this.p(ctx, 9, 11, 14, 5, '#ab47bc');
          this.p(ctx, 10, 11, 12, 2, '#e1bee7');
          this.p(ctx, 11, 18, 3, 4, '#ffffff');
        } else if (crop.id === 'crop_strawberry') {
          this.outlinedBox(ctx, 5, 7, 22, 16, '#2e7d32', out, '#66bb6a');
          const berries = [
            [7, 14],
            [14, 16],
            [19, 13]
          ];
          berries.forEach(([bx, by]) => {
            this.outlinedBox(ctx, bx, by, 7, 8, '#e53935', out, '#ff8a80');
            this.p(ctx, bx + 2, by + 3, 1, 1, '#ffd54f');
            this.p(ctx, bx + 4, by + 5, 1, 1, '#ffd54f');
          });
        } else if (crop.id === 'crop_tomato') {
          this.outlinedBox(ctx, 5, 6, 22, 18, '#2e7d32', out, '#66bb6a');
          const tomatoes = [
            [7, 11],
            [16, 10],
            [11, 16]
          ];
          tomatoes.forEach(([tx, ty]) => {
            this.outlinedBox(ctx, tx, ty, 9, 9, '#e53935', out, '#ff8a80');
            this.p(ctx, tx + 2, ty + 2, 2, 2, '#ffffff');
          });
        } else if (crop.id === 'crop_corn') {
          this.outlinedBox(ctx, 11, 3, 10, 24, '#388e3c', out, '#81c784');
          this.outlinedBox(ctx, 6, 12, 6, 10, '#ffb300', out, '#ffe082');
          this.outlinedBox(ctx, 20, 9, 6, 10, '#ffb300', out, '#ffe082');
          this.p(ctx, 13, 2, 6, 3, '#ffd54f');
        } else if (crop.id === 'crop_pumpkin') {
          this.outlinedBox(ctx, 5, 6, 22, 10, '#2e7d32', out, '#66bb6a');
          this.outlinedBox(ctx, 5, 10, 22, 16, '#ef6c00', out, '#ffa726');
          this.outlinedBox(ctx, 10, 10, 12, 16, '#fb8c00', out, '#ffcc80');
          this.outlinedBox(ctx, 14, 6, 4, 5, '#33691e', out);
        } else {
          // Hoa Hướng Dương Rực Rỡ (crop_sunflower)
          this.outlinedBox(ctx, 13, 12, 6, 15, '#2e7d32', out, '#66bb6a');
          this.outlinedBox(ctx, 7, 16, 7, 5, '#43a047', out);
          this.outlinedBox(ctx, 18, 16, 7, 5, '#43a047', out);
          this.outlinedBox(ctx, 6, 2, 20, 16, '#ffd600', out, '#ffff8d');
          this.outlinedBox(ctx, 10, 6, 12, 9, '#5d4037', out, '#8d6e63');
          this.p(ctx, 12, 8, 2, 2, '#ffb300');
          this.p(ctx, 17, 10, 2, 2, '#ffb300');
        }
      });
    });
  }

  private static generateCharacterAndAnimalSprites(scene: Phaser.Scene) {
    const out = '#1f1108';
    const directions: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];

    directions.forEach((dir) => {
      for (let step = 0; step < 3; step++) {
        this.addTex(scene, `player_${dir}_${step}`, 32, 32, (ctx) => {
          this.p(ctx, 8, 26, 16, 4, 'rgba(0,0,0,0.3)');
          const bobY = step === 0 ? 0 : -1;

          this.outlinedBox(ctx, 5, 2 + bobY, 22, 7, '#f5ba36', out, '#ffe57f');
          this.p(ctx, 9, 2 + bobY, 14, 3, '#ffd54f');
          this.p(ctx, 8, 7 + bobY, 16, 2, '#d32f2f');

          this.outlinedBox(ctx, 8, 8 + bobY, 16, 9, '#ffdfb8', out);
          if (dir === 'down') {
            this.p(ctx, 8, 8 + bobY, 3, 5, '#4e342e');
            this.p(ctx, 21, 8 + bobY, 3, 5, '#4e342e');
            this.p(ctx, 11, 11 + bobY, 2, 3, '#1f1108');
            this.p(ctx, 19, 11 + bobY, 2, 3, '#1f1108');
            this.p(ctx, 10, 14 + bobY, 2, 1, '#ff8a80');
            this.p(ctx, 20, 14 + bobY, 2, 1, '#ff8a80');
            this.p(ctx, 15, 14 + bobY, 2, 1, '#d84315');
          } else if (dir === 'up') {
            this.p(ctx, 9, 9 + bobY, 14, 7, '#4e342e');
            this.p(ctx, 11, 10 + bobY, 10, 2, '#6d4c41');
          } else if (dir === 'left') {
            this.p(ctx, 14, 8 + bobY, 9, 7, '#4e342e');
            this.p(ctx, 10, 11 + bobY, 2, 3, '#1f1108');
            this.p(ctx, 11, 14 + bobY, 2, 1, '#ff8a80');
          } else {
            this.p(ctx, 9, 8 + bobY, 9, 7, '#4e342e');
            this.p(ctx, 20, 11 + bobY, 2, 3, '#1f1108');
            this.p(ctx, 19, 14 + bobY, 2, 1, '#ff8a80');
          }

          this.outlinedBox(ctx, 7, 16 + bobY, 18, 9, '#e53935', out, '#ff8a80');
          this.outlinedBox(ctx, 10, 17 + bobY, 12, 8, '#1976d2', out, '#64b5f6');
          if (dir !== 'up') {
            this.p(ctx, 11, 18 + bobY, 2, 2, '#ffd54f');
            this.p(ctx, 19, 18 + bobY, 2, 2, '#ffd54f');
          }

          const leftFootY = step === 1 ? 23 : 24;
          const rightFootY = step === 2 ? 23 : 24;
          this.outlinedBox(ctx, 9, leftFootY, 5, 5, '#4e342e', out, '#795548');
          this.outlinedBox(ctx, 18, rightFootY, 5, 5, '#4e342e', out, '#795548');
        });
      }
    });

    // NPC 1: Bác Ba Nông Dân
    this.addTex(scene, 'npc_bac_ba', 32, 32, (ctx) => {
      this.p(ctx, 8, 26, 16, 4, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 4, 4, 24, 5, '#f5ba36', out, '#fff59d');
      this.outlinedBox(ctx, 8, 1, 16, 4, '#ffd54f', out, '#fff9c4');
      this.outlinedBox(ctx, 9, 8, 14, 9, '#ffdfb8', out);
      this.p(ctx, 12, 11, 2, 2, out);
      this.p(ctx, 18, 11, 2, 2, out);
      this.p(ctx, 11, 14, 10, 4, '#f5f5f5');
      this.outlinedBox(ctx, 8, 16, 16, 9, '#6d4c41', out, '#8d6e63');
      this.p(ctx, 10, 16, 3, 7, '#eeeeee');
      this.p(ctx, 20, 16, 3, 7, '#eeeeee');
      this.outlinedBox(ctx, 9, 24, 5, 5, '#3e2723', out);
      this.outlinedBox(ctx, 18, 24, 5, 5, '#3e2723', out);
    });

    // NPC 2: Dì Tư Hoa (Chủ cửa hàng nông sản)
    this.addTex(scene, 'npc_di_tu', 32, 32, (ctx) => {
      this.p(ctx, 8, 26, 16, 4, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 7, 3, 18, 8, '#4e342e', out, '#795548');
      this.p(ctx, 20, 4, 4, 4, '#ff4081');
      this.outlinedBox(ctx, 9, 8, 14, 8, '#ffe0b2', out);
      this.p(ctx, 12, 11, 2, 2, out);
      this.p(ctx, 18, 11, 2, 2, out);
      this.p(ctx, 10, 13, 2, 1, '#ff8a80');
      this.p(ctx, 20, 13, 2, 1, '#ff8a80');
      this.outlinedBox(ctx, 7, 16, 18, 10, '#fb8c00', out, '#ffb74d');
      this.outlinedBox(ctx, 10, 16, 12, 9, '#fff8e1', out, '#ffffff');
      this.outlinedBox(ctx, 10, 25, 4, 4, '#5d4037', out);
      this.outlinedBox(ctx, 18, 25, 4, 4, '#5d4037', out);
    });

    // NPC 3: Chú Bảy Thợ Rèn
    this.addTex(scene, 'npc_chu_bay', 32, 32, (ctx) => {
      this.p(ctx, 8, 26, 16, 4, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 8, 3, 16, 6, '#c62828', out, '#ef5350');
      this.outlinedBox(ctx, 8, 8, 16, 8, '#ffccbc', out);
      this.p(ctx, 11, 10, 2, 2, out);
      this.p(ctx, 19, 10, 2, 2, out);
      this.p(ctx, 9, 13, 14, 4, '#3e2723');
      this.outlinedBox(ctx, 6, 16, 20, 10, '#455a64', out, '#78909c');
      this.outlinedBox(ctx, 9, 25, 5, 4, '#263238', out);
      this.outlinedBox(ctx, 18, 25, 5, 4, '#263238', out);
    });

    // NPC 4: Bé Mây (Cô bé yêu thiên nhiên)
    this.addTex(scene, 'npc_be_may', 32, 32, (ctx) => {
      this.p(ctx, 8, 26, 16, 4, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 8, 4, 16, 7, '#5d4037', out, '#8d6e63');
      this.p(ctx, 20, 5, 4, 4, '#ffd600');
      this.outlinedBox(ctx, 9, 9, 14, 8, '#ffe0b2', out);
      this.p(ctx, 12, 12, 2, 2, out);
      this.p(ctx, 18, 12, 2, 2, out);
      this.p(ctx, 10, 14, 2, 1, '#ff8a80');
      this.p(ctx, 20, 14, 2, 1, '#ff8a80');
      this.outlinedBox(ctx, 8, 17, 16, 9, '#43a047', out, '#81c784');
      this.outlinedBox(ctx, 10, 25, 4, 4, '#5d4037', out);
      this.outlinedBox(ctx, 18, 25, 4, 4, '#5d4037', out);
    });

    // Gà Đẻ Trứng
    this.addTex(scene, 'animal_chicken', 32, 32, (ctx) => {
      this.p(ctx, 8, 24, 16, 4, 'rgba(0,0,0,0.25)');
      this.outlinedBox(ctx, 11, 6, 7, 5, '#e53935', out, '#ff8a80');
      this.outlinedBox(ctx, 7, 10, 18, 13, '#fffdf7', out, '#ffffff');
      this.p(ctx, 8, 19, 16, 3, '#f5e6c8');
      this.outlinedBox(ctx, 11, 13, 9, 7, '#f2dec2', out, '#fff8e7');
      this.p(ctx, 9, 13, 2, 2, out);
      this.outlinedBox(ctx, 4, 13, 4, 4, '#ffb300', out, '#ffe082');
      this.p(ctx, 12, 23, 2, 3, '#fb8c00');
      this.p(ctx, 18, 23, 2, 3, '#fb8c00');
    });

    // Bò Sữa Mây
    this.addTex(scene, 'animal_cow', 32, 32, (ctx) => {
      this.p(ctx, 4, 25, 24, 4, 'rgba(0,0,0,0.28)');
      this.outlinedBox(ctx, 6, 11, 22, 13, '#ffffff', out, '#f5f5f5');
      this.p(ctx, 13, 12, 7, 6, '#263238');
      this.p(ctx, 21, 16, 5, 5, '#263238');
      this.outlinedBox(ctx, 2, 7, 13, 12, '#ffffff', out);
      this.p(ctx, 3, 5, 3, 3, '#ffd54f');
      this.p(ctx, 11, 5, 3, 3, '#ffd54f');
      this.p(ctx, 5, 10, 2, 2, out);
      this.p(ctx, 10, 10, 2, 2, out);
      this.outlinedBox(ctx, 2, 13, 12, 6, '#ff8a80', out, '#ffcdd2');
      this.p(ctx, 5, 15, 2, 2, '#c62828');
      this.p(ctx, 9, 15, 2, 2, '#c62828');
      this.outlinedBox(ctx, 8, 23, 4, 5, '#37474f', out);
      this.outlinedBox(ctx, 13, 23, 4, 5, '#37474f', out);
      this.outlinedBox(ctx, 19, 23, 4, 5, '#37474f', out);
      this.outlinedBox(ctx, 23, 23, 4, 5, '#37474f', out);
    });
  }

  private static generateBuildingsAndProps(scene: Phaser.Scene) {
    const out = '#211107';

    this.addTex(scene, 'building_house', 96, 96, (ctx) => {
      this.p(ctx, 4, 80, 88, 12, 'rgba(0,0,0,0.32)');
      this.outlinedBox(ctx, 68, 6, 14, 24, '#8d3b29', out, '#b85640');
      this.p(ctx, 66, 4, 18, 5, '#5c2216');

      this.outlinedBox(ctx, 4, 14, 88, 36, '#b73225', out, '#e35142');
      for (let ry = 18; ry < 46; ry += 6) {
        this.p(ctx, 6, ry, 84, 3, '#d64031');
        for (let rx = 8; rx < 86; rx += 8) {
          this.p(ctx, rx + (ry % 12 ? 2 : 0), ry + 2, 5, 2, '#871f15');
        }
      }
      this.outlinedBox(ctx, 4, 46, 88, 5, '#f5b016', out, '#ffe082');

      this.outlinedBox(ctx, 10, 50, 76, 36, '#faecd2', out, '#fff8eb');
      this.p(ctx, 10, 50, 6, 36, '#6b3e23');
      this.p(ctx, 80, 50, 6, 36, '#6b3e23');
      this.p(ctx, 10, 78, 76, 8, '#8d6e63');

      this.outlinedBox(ctx, 36, 56, 22, 30, '#6b3e23', out, '#965a34');
      this.outlinedBox(ctx, 39, 59, 16, 25, '#87502c', out, '#ad6a3e');
      this.p(ctx, 51, 71, 3, 3, '#ffd54f');
      this.outlinedBox(ctx, 33, 84, 28, 6, '#b0bec5', out, '#eceff1');

      const drawWindow = (wx: number, wy: number) => {
        this.outlinedBox(ctx, wx, wy, 16, 15, '#4fc3f7', out, '#b3e5fc');
        this.p(ctx, wx + 7, wy + 1, 2, 13, '#6b3e23');
        this.p(ctx, wx + 1, wy + 7, 14, 2, '#6b3e23');
        this.outlinedBox(ctx, wx - 1, wy + 14, 18, 6, '#8d4925', out, '#b5673d');
        this.p(ctx, wx + 2, wy + 12, 3, 3, '#ff4081');
        this.p(ctx, wx + 7, wy + 11, 3, 3, '#ffd54f');
        this.p(ctx, wx + 12, wy + 12, 3, 3, '#ff4081');
      };
      drawWindow(16, 56);
      drawWindow(62, 56);
    });

    this.addTex(scene, 'building_shop', 96, 96, (ctx) => {
      this.p(ctx, 4, 80, 88, 12, 'rgba(0,0,0,0.32)');
      this.outlinedBox(ctx, 6, 14, 84, 26, '#1f6f61', out, '#389c8b');
      this.outlinedBox(ctx, 4, 36, 88, 16, '#ffffff', out);
      for (let x = 6; x < 88; x += 8) {
        this.p(ctx, x, 37, 4, 14, '#e53935');
        this.p(ctx, x + 4, 37, 4, 14, '#fff8e1');
      }

      this.outlinedBox(ctx, 10, 50, 76, 36, '#ebd2ab', out, '#fff3db');
      this.outlinedBox(ctx, 16, 56, 40, 22, '#6b3e23', out, '#965a34');
      this.p(ctx, 19, 59, 10, 8, '#e53935');
      this.p(ctx, 31, 59, 10, 8, '#ffb300');
      this.p(ctx, 43, 59, 10, 8, '#43a047');
      this.outlinedBox(ctx, 60, 54, 18, 32, '#5d341c', out, '#8c5330');
      this.p(ctx, 63, 58, 12, 12, '#81d4fa');

      this.outlinedBox(ctx, 24, 18, 48, 14, '#ffb300', out, '#ffe57f');
      this.p(ctx, 28, 23, 40, 4, '#5d341c');
    });

    this.addTex(scene, 'building_barn', 96, 80, (ctx) => {
      this.p(ctx, 4, 68, 88, 10, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 6, 10, 84, 24, '#9e2a22', out, '#c94036');
      this.p(ctx, 8, 31, 80, 3, '#fff8e1');
      this.outlinedBox(ctx, 10, 34, 76, 40, '#c6352b', out, '#e35146');
      this.outlinedBox(ctx, 38, 15, 20, 14, '#4e2a14', out, '#784421');
      this.p(ctx, 41, 23, 14, 5, '#fbc02d');
      this.outlinedBox(ctx, 30, 42, 36, 32, '#784421', out, '#9c5d32');
      this.p(ctx, 31, 43, 34, 3, '#ffffff');
      this.p(ctx, 31, 70, 34, 3, '#ffffff');
      this.p(ctx, 47, 43, 2, 30, '#ffffff');
      for (let i = 0; i < 14; i++) {
        this.p(ctx, 32 + i, 45 + i * 2, 2, 2, '#ffffff');
        this.p(ctx, 62 - i, 45 + i * 2, 2, 2, '#ffffff');
      }
    });

    this.addTex(scene, 'prop_shipping_bin', 32, 32, (ctx) => {
      this.p(ctx, 3, 26, 26, 4, 'rgba(0,0,0,0.32)');
      this.outlinedBox(ctx, 4, 10, 24, 18, '#8d5128', out, '#b8703e');
      this.outlinedBox(ctx, 3, 5, 26, 7, '#a86434', out, '#d18a52');
      this.p(ctx, 4, 15, 24, 3, '#ffd54f');
      this.p(ctx, 4, 22, 24, 2, '#ffd54f');
      this.outlinedBox(ctx, 13, 13, 6, 6, '#ffb300', out, '#fff59d');
    });

    this.addTex(scene, 'prop_quest_board', 32, 32, (ctx) => {
      this.p(ctx, 4, 27, 24, 3, 'rgba(0,0,0,0.28)');
      this.outlinedBox(ctx, 6, 18, 4, 12, '#4e2a14', out);
      this.outlinedBox(ctx, 22, 18, 4, 12, '#4e2a14', out);
      this.outlinedBox(ctx, 3, 5, 26, 16, '#784421', out, '#a86434');
      this.outlinedBox(ctx, 2, 3, 28, 4, '#b73225', out, '#e35142');
      this.p(ctx, 6, 8, 20, 10, '#d7b377');
      this.p(ctx, 7, 9, 7, 8, '#fffdf7');
      this.p(ctx, 10, 9, 2, 2, '#e53935');
      this.p(ctx, 16, 10, 8, 7, '#fff8e1');
      this.p(ctx, 19, 10, 2, 2, '#1e88e5');
    });

    this.addTex(scene, 'prop_tree', 48, 64, (ctx) => {
      this.p(ctx, 8, 52, 32, 8, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 18, 34, 12, 24, '#6b3e23', out, '#8d5532');
      this.p(ctx, 20, 36, 3, 20, '#965a34');
      this.outlinedBox(ctx, 15, 53, 18, 5, '#59321b', out);

      this.outlinedBox(ctx, 4, 18, 40, 22, '#216129', out, '#2e7d32');
      this.outlinedBox(ctx, 6, 10, 36, 20, '#348a3b', out, '#4caf50');
      this.outlinedBox(ctx, 10, 4, 28, 15, '#52b043', out, '#8be067');
      this.p(ctx, 14, 7, 8, 4, '#8be067');
      this.p(ctx, 24, 9, 6, 3, '#8be067');
      this.outlinedBox(ctx, 13, 24, 4, 4, '#ff3d00', out, '#ff9e80');
      this.outlinedBox(ctx, 31, 20, 4, 4, '#ff3d00', out, '#ff9e80');
    });

    this.addTex(scene, 'prop_fence', 32, 32, (ctx) => {
      this.p(ctx, 2, 26, 28, 4, 'rgba(0,0,0,0.22)');
      this.outlinedBox(ctx, 0, 12, 32, 5, '#8d5128', out, '#b8703e');
      this.outlinedBox(ctx, 0, 20, 32, 5, '#8d5128', out, '#b8703e');
      this.outlinedBox(ctx, 4, 6, 7, 23, '#a86434', out, '#d18a52');
      this.outlinedBox(ctx, 21, 6, 7, 23, '#a86434', out, '#d18a52');
    });

    this.addTex(scene, 'prop_lantern', 32, 48, (ctx) => {
      this.p(ctx, 10, 42, 12, 4, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 13, 10, 6, 34, '#5d341c', out, '#8c5330');
      this.outlinedBox(ctx, 10, 40, 12, 5, '#452512', out);
      this.outlinedBox(ctx, 13, 10, 13, 4, '#5d341c', out, '#8c5330');
      this.outlinedBox(ctx, 20, 14, 9, 11, '#ffb300', out, '#fff59d');
      this.p(ctx, 22, 16, 5, 7, '#ffff8d');
    });

    this.addTex(scene, 'prop_well', 48, 48, (ctx) => {
      this.p(ctx, 6, 39, 36, 6, 'rgba(0,0,0,0.3)');
      this.outlinedBox(ctx, 6, 4, 36, 12, '#b73225', out, '#e35142');
      this.outlinedBox(ctx, 10, 15, 4, 16, '#6b3e23', out);
      this.outlinedBox(ctx, 34, 15, 4, 16, '#6b3e23', out);
      this.outlinedBox(ctx, 8, 26, 32, 16, '#90a4ae', out, '#cfd8dc');
      this.p(ctx, 12, 28, 24, 4, '#29b6f6');
      this.p(ctx, 14, 34, 8, 4, '#78909c');
      this.p(ctx, 26, 33, 8, 4, '#78909c');
    });

    this.addTex(scene, 'prop_flowerbed', 32, 32, (ctx) => {
      this.outlinedBox(ctx, 2, 14, 28, 14, '#8d4925', out, '#b5673d');
      this.outlinedBox(ctx, 4, 8, 24, 10, '#388e3c', out, '#66bb6a');
      const blooms = [
        { x: 6, y: 8, c: '#ff4081' },
        { x: 12, y: 6, c: '#ffd54f' },
        { x: 18, y: 9, c: '#ff4081' },
        { x: 22, y: 7, c: '#ffd54f' }
      ];
      blooms.forEach((b) => {
        this.outlinedBox(ctx, b.x, b.y, 5, 5, b.c, out, '#ffffff');
      });
    });

    this.addTex(scene, 'prop_lotus', 32, 32, (ctx) => {
      this.outlinedBox(ctx, 5, 12, 22, 13, '#2e7d32', out, '#66bb6a');
      this.outlinedBox(ctx, 11, 7, 10, 9, '#ff80ab', out, '#f8bbd0');
      this.p(ctx, 14, 10, 4, 3, '#ffd54f');
    });
  }
}
