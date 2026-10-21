import Phaser from 'phaser';
import { PixelArtGenerator } from './PixelArtGenerator';
import { gameStore } from '../state/gameStore';
import { ITEMS } from '../data/gameData';
import type { Season } from '../types/game';
import { soundManager } from '../utils/sound';

export const TILE_SIZE = 32;
export const MAP_COLS = 56;
export const MAP_ROWS = 40;
const MAX_TOOL_REACH = 36; // Tầm với công cụ tính từ bàn chân nhân vật đến tâm ô đất (<= 1 ô sát chân)

interface InteractZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  onTrigger: () => void;
}

interface RoamingNPC {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  nameTag: Phaser.GameObjects.Text;
  baseX: number;
  baseY: number;
  targetX: number;
  targetY: number;
  dir: 'down' | 'up' | 'left' | 'right';
  walkTimer: number;
  pauseTimer: number;
}

interface ChopTreeNode {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  variant: 'oak' | 'pine' | 'maple' | 'golden';
  sprite: Phaser.GameObjects.Image;
  chopped: boolean;
  hp: number;
}

export class FarmScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private facing: { x: number; y: number } = { x: 0, y: 1 };
  private facingDir: 'down' | 'up' | 'left' | 'right' = 'down';
  private walkAnimTimer = 0;
  private clickMoveTarget: { x: number; y: number } | null = null;
  private clickPath: Array<{ x: number; y: number }> = [];
  private pendingReachAction: {
    targetX: number;
    targetY: number;
    stopRadius: number;
    execute: () => void;
  } | null = null;

  private grassTiles: { sprite: Phaser.GameObjects.Image; r: number; c: number; variant: number }[] = [];
  private waterTiles: { sprite: Phaser.GameObjects.Image; r: number; c: number; dir: string }[] = [];
  private seasonalTrees: { sprite: Phaser.GameObjects.Image; variant: 'oak' | 'pine' | 'maple' | 'golden'; node?: ChopTreeNode }[] = [];
  private chopTreeNodes: ChopTreeNode[] = [];
  private seasonalBushes: Phaser.GameObjects.Image[] = [];
  private wildflowerSprites: Phaser.GameObjects.Image[] = [];
  private autumnLeafPiles: Phaser.GameObjects.Image[] = [];
  private winterSnowmen: Phaser.GameObjects.Image[] = [];
  private lotusSprites: Phaser.GameObjects.Image[] = [];
  private houseSprite?: Phaser.GameObjects.Image;
  private scarecrowSprites: Phaser.GameObjects.Image[] = [];
  private lampGlows: Phaser.GameObjects.Arc[] = [];

  private plotSoilSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private plotCropSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private plotReadyBadges: Map<string, Phaser.GameObjects.Text> = new Map();

  private animalSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private animalShadows: Map<string, Phaser.GameObjects.Ellipse> = new Map();
  private animalProductIcons: Map<string, Phaser.GameObjects.Text> = new Map();
  private animalWalkData: Map<
    string,
    {
      baseX: number;
      baseY: number;
      targetX: number;
      targetY: number;
      dir: 'down' | 'up' | 'left' | 'right';
      walkTimer: number;
      pauseTimer: number;
      isBrown: boolean;
    }
  > = new Map();

  private roamingNPCs: RoamingNPC[] = [];

  private targetHighlight!: Phaser.GameObjects.Graphics;
  private hoverTooltipBg!: Phaser.GameObjects.Rectangle;
  private hoverTooltipText!: Phaser.GameObjects.Text;
  private interactZones: InteractZone[] = [];
  private activeZone: InteractZone | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private solidColliders: { id?: string; rect: Phaser.Geom.Rectangle; active: boolean }[] = [];

  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private rainDrops: Phaser.GameObjects.Rectangle[] = [];
  private ambientPetals: { sprite: Phaser.GameObjects.Rectangle; vx: number; vy: number }[] = [];
  private fireflies: { sprite: Phaser.GameObjects.Arc; phase: number }[] = [];
  private currentRenderedSeason: Season = 'Xuân';
  private lastRecordedDay: number = 1;
  private waterAnimTimer = 0;
  private waterFrame = 0;
  private chimneySmokeTimer = 0;

  public virtualJoystick: { dx: number; dy: number } = { dx: 0, dy: 0 };

  constructor() {
    super('FarmScene');
  }

  public preload() {
    PixelArtGenerator.preloadCozyFarmAssets(this);
  }

  /**
   * Tính chiều sâu Y-Sorting chuẩn RPG 2D: vật thể có chân thấp hơn trên màn hình sẽ vẽ đè lên vật thể cao hơn
   */
  private calcYDepth(bottomY: number): number {
    return 10 + bottomY / 100;
  }

  /**
   * Kiểm tra một ô (r, c) có phải mặt nước (Suối Ngân Hà hoặc Hồ Gương) hay không
   */
  private isWaterTile(r: number, c: number): boolean {
    // 1. Dòng Suối Ngân Hà chảy dọc từ Bắc (r=0) xuống Nam (r=39) quanh cột 28..30
    // Giữ thẳng dòng chảy tại khu vực Cầu Bắc (r: 5..9) và Cầu Nam (r: 17..21) để hai bờ suối khớp 100% với gầm cầu
    const isNearBridge = (r >= 5 && r <= 9) || (r >= 17 && r <= 21);
    const streamCenter = isNearBridge ? 29 : 29 + Math.round(Math.sin(r * 0.25) * 0.6);
    if (c >= streamCenter - 1 && c <= streamCenter + 1) {
      return true;
    }
    // 2. Nhánh sông nối từ Hồ Gương sang Suối Ngân Hà (r: 26..29, c: 22..29)
    if (r >= 26 && r <= 29 && c >= 22 && c <= streamCenter) {
      return true;
    }
    // 3. Hồ Gương Lớn phía Tây Nam (r: 23..33, c: 5..22)
    if (r >= 23 && r <= 33 && c >= 5 && c <= 22) {
      // Bo tròn nhẹ 4 góc hồ để hồ nước tự nhiên
      if ((r === 23 || r === 33) && (c === 5 || c === 22)) return false;
      return true;
    }
    return false;
  }

  /**
   * Kiểm tra một ô (r, c) có phải Cầu Gỗ bắc qua suối hoặc Cầu Cảng câu cá hay không
   */
  private isBridgeOrDockTile(r: number, c: number): boolean {
    // Cầu Gỗ Bắc (r: 7, c: 27..31)
    if (r === 7 && c >= 27 && c <= 31) return true;
    // Cầu Gỗ Nam (r: 19, c: 27..31)
    if (r === 19 && c >= 27 && c <= 31) return true;
    // Cầu Cảng Câu Cá Hồ Gương (r: 27, c: 4..9)
    if (r === 27 && c >= 4 && c <= 9) return true;
    return false;
  }

  /**
   * Kiểm tra một ô (r, c) có phải Vách Đá Cao Nguyên chặn bước đi hay không
   */
  private isCliffWallTile(r: number, c: number): boolean {
    if (r === 2 && !this.isWaterTile(r, c)) {
      // Chừa 2 lối bậc thang đá lên Cao Nguyên ở c=12..13 và c=41..42
      if ((c >= 12 && c <= 13) || (c >= 41 && c <= 42)) return false;
      return true;
    }
    return false;
  }

  /**
   * Đăng ký hộp va chạm vật lý (Solid Hitbox) tại phần chân đế của công trình, cây cối, hàng rào, đạo cụ
   */
  private addSolidCollider(centerX: number, centerY: number, width: number, height: number, id?: string) {
    const collider = {
      id,
      rect: new Phaser.Geom.Rectangle(centerX - width / 2, centerY - height / 2, width, height),
      active: true
    };
    this.solidColliders.push(collider);
    return collider;
  }

  /**
   * Kiểm tra ô đư��ng đất kết nối toàn bộ Nông Trại - Cầu Gỗ - Thị Trấn Làng Mây
   */
  private isPathTile(r: number, c: number): boolean {
    if (this.isWaterTile(r, c)) return false;
    // Đường ngang Bắc nối Chuồng Trại -> Nhà Nông Trại -> Cầu Gỗ Bắc -> Quảng Trường Làng
    if (r === 7 && c >= 7 && c <= 48) return true;
    // Đường ngang Nam nối Khu Chăn Nuôi -> Ruộng Nam -> Cầu Gỗ Nam -> Chợ Phiên Làng Mây
    if (r === 19 && c >= 4 && c <= 47) return true;
    // Đường ngang giữa Ruộng Bắc (8..13) và Ruộng Nam (15..18)
    if (r === 14 && c >= 7 && c <= 21) return true;
    // Đường dọc sườn Tây (c=8) và sườn Đông (c=21) cánh đồng canh tác mở rộng (Cols 9..20)
    if (c === 8 && r >= 7 && r <= 22) return true;
    if (c === 21 && r >= 7 && r <= 22) return true;
    // Đường dẫn xuống Bến Câu Cá Hồ Gương
    if (r === 22 && c >= 4 && c <= 21) return true;
    if (c === 4 && r >= 15 && r <= 27) return true;
    // Đường lên bậc thang Cao Nguyên Bắc
    if ((c === 12 || c === 13) && r >= 1 && r <= 7) return true;
    if ((c === 41 || c === 42) && r >= 1 && r <= 10) return true;
    // Đường trục dọc Thị Trấn Làng Mây nối Quảng Trường xuống Rừng Cổ Thụ
    if ((c === 36 || c === 47) && r >= 7 && r <= 23) return true;
    if (c === 42 && r >= 16 && r <= 28) return true;
    return false;
  }

  /**
   * Kiểm tra ô Quảng trường đá cuội trung tâm Thị Trấn Làng Mây
   */
  private isCobblePlazaTile(r: number, c: number): boolean {
    return r >= 9 && r <= 16 && c >= 38 && c <= 46;
  }

  public create() {
    PixelArtGenerator.registerAllTextures(this);

    const state = gameStore.getState();
    this.currentRenderedSeason = state.season;
    this.lastRecordedDay = state.day;

    const worldWidth = MAP_COLS * TILE_SIZE;
    const worldHeight = MAP_ROWS * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor('#4a8542');

    this.buildWorldTerrain();
    this.buildBridgesAndDocks();
    this.buildFencesAndEnclosures();
    this.buildPlotsLayer();
    this.buildBuildingsAndLandmarks();
    this.buildNPCs();
    this.buildPlayer();
    this.syncPlots();
    this.syncAnimals();
    this.applySeasonalVisuals(state.season);

    this.targetHighlight = this.add.graphics().setDepth(9);

    this.promptText = this.add
      .text(0, 0, '', {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fff8e7',
        backgroundColor: '#3e2723e6',
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5, 1)
      .setDepth(90)
      .setVisible(false);

    this.hoverTooltipBg = this.add
      .rectangle(0, 0, 10, 10, 0x2b1911, 0.92)
      .setStrokeStyle(1.5, 0xffca28)
      .setDepth(95)
      .setVisible(false);

    this.hoverTooltipText = this.add
      .text(0, 0, '', {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffe082',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5, 1)
      .setDepth(96)
      .setVisible(false);

    this.nightOverlay = this.add
      .rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x09122c, 0)
      .setDepth(80);

    this.createRainParticles();
    this.createAmbientAtmosphere();
    this.setupInputs();

    gameStore.subscribe(() => {
      const s = gameStore.getState();
      if (s.season !== this.currentRenderedSeason) {
        this.currentRenderedSeason = s.season;
        this.applySeasonalVisuals(s.season);
      }
      if (s.day !== this.lastRecordedDay) {
        this.lastRecordedDay = s.day;
        this.regrowChoppedTrees();
      }
      this.syncPlots();
      this.syncAnimals();
      this.updateDayNightOverlay();
    });
  }

  private getAutotileSuffix(r: number, c: number, matchFn: (nr: number, nc: number) => boolean): string {
    const n = !matchFn(r - 1, c);
    const s = !matchFn(r + 1, c);
    const w = !matchFn(r, c - 1);
    const e = !matchFn(r, c + 1);
    if (n && w) return 'nw';
    if (n && e) return 'ne';
    if (s && w) return 'sw';
    if (s && e) return 'se';
    if (n) return 'n';
    if (s) return 's';
    if (w) return 'w';
    if (e) return 'e';
    return 'c';
  }

  private buildWorldTerrain() {
    const season = this.currentRenderedSeason;

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const x = c * TILE_SIZE + 16;
        const y = r * TILE_SIZE + 16;
        const variant = (r * 13 + c * 7) % 4;

        // 1. Lớp cỏ nền 4 mùa khắp thung lũng
        const grass = this.add
          .image(x, y, `tile_grass_${season}_${variant}`)
          .setDepth(1);
        this.grassTiles.push({ sprite: grass, r, c, variant });

        // 2. Vách Đá Cao Nguyên Phía Bắc (tạo địa hình phân tầng có chiều sâu)
        if (r === 2 && !this.isWaterTile(r, c)) {
          if ((c >= 12 && c <= 13) || (c >= 41 && c <= 42)) {
            this.add.image(x, y, 'tile_stone_stairs').setDepth(2.5);
          } else {
            this.add.image(x, y, 'tile_cliff_wall').setDepth(2.5);
          }
          continue;
        }

        // 3. Mặt nước 9-Slice Autotiles (Suối Ngân Hà & Hồ Gương Lớn)
        if (this.isWaterTile(r, c)) {
          const dir = this.getAutotileSuffix(r, c, (nr, nc) => {
            if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) return true;
            return this.isWaterTile(nr, nc);
          });
          const waterTex = season === 'Đông' ? `tile_ice_${dir}` : `tile_water_${dir}_0`;
          const water = this.add.image(x, y, waterTex).setDepth(2);
          this.waterTiles.push({ sprite: water, r, c, dir });
          continue;
        }

        // 4. Quảng trường Đá Cuội Thị Trấn Làng Mây
        if (this.isCobblePlazaTile(r, c)) {
          const cobbleKey = (r + c) % 2 === 0 ? 'tile_cobble_n' : 'tile_cobble_s';
          this.add.image(x, y, cobbleKey).setDepth(2.1);
        }

        // 5. Hệ thống Đường Làng 9-Slice Autotiles
        if (this.isPathTile(r, c)) {
          const dir = this.getAutotileSuffix(r, c, (nr, nc) => this.isPathTile(nr, nc) || this.isCobblePlazaTile(nr, nc));
          this.add.image(x, y, `tile_path_${dir}`).setDepth(2.2);
        }
      }
    }

    // Trang trí Hoa súng trên mặt Hồ Gương và dọc bờ suối
    const lotusCoords = [
      [24, 8],
      [25, 14],
      [29, 7],
      [31, 12],
      [30, 18],
      [26, 20],
      [12, 29],
      [23, 29],
      [34, 29]
    ];
    lotusCoords.forEach(([lr, lc]) => {
      const lotus = this.add.image(lc * TILE_SIZE + 16, lr * TILE_SIZE + 16, 'prop_lotus').setDepth(2.4);
      this.lotusSprites.push(lotus);
    });
  }

  /**
   * Xây dựng 2 Cây Cầu Gỗ bắc qua Dòng Suối Ngân Hà & Cầu Cảng Hồ Gương
   */
  private buildBridgesAndDocks() {
    // 1. Cầu Gỗ Bắc (Row 7, Cols 27..31) & Cầu Gỗ Nam (Row 19, Cols 27..31)
    [7, 19].forEach((bridgeRow) => {
      const by = bridgeRow * TILE_SIZE + 16;
      for (let c = 27; c <= 31; c++) {
        const bx = c * TILE_SIZE + 16;
        const bridgeTex = c === 27 ? 'bridge_west' : c === 31 ? 'bridge_east' : 'bridge_center';
        this.add
          .image(bx, by, bridgeTex)
          .setOrigin(0.5, 0.42)
          .setDepth(3.4);
      }
    });

    // 2. Cầu Cảng Câu Cá Hồ Gương (Row 27, Cols 4..9)
    const dockY = 27 * TILE_SIZE + 16;
    this.add.image(4 * TILE_SIZE + 16, dockY, 'dock_side_w').setDepth(3.2);
    this.add.image(5 * TILE_SIZE + 16, dockY, 'dock_side_e').setDepth(3.2);
    this.add.image(6 * TILE_SIZE + 16, dockY, 'dock_side_e').setDepth(3.2);
    this.add.image(7 * TILE_SIZE + 16, dockY, 'dock_side_e').setDepth(3.2);
    this.add.image(8 * TILE_SIZE + 16, dockY, 'dock_end_w').setDepth(3.2);
    this.add.image(9 * TILE_SIZE + 16, dockY, 'dock_end_e').setDepth(3.2);
  }

  /**
   * Hàng rào gỗ 16 mảnh bao quanh Khu Đồng Cỏ Chăn Nuôi Mở Rộng (Rows 3..15, Cols 1..7)
   * Có hộp va chạm vật lý chặn đi xuyên hàng rào, trừ các Cổng Mở (gate_open)
   */
  private buildFencesAndEnclosures() {
    const topR = 3;
    const botR = 15;
    const leftC = 1;
    const rightC = 7;

    this.placeProp(leftC, topR, 'prop_fence_nw', true, 24, 20);
    this.placeProp(rightC, topR, 'prop_fence_ne', true, 24, 20);
    this.placeProp(leftC, botR, 'prop_fence_sw', true, 24, 20);
    this.placeProp(rightC, botR, 'prop_fence_se', true, 24, 20);

    const createInteractiveGate = (c: number, r: number) => {
      const gate = this.placeProp(c, r, 'prop_gate_open', false);
      const gateCol = this.addSolidCollider(c * TILE_SIZE + 16, r * TILE_SIZE + 18, 26, 20, `gate_${r}_${c}`);
      gateCol.active = false; // Mặc định cổng mở cho phép đi qua
      gate.setInteractive({ useHandCursor: true });
      this.attachHoverTooltip(gate, 'Cổng Đồng Cỏ Chăn Nuôi (Nhấp để Đóng / Mở)', -20);
      gate.on('pointerdown', () => {
        const isOpen = gate.texture.key === 'prop_gate_open';
        gate.setTexture(isOpen ? 'prop_gate_closed' : 'prop_gate_open');
        gateCol.active = isOpen; // Đóng cổng thì bật chặn va chạm, mở cổng thì tắt chặn
        soundManager.playSfx('click');
      });
    };

    for (let c = leftC + 1; c < rightC; c++) {
      // Để trống hàng rào Bắc tại chỗ đứng của Chuồng Gia Súc lớn (c=3..5) vì lưng chuồng đã chắn kín
      if (c < 3 || c > 5) {
        this.placeProp(c, topR, c % 2 === 0 ? 'prop_fence_h_post' : 'prop_fence_h', true, 28, 18);
      }
      if (c === 4) {
        createInteractiveGate(c, botR);
      } else {
        this.placeProp(c, botR, c % 2 === 0 ? 'prop_fence_h_post' : 'prop_fence_h', true, 28, 18);
      }
    }

    for (let r = topR + 1; r < botR; r++) {
      this.placeProp(leftC, r, r % 2 === 0 ? 'prop_fence_v_post' : 'prop_fence_v', true, 18, 28);
      // Cổng Đông Bắc (Row 7) và Cổng Đông Nam (Row 14) thông thẳng ra đường nông trại
      if (r === 7 || r === 14) {
        createInteractiveGate(rightC, r);
      } else {
        this.placeProp(rightC, r, r % 2 === 0 ? 'prop_fence_v_post' : 'prop_fence_v', true, 18, 28);
      }
    }

    // Hàng rào gỗ trang trí dọc lối vào Nông Trại & Vườn Ong Mật
    this.placeProp(9, 6, 'prop_fence_end_w', true, 26, 16);
    this.placeProp(10, 6, 'prop_fence_h', true, 28, 16);
    this.placeProp(16, 6, 'prop_fence_h', true, 28, 16);
    this.placeProp(17, 6, 'prop_fence_end_e', true, 26, 16);
  }

  private placeProp(
    c: number,
    r: number,
    texKey: string,
    solid: boolean = false,
    colW: number = 22,
    colH: number = 18
  ): Phaser.GameObjects.Image {
    const x = c * TILE_SIZE + 16;
    const y = r * TILE_SIZE + 16;
    if (solid) {
      this.addSolidCollider(x, y + 4, colW, colH);
    }
    return this.add.image(x, y, texKey).setDepth(this.calcYDepth(y + 12));
  }

  private buildPlotsLayer() {
    for (let r = 8; r <= 18; r++) {
      if (r === 14) continue;
      for (let c = 9; c <= 20; c++) {
        const key = `${r},${c}`;
        const x = c * TILE_SIZE + 16;
        const y = r * TILE_SIZE + 16;

        const soilImg = this.add.image(x, y, 'tile_plot_untilled').setDepth(3).setVisible(false);
        soilImg.setInteractive({ useHandCursor: true });
        soilImg.on('pointerdown', () => {
          this.walkThenExecute(x, y, MAX_TOOL_REACH, () => {
            this.handleTileInteraction(r, c);
          });
        });
        this.plotSoilSprites.set(key, soilImg);

        // Cây trồng đặt gốc tại tâm ô ruộng và có Y-Sorting theo hàng ruộng
        const cropImg = this.add
          .image(x, y - 4, 'crop_turnip_stage_0')
          .setDepth(this.calcYDepth(y + 10))
          .setVisible(false);
        this.plotCropSprites.set(key, cropImg);

        const badge = this.add
          .text(x + 9, y - 18, '✨', { fontSize: '12px' })
          .setOrigin(0.5, 0.5)
          .setDepth(this.calcYDepth(y + 20))
          .setVisible(false);

        this.tweens.add({
          targets: badge,
          y: y - 23,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.plotReadyBadges.set(key, badge);
      }
    }
  }

  private buildBuildingsAndLandmarks() {
    // =========================================================================
    // KHU VỰC 1: TRANG TRẠI MỘNG MƠ & ĐỒNG CỎ CHĂN NUÔI MỞ RỘNG (COLS 1..27)
    // =========================================================================

    // 1. Khu Đồng Cỏ Chăn Nuôi Rộng Lớn (Rows 3..15, Cols 1..7):
    // - Chuồng Gia Súc Lớn (Barn) cho đàn Bò Sữa ở phía Bắc
    const barnX = 4.4 * TILE_SIZE;
    const barnY = 3.9 * TILE_SIZE;
    const barn = this.add.image(barnX, barnY, 'building_barn').setDepth(this.calcYDepth(barnY + 46));
    this.addSolidCollider(barnX, barnY + 24, 106, 48, 'building_barn');
    barn.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(barn, 'Chuồng Gia Súc Lớn (Nơi ở của đàn Bò Sữa — Mua thêm tại Cửa Hàng)', -52);
    barn.on('pointerdown', () => {
      this.walkThenExecute(barnX, barnY + 58, 60, () => {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      });
    });

    // - Tháp Silo dự trữ cỏ khô
    const siloX = 2.1 * TILE_SIZE;
    const siloY = 4.1 * TILE_SIZE;
    this.add.image(siloX, siloY, 'building_silo').setDepth(this.calcYDepth(siloY + 34));
    this.addSolidCollider(siloX, siloY + 22, 34, 28, 'building_silo');

    // - Chuồng Gà Gỗ Mái Đỏ (Coop) ở phía Nam Khu Chăn Nuôi
    const coopX = 2.9 * TILE_SIZE;
    const coopY = 10.0 * TILE_SIZE;
    const coop = this.add.image(coopX, coopY, 'building_coop').setDepth(this.calcYDepth(coopY + 28));
    this.addSolidCollider(coopX, coopY + 14, 62, 32, 'building_coop');
    coop.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(coop, 'Chuồng Gà Mái Đỏ (Ấp trứng & nuôi Gà — Mua thêm tại Cửa Hàng)', -38);
    coop.on('pointerdown', () => {
      this.walkThenExecute(coopX, coopY + 44, 56, () => {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      });
    });

    // - Máng ăn gia súc, Kiện cỏ khô & Thùng nước trong đồng cỏ chăn nuôi
    const trough1X = 5.4 * TILE_SIZE;
    const trough1Y = 5.6 * TILE_SIZE;
    this.add.image(trough1X, trough1Y, 'prop_trough').setDepth(this.calcYDepth(trough1Y + 10));
    this.addSolidCollider(trough1X, trough1Y + 4, 52, 14);

    const trough2X = 5.4 * TILE_SIZE;
    const trough2Y = 10.6 * TILE_SIZE;
    this.add.image(trough2X, trough2Y, 'prop_trough').setDepth(this.calcYDepth(trough2Y + 10));
    this.addSolidCollider(trough2X, trough2Y + 4, 52, 14);

    this.placeProp(2, 6, 'prop_hay', true, 24, 20);
    this.placeProp(6, 4, 'prop_hay', true, 24, 20);
    this.placeProp(6, 9, 'prop_hay', true, 24, 20);
    this.placeProp(2, 14, 'prop_barrel', true, 22, 18);

    // 2. Tổ Ấm Nông Trại Chính (Col 13, Row 4.8) — Chân nhà chạm đúng đường Row 7
    const houseX = 13 * TILE_SIZE;
    const houseY = 4.8 * TILE_SIZE;
    const house = this.add.image(houseX, houseY, 'building_house').setDepth(this.calcYDepth(houseY + 48));
    this.houseSprite = house;
    this.addSolidCollider(houseX, houseY + 22, 92, 48, 'building_house');
    house.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(house, 'Tổ Ấm Nông Trại (Nghỉ ngơi qua ngày mới)', -56);
    house.on('pointerdown', () =>
      this.walkThenExecute(houseX, 7 * TILE_SIZE + 8, 60, () => this.promptSleepModal())
    );

    this.interactZones.push({
      id: 'sleep_house',
      x: houseX,
      y: 7 * TILE_SIZE,
      radius: 54,
      label: '[E / Space] Nghỉ ngơi qua ngày mới',
      onTrigger: () => this.promptSleepModal()
    });

    // Bồn hoa & Chậu hoa hai bên hiên nhà
    this.add.image(11 * TILE_SIZE, 6.2 * TILE_SIZE, 'prop_flowerbed').setDepth(this.calcYDepth(6.2 * TILE_SIZE + 12));
    this.add.image(15 * TILE_SIZE, 6.2 * TILE_SIZE, 'prop_flowerbed').setDepth(this.calcYDepth(6.2 * TILE_SIZE + 12));
    this.placeProp(12, 6, 'prop_flower_pot');
    this.placeProp(14, 6, 'prop_flower_pot');

    // 3. Bảng Nhiệm Vụ Làng (Col 9, Row 6.5)
    const qBoardX = 9 * TILE_SIZE + 16;
    const qBoardY = 6.5 * TILE_SIZE;
    const qBoard = this.add.image(qBoardX, qBoardY, 'prop_quest_board').setDepth(this.calcYDepth(qBoardY + 14));
    this.addSolidCollider(qBoardX, qBoardY + 6, 26, 16, 'quest_board');
    qBoard.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(qBoard, 'Bảng Nhiệm Vụ Làng (Xem & Nhận thưởng)', -24);
    qBoard.on('pointerdown', () => {
      this.walkThenExecute(qBoardX, 7 * TILE_SIZE + 12, 56, () => {
        soundManager.playSfx('click');
        gameStore.requestModal('quests');
      });
    });
    this.interactZones.push({
      id: 'quest_board',
      x: qBoardX,
      y: 7 * TILE_SIZE + 8,
      radius: 46,
      label: '[E / Space] Xem Bảng Nhiệm Vụ',
      onTrigger: () => {
        soundManager.playSfx('click');
        gameStore.requestModal('quests');
      }
    });

    // 4. Thùng Giao Hàng Nông Sản & Xe Kéo Thu Hoạch (Col 18..20.5, Row 6.5)
    const binX = 18 * TILE_SIZE + 16;
    const binY = 6.5 * TILE_SIZE;
    const bin = this.add.image(binX, binY, 'prop_shipping_bin').setDepth(this.calcYDepth(binY + 14));
    this.addSolidCollider(binX, binY + 4, 42, 20, 'shipping_bin');
    bin.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(bin, 'Thùng Giao Hàng (Bán nhanh nông sản thu hoạch)', -24);
    bin.on('pointerdown', () =>
      this.walkThenExecute(binX, 7 * TILE_SIZE + 12, 56, () => this.handleShippingBinInteract())
    );
    this.placeProp(19, 6, 'prop_barrel', true, 22, 18);

    const cart1X = 20.6 * TILE_SIZE;
    const cart1Y = 6.3 * TILE_SIZE;
    this.add.image(cart1X, cart1Y, 'prop_cart').setDepth(this.calcYDepth(cart1Y + 18));
    this.addSolidCollider(cart1X, cart1Y + 8, 52, 24);

    this.interactZones.push({
      id: 'shipping_bin',
      x: binX,
      y: 7 * TILE_SIZE + 8,
      radius: 48,
      label: '[E / Space] Giao bán nông sản',
      onTrigger: () => this.handleShippingBinInteract()
    });

    // 5. Đồi Cối Xay Gió Nông Trại & Khu Vườn Ong Mật (Cols 22..25, Rows 4..13)
    const millX = 23.5 * TILE_SIZE;
    const millY = 4.8 * TILE_SIZE;
    const windmill = this.add.image(millX, millY, 'prop_windmill').setDepth(this.calcYDepth(millY + 46));
    this.addSolidCollider(millX, millY + 34, 42, 30, 'windmill');
    windmill.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(windmill, 'Cối Xay Gió Nông Trại Mộng Mơ (Xay lúa mì & ngũ cốc)', -58);
    this.placeProp(22, 5, 'prop_hay', true, 24, 20);
    this.placeProp(25, 5, 'prop_crate', true, 22, 18);

    // Khu Vườn Ong Mật Hoa Hướng Dương phía Đông Cánh Đồng (Cols 22..24, Rows 9..11)
    const beehives = [
      [22.5, 9.2],
      [23.7, 9.2],
      [23.1, 10.4]
    ];
    beehives.forEach(([hc, hr]) => {
      const hx = hc * TILE_SIZE;
      const hy = hr * TILE_SIZE;
      const hive = this.add.image(hx, hy, 'prop_beehive').setDepth(this.calcYDepth(hy + 14));
      this.addSolidCollider(hx, hy + 8, 24, 18);
      hive.setInteractive({ useHandCursor: true });
      this.attachHoverTooltip(hive, 'Tổ Ong Mật Hoa Rừng (Thụ phấn cho cánh đồng nông trại)', -24);
    });
    this.add.image(23.1 * TILE_SIZE, 11.5 * TILE_SIZE, 'prop_flowerbed').setDepth(this.calcYDepth(11.5 * TILE_SIZE + 12));

    // Máy bơm nước tay cạnh cánh đồng & Bù Nhìn Giữ Ruộng
    const pump1 = this.placeProp(8, 10, 'prop_water_pump', true, 22, 20);
    pump1.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(pump1, 'Trạm Bơm Nước Nông Trại', -24);
    this.placeProp(21, 13, 'prop_water_pump', true, 22, 20);

    const sc1 = this.add
      .image(8 * TILE_SIZE + 16, 12.2 * TILE_SIZE, 'prop_scarecrow')
      .setDepth(this.calcYDepth(12.2 * TILE_SIZE + 28));
    this.addSolidCollider(8 * TILE_SIZE + 16, 12.2 * TILE_SIZE + 16, 20, 16);
    const sc2 = this.add
      .image(21 * TILE_SIZE + 16, 16.2 * TILE_SIZE, 'prop_scarecrow')
      .setDepth(this.calcYDepth(16.2 * TILE_SIZE + 28));
    this.addSolidCollider(21 * TILE_SIZE + 16, 16.2 * TILE_SIZE + 16, 20, 16);
    const sc3 = this.add
      .image(15 * TILE_SIZE + 16, 14 * TILE_SIZE, 'prop_scarecrow')
      .setDepth(this.calcYDepth(14 * TILE_SIZE + 28));
    this.addSolidCollider(15 * TILE_SIZE + 16, 14 * TILE_SIZE + 16, 20, 16);
    this.scarecrowSprites.push(sc1, sc2, sc3);

    // Biển chỉ đường gỗ ở ngã tư cầu Bắc và cầu Nam
    const sign1 = this.placeProp(26, 6, 'prop_signpost', true, 20, 16);
    sign1.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(sign1, '⬅ Nông Trại Mộng Mơ | Cầu Ngân Hà & Thị Trấn Làng Mây ➡', -26);

    const sign2 = this.placeProp(21, 21, 'prop_signpost', true, 20, 16);
    sign2.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(sign2, '⬇ Bến Câu Cá Hồ Gương | Khu Chợ Phiên Làng Mây ➡', -26);

    // 6. Bến Câu Cá Hồ Gương & Khu Cắm Trại Dã Ngoại Ven Hồ (Rows 20..27, Cols 4..19)
    // - Lửa trại ấm áp & Khúc gỗ ngồi nghỉ
    const fireX = 8.5 * TILE_SIZE;
    const fireY = 20.8 * TILE_SIZE;
    const campfire = this.add.image(fireX, fireY, 'prop_campfire').setDepth(this.calcYDepth(fireY + 12));
    this.addSolidCollider(fireX, fireY + 4, 26, 20);
    campfire.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(campfire, 'Lửa Trại Ven Hồ Gương (Nơi sưởi ấm của người câu cá)', -22);
    const fireGlow = this.add.circle(fireX, fireY, 38, 0xff9800, 0.18).setDepth(79);
    this.lampGlows.push(fireGlow);

    this.add.image(7.2 * TILE_SIZE, 20.8 * TILE_SIZE, 'prop_log_seat').setDepth(this.calcYDepth(20.8 * TILE_SIZE + 8));
    this.addSolidCollider(7.2 * TILE_SIZE, 20.8 * TILE_SIZE + 2, 32, 14);
    this.add.image(9.8 * TILE_SIZE, 20.8 * TILE_SIZE, 'prop_log_seat').setDepth(this.calcYDepth(20.8 * TILE_SIZE + 8));
    this.addSolidCollider(9.8 * TILE_SIZE, 20.8 * TILE_SIZE + 2, 32, 14);

    // - Thảm dã ngoại ven hồ & Giá treo cần câu
    this.add.image(14.5 * TILE_SIZE, 20.8 * TILE_SIZE, 'prop_picnic').setDepth(3.1);
    const rackX = 5.5 * TILE_SIZE;
    const rackY = 25.8 * TILE_SIZE;
    this.add.image(rackX, rackY, 'prop_fishing_rack').setDepth(this.calcYDepth(rackY + 14));
    this.addSolidCollider(rackX, rackY + 8, 40, 18);
    this.placeProp(3, 25, 'prop_barrel', true, 22, 18);

    this.interactZones.push({
      id: 'fishing_dock',
      x: 9 * TILE_SIZE + 16,
      y: 27 * TILE_SIZE + 16,
      radius: 64,
      label: '[E / Space] Thả câu tại Hồ Gương',
      onTrigger: () => this.handleFishingAction(11 * TILE_SIZE, 27 * TILE_SIZE + 16)
    });

    // =========================================================================
    // KHU VỰC 2: THỊ TRẤN LÀNG MÂY & QUẢNG TRƯỜNG ĐÁ CUỘI (PHÍA ĐÔNG SUỐI - COLS 32..53)
    // =========================================================================

    // 1. Cửa Hàng Hạt Giống & Tạp Hóa (Col 36, Row 5)
    const shopX = 36 * TILE_SIZE;
    const shopY = 5 * TILE_SIZE;
    const shop = this.add.image(shopX, shopY, 'building_shop').setDepth(this.calcYDepth(shopY + 52));
    this.addSolidCollider(shopX, shopY + 24, 112, 52, 'building_shop');
    shop.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(shop, 'Cửa Hàng Hạt Giống & Nâng Cấp Công Cụ', -58);
    shop.on('pointerdown', () => {
      this.walkThenExecute(shopX, 7 * TILE_SIZE + 12, 62, () => {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      });
    });
    this.interactZones.push({
      id: 'seed_shop',
      x: shopX,
      y: 7 * TILE_SIZE + 12,
      radius: 58,
      label: '[E / Space] Cửa Hàng Hạt Giống & Nâng Cấp',
      onTrigger: () => {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      }
    });

    // 2. Quán Trọ Làng Mây - Cozy Inn (Col 46, Row 4.8)
    const innX = 46 * TILE_SIZE;
    const innY = 4.8 * TILE_SIZE;
    const inn = this.add.image(innX, innY, 'building_inn').setDepth(this.calcYDepth(innY + 68));
    this.addSolidCollider(innX, innY + 34, 112, 58, 'building_inn');
    inn.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(inn, 'Quán Trọ Làng Mây (Nơi hội họp của dân làng)', -68);
    inn.on('pointerdown', () => {
      this.walkThenExecute(innX, 7 * TILE_SIZE + 12, 64, () => {
        soundManager.playSfx('click');
        gameStore.talkToNPC('npc_di_tu');
      });
    });

    // 3. Quảng Trường Đá Cuội Trung Tâm & Giếng Cổ Làng Mây (Col 42, Row 12.5)
    const wellX = 42 * TILE_SIZE + 16;
    const wellY = 12.5 * TILE_SIZE;
    const well = this.add.image(wellX, wellY, 'prop_well').setDepth(this.calcYDepth(wellY + 20));
    this.addSolidCollider(wellX, wellY + 14, 44, 26, 'prop_well');
    well.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(well, 'Giếng Cổ Làng Mây (Nguồn nước mát lành quanh năm)', -28);

    // Ghế công viên & Bồn hoa quanh Quảng Trường Làng (có hộp va chạm)
    this.add.image(40 * TILE_SIZE, 10.5 * TILE_SIZE, 'prop_bench').setDepth(this.calcYDepth(10.5 * TILE_SIZE + 12));
    this.addSolidCollider(40 * TILE_SIZE, 10.5 * TILE_SIZE + 4, 52, 18);
    this.add.image(44 * TILE_SIZE, 10.5 * TILE_SIZE, 'prop_bench').setDepth(this.calcYDepth(10.5 * TILE_SIZE + 12));
    this.addSolidCollider(44 * TILE_SIZE, 10.5 * TILE_SIZE + 4, 52, 18);
    this.add.image(40 * TILE_SIZE, 15 * TILE_SIZE, 'prop_flowerbed').setDepth(this.calcYDepth(15 * TILE_SIZE + 12));
    this.addSolidCollider(40 * TILE_SIZE, 15 * TILE_SIZE + 4, 54, 20);
    this.add.image(44 * TILE_SIZE, 15 * TILE_SIZE, 'prop_flowerbed').setDepth(this.calcYDepth(15 * TILE_SIZE + 12));
    this.addSolidCollider(44 * TILE_SIZE, 15 * TILE_SIZE + 4, 54, 20);

    // Thảm dã ngoại ở đồi cỏ phía Đông Quảng Trường
    this.add.image(50.5 * TILE_SIZE, 11.5 * TILE_SIZE, 'prop_picnic').setDepth(3.1);

    // 4. Tiệm Bánh Mật Ong - Bakery (Col 35, Row 16.5)
    const bakeryX = 35 * TILE_SIZE;
    const bakeryY = 16.5 * TILE_SIZE;
    const bakery = this.add.image(bakeryX, bakeryY, 'building_bakery').setDepth(this.calcYDepth(bakeryY + 54));
    this.addSolidCollider(bakeryX, bakeryY + 26, 84, 50, 'building_bakery');
    bakery.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(bakery, 'Tiệm Bánh Mật Ong (Bánh mì bơ thơm lừng hồi phục thể lực)', -56);
    bakery.on('pointerdown', () => {
      this.walkThenExecute(bakeryX, 19 * TILE_SIZE, 62, () => {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      });
    });
    // Tổ ong mật của Tiệm Bánh
    this.placeProp(33, 16, 'prop_beehive', true, 24, 18);

    // 5. Biệt Thự Gỗ Xanh Trưởng Làng (Col 49, Row 16.5)
    const cottageX = 49 * TILE_SIZE;
    const cottageY = 16.5 * TILE_SIZE;
    const cottage = this.add.image(cottageX, cottageY, 'building_cottage').setDepth(this.calcYDepth(cottageY + 42));
    this.addSolidCollider(cottageX, cottageY + 18, 84, 44, 'building_cottage');
    cottage.setInteractive({ useHandCursor: true });
    this.attachHoverTooltip(cottage, 'Nhà Gỗ Xanh của Trưởng Làng Gia Phúc & Bé Mây', -48);
    cottage.on('pointerdown', () => {
      this.walkThenExecute(cottageX, 19 * TILE_SIZE, 62, () => {
        soundManager.playSfx('click');
        gameStore.talkToNPC('npc_truong_lang');
      });
    });

    // 6. Khu Chợ Phiên Nông Sản Làng Mây (Rows 20..22, Cols 37..46)
    const stall1 = this.add
      .image(40 * TILE_SIZE, 21 * TILE_SIZE, 'building_stall')
      .setDepth(this.calcYDepth(21 * TILE_SIZE + 24));
    this.addSolidCollider(40 * TILE_SIZE, 21 * TILE_SIZE + 10, 56, 28);
    const stall2 = this.add
      .image(44 * TILE_SIZE, 21 * TILE_SIZE, 'building_stall')
      .setDepth(this.calcYDepth(21 * TILE_SIZE + 24));
    this.addSolidCollider(44 * TILE_SIZE, 21 * TILE_SIZE + 10, 56, 28);
    [stall1, stall2].forEach((st, sIdx) => {
      st.setInteractive({ useHandCursor: true });
      this.attachHoverTooltip(st, 'Sạp Chợ Phiên Làng Mây (Giao thương nông sản & hạt giống)', -32);
      st.on('pointerdown', () => {
        const targetStallX = (sIdx === 0 ? 40 : 44) * TILE_SIZE;
        this.walkThenExecute(targetStallX, 19.5 * TILE_SIZE, 60, () => {
          soundManager.playSfx('shop');
          gameStore.requestModal('shop');
        });
      });
    });
    this.placeProp(38, 21, 'prop_barrel', true, 22, 18);
    this.placeProp(46, 21, 'prop_crate', true, 22, 18);
    const marketCartX = 36.5 * TILE_SIZE;
    const marketCartY = 21 * TILE_SIZE;
    this.add.image(marketCartX, marketCartY, 'prop_cart').setDepth(this.calcYDepth(marketCartY + 18));
    this.addSolidCollider(marketCartX, marketCartY + 8, 52, 24);

    // Hệ thống Cột Đèn Đường Cổ Điển dọc đường làng & quảng trường (tỏa sáng ấm áp ban đêm)
    const lampCoords = [
      [10, 7],
      [16, 7],
      [25, 7],
      [33, 7],
      [39, 9],
      [45, 9],
      [39, 16],
      [45, 16],
      [25, 19],
      [33, 19],
      [21, 14]
    ];
    lampCoords.forEach(([lc, lr]) => {
      const lx = lc * TILE_SIZE + 16;
      const ly = lr * TILE_SIZE;
      this.add.image(lx, ly, 'prop_lantern').setDepth(this.calcYDepth(ly + 28));
      this.addSolidCollider(lx, ly + 20, 14, 14);
      const glow = this.add.circle(lx, ly - 12, 34, 0xffd54f, 0).setDepth(79);
      this.lampGlows.push(glow);
    });

    // =========================================================================
    // KHU VỰC 3: RỪNG NGUYÊN SINH, ĐỒI CỔ THỤ & THUNG LŨNG THẢO MỘC
    // =========================================================================
    const treeSpecs: Array<{ c: number; r: number; variant: 'oak' | 'pine' | 'maple' | 'golden'; choppable?: boolean }> = [
      // Rừng Cao Nguyên Phía Bắc (lùi xuống r >= 3.2 để không bao giờ bị cắt ngọn)
      { c: 9, r: 3.6, variant: 'oak' },
      { c: 19, r: 3.6, variant: 'oak', choppable: true },
      { c: 26, r: 3.8, variant: 'pine', choppable: true },
      { c: 32, r: 3.6, variant: 'pine' },
      { c: 40, r: 3.6, variant: 'oak' },
      { c: 51, r: 4.0, variant: 'pine' },
      { c: 53, r: 6.5, variant: 'maple' },

      // Hàng cây ven Suối Ngân Hà & Ven Hồ Gương
      { c: 25, r: 10, variant: 'oak', choppable: true },
      { c: 25, r: 14, variant: 'golden', choppable: true },
      { c: 24, r: 17, variant: 'maple', choppable: true },
      { c: 2, r: 18, variant: 'oak', choppable: true },
      { c: 2, r: 22, variant: 'pine', choppable: true },
      { c: 2, r: 29, variant: 'pine' },
      { c: 4, r: 35, variant: 'oak', choppable: true },
      { c: 10, r: 36, variant: 'maple', choppable: true },
      { c: 16, r: 36, variant: 'golden', choppable: true },
      { c: 22, r: 35, variant: 'pine', choppable: true },

      // Rừng Nguyên Sinh Phía Đông Nam (Thung Lũng Gỗ & Thảo Mộc: Rows 25..37, Cols 33..53)
      { c: 34, r: 25, variant: 'oak', choppable: true },
      { c: 38, r: 26, variant: 'maple', choppable: true },
      { c: 45, r: 26, variant: 'golden', choppable: true },
      { c: 50, r: 25, variant: 'pine', choppable: true },
      { c: 33, r: 30, variant: 'pine', choppable: true },
      { c: 37, r: 31, variant: 'oak', choppable: true },
      { c: 42, r: 30, variant: 'golden', choppable: true },
      { c: 47, r: 31, variant: 'maple', choppable: true },
      { c: 52, r: 29, variant: 'pine', choppable: true },
      { c: 35, r: 35, variant: 'maple', choppable: true },
      { c: 40, r: 36, variant: 'oak', choppable: true },
      { c: 45, r: 35, variant: 'pine', choppable: true },
      { c: 50, r: 36, variant: 'golden', choppable: true }
    ];

    treeSpecs.forEach((spec, idx) => {
      const tx = spec.c * TILE_SIZE + 16;
      const ty = spec.r * TILE_SIZE;
      const tex =
        spec.variant === 'pine'
          ? 'prop_tree_pine'
          : spec.variant === 'maple'
            ? 'prop_tree_maple'
            : spec.variant === 'golden'
              ? 'prop_tree_golden'
              : 'prop_tree';

      // Đặt origin tại (0.5, 0.88) để gốc cây nằm đúng tại (tx, ty + 28) và Y-Sorting chuẩn xác!
      const tree = this.add
        .image(tx, ty + 28, tex)
        .setOrigin(0.5, 0.88)
        .setDepth(this.calcYDepth(ty + 28));

      // Hộp va chạm vật lý tại phần gốc cây (22x18) để nhân vật không đi xuyên qua thân cây
      this.addSolidCollider(tx, ty + 22, 22, 18, `tree_${idx}`);

      // Hiệu ứng lá cây đung đưa nhẹ nhàng trong gió
      this.tweens.add({
        targets: tree,
        angle: { from: -1.1, to: 1.1 },
        duration: 2400 + (idx % 5) * 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      let node: ChopTreeNode | undefined;
      if (spec.choppable) {
        node = {
          id: `tree_${idx}`,
          col: Math.round(spec.c),
          row: Math.round(spec.r),
          x: tx,
          y: ty + 28,
          variant: spec.variant,
          sprite: tree,
          chopped: false,
          hp: 2
        };
        this.chopTreeNodes.push(node);

        tree.setInteractive({ useHandCursor: true });
        this.attachHoverTooltip(tree, 'Cây Cổ Thụ (Nhấp hoặc nhấn E để đốn củi lấy Gỗ Thông)', -64);
        tree.on('pointerdown', () => {
          this.walkThenExecute(node!.x, node!.y, 56, () => {
            this.handleChopSpecificTree(node!);
          });
        });
      }

      this.seasonalTrees.push({ sprite: tree, variant: spec.variant, node });
    });

    // Bụi cây 4 mùa, Bụi quả mọng, Đá tảng & Nấm rừng tạo hệ sinh thái đa tầng
    const bushCoords = [
      [2, 16],
      [6, 17],
      [22, 8],
      [23, 15],
      [26, 9],
      [26, 17],
      [33, 9],
      [33, 15],
      [51, 11],
      [51, 18],
      [35, 28],
      [44, 28],
      [49, 33]
    ];
    bushCoords.forEach(([bc, br], idx) => {
      const bx = bc * TILE_SIZE + 16;
      const by = br * TILE_SIZE + 16;
      const bTex = idx % 3 === 0 ? 'prop_bush_berry' : 'prop_bush';
      const bush = this.add.image(bx, by, bTex).setDepth(this.calcYDepth(by + 12));
      this.addSolidCollider(bx, by + 4, 20, 16);
      if (idx % 3 !== 0) {
        this.seasonalBushes.push(bush);
      }
    });

    const natureScatter: Array<[number, number, string]> = [
      [24, 8, 'prop_rock_large'],
      [25, 11, 'prop_mushroom_red'],
      [23, 13, 'prop_mushroom_brown'],
      [26, 21, 'prop_rock_small'],
      [12, 21, 'prop_rock_large'],
      [20, 23, 'prop_rock_small'],
      [36, 28, 'prop_mushroom_red'],
      [41, 29, 'prop_mushroom_brown'],
      [46, 28, 'prop_rock_large'],
      [39, 33, 'prop_mushroom_red'],
      [48, 34, 'prop_rock_small']
    ];
    natureScatter.forEach(([nc, nr, nTex]) => {
      const isSolidRock = nTex === 'prop_rock_large';
      this.placeProp(nc, nr, nTex, isSolidRock, 24, 18);
    });

    // Đống lá vàng mùa Thu & Người tuyết mùa Đông
    const leafCoords = [
      [11, 7],
      [22, 11],
      [39, 12],
      [44, 14],
      [37, 27]
    ];
    leafCoords.forEach(([lc, lr]) => {
      const lp = this.add
        .image(lc * TILE_SIZE + 16, lr * TILE_SIZE + 16, 'prop_leaf_pile')
        .setDepth(3.3)
        .setVisible(false);
      this.autumnLeafPiles.push(lp);
    });

    // Điểm xuyết vài khóm hoa dại thưa thớt tự nhiên ở ven suối & bìa rừng (không bao giờ mọc trong ruộng)
    const wildflowerCoords = [
      [2, 9],
      [5, 19],
      [20, 6],
      [24, 9],
      [22, 18],
      [26, 23],
      [14, 21],
      [32, 12],
      [34, 22],
      [48, 9],
      [52, 15],
      [39, 25],
      [46, 32]
    ];
    wildflowerCoords.forEach(([wc, wr]) => {
      const wf = this.add
        .image(wc * TILE_SIZE + 16, wr * TILE_SIZE + 16, 'prop_wildflower')
        .setDepth(2.15);
      this.wildflowerSprites.push(wf);
    });

    const snowmanCoords = [
      [10, 6],
      [40, 12],
      [45, 19]
    ];
    snowmanCoords.forEach(([sc, sr]) => {
      const sy = sr * TILE_SIZE + 16;
      const sm = this.add
        .image(sc * TILE_SIZE + 16, sy, 'prop_snowman')
        .setDepth(this.calcYDepth(sy + 20))
        .setVisible(false);
      this.winterSnowmen.push(sm);
    });
  }

  private handleChopSpecificTree(node: ChopTreeNode) {
    if (node.chopped) {
      gameStore.showToast('Gốc cây này đang đâm chồi non, sẽ mọc lại vào sáng mai!', 'info');
      return;
    }

    this.faceTowards(node.x, node.y);

    // Tự động chuyển sang Rìu nếu người chơi có Rìu trong túi
    const selected = gameStore.getSelectedItem();
    if (selected?.def.id !== 'tool_axe') {
      const axeIdx = gameStore.getState().inventory.findIndex((s) => s?.itemId === 'tool_axe');
      if (axeIdx !== -1) {
        gameStore.setSelectedSlot(axeIdx);
      }
    }

    node.hp -= 1;
    soundManager.playSfx('till');
    this.spawnSoilParticles(node.x, node.y - 12, 0xa1887f);

    this.tweens.add({
      targets: node.sprite,
      x: node.x + 5,
      duration: 55,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        node.sprite.x = node.x;
      }
    });

    if (node.hp <= 0) {
      if (gameStore.chopWood()) {
        node.chopped = true;
        node.sprite.setTexture('prop_tree_stump');
        node.sprite.setOrigin(0.5, 0.65);
        this.spawnFloatingText(node.x, node.y - 28, '🪓 +1 Khúc Gỗ Thông!', '#ffe082');
      } else {
        node.hp = 1;
      }
    } else {
      this.spawnFloatingText(node.x, node.y - 28, '🪓 Chặt cây...', '#d7ccc8');
    }
  }

  private regrowChoppedTrees() {
    this.chopTreeNodes.forEach((node) => {
      if (node.chopped) {
        node.chopped = false;
        node.hp = 2;
        node.sprite.setOrigin(0.5, 0.88);
      }
    });
    this.applySeasonalVisuals(this.currentRenderedSeason);
  }

  private buildNPCs() {
    const npcConfigs: Array<{ id: string; c: number; r: number; label: string }> = [
      { id: 'npc_bac_ba', c: 19, r: 8, label: 'Bác Ba Nông Dân' },
      { id: 'npc_di_tu', c: 35, r: 8, label: 'Dì Tư Hạt Giống' },
      { id: 'npc_chu_bay', c: 39, r: 8, label: 'Chú Bảy Thợ Rèn' },
      { id: 'npc_be_may', c: 42, r: 14, label: 'Bé Mây' },
      { id: 'npc_tho_banh', c: 35, r: 18, label: 'Thợ Bánh Mì' },
      { id: 'npc_thuong_nhan', c: 42, r: 21, label: 'Thương Nhân Phố Huyền' },
      { id: 'npc_truong_lang', c: 47, r: 14, label: 'Trưởng Làng Gia Phúc' }
    ];

    npcConfigs.forEach((cfg) => {
      const x = cfg.c * TILE_SIZE + 16;
      const y = cfg.r * TILE_SIZE + 16;

      const shadow = this.add.ellipse(x, y + 12, 18, 7, 0x000000, 0.28).setDepth(9);
      const sp = this.add.sprite(x, y, `${cfg.id}_down_0`).setDepth(this.calcYDepth(y + 14));
      sp.setInteractive({ useHandCursor: true });

      const nameTag = this.add
        .text(x, y - 22, cfg.label, {
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#fff8e7',
          stroke: '#2b1911',
          strokeThickness: 3
        })
        .setOrigin(0.5, 0.5)
        .setDepth(this.calcYDepth(y + 30));

      this.attachHoverTooltip(sp, `${cfg.label} (Nhấp để trò chuyện & tặng quà)`, -30);

      sp.on('pointerdown', () => {
        this.walkThenExecute(sp.x, sp.y, 54, () => {
          this.faceTowards(sp.x, sp.y);
          gameStore.talkToNPC(cfg.id);
        });
      });

      this.roamingNPCs.push({
        id: cfg.id,
        sprite: sp,
        shadow,
        nameTag,
        baseX: x,
        baseY: y,
        targetX: x,
        targetY: y,
        dir: 'down',
        walkTimer: 0,
        pauseTimer: 1200 + Math.random() * 2000
      });

      this.interactZones.push({
        id: `talk_${cfg.id}`,
        x,
        y,
        radius: 46,
        label: `[E / Space] Trò chuyện với ${cfg.label}`,
        onTrigger: () => {
          this.faceTowards(sp.x, sp.y);
          gameStore.talkToNPC(cfg.id);
        }
      });
    });
  }

  private buildPlayer() {
    const startX = 13 * TILE_SIZE + 16;
    const startY = 7 * TILE_SIZE + 16;

    this.playerShadow = this.add.ellipse(startX, startY + 12, 20, 8, 0x000000, 0.32).setDepth(9.5);
    this.player = this.add
      .sprite(startX, startY, 'player_down_0')
      .setDepth(this.calcYDepth(startY + 14));

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.25);
  }

  /**
   * Xoay mặt nhân vật chính xác về phía mục tiêu (trái/phải/lên/xuống)
   */
  private faceTowards(targetX: number, targetY: number) {
    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    if (Math.abs(dx) >= Math.abs(dy)) {
      this.facing = { x: Math.sign(dx), y: 0 };
      this.facingDir = dx < 0 ? 'left' : 'right';
    } else {
      this.facing = { x: 0, y: Math.sign(dy) };
      this.facingDir = dy < 0 ? 'up' : 'down';
    }
    this.player.setTexture(`player_${this.facingDir}_0`);
  }

  /**
   * Lấy tọa độ bàn chân thực tế của nhân vật trên mặt đất (vì tâm sprite 42px nằm ở ngực/mũ)
   */
  private getPlayerFootPos(): { x: number; y: number } {
    return {
      x: this.player.x,
      y: this.player.y + 10
    };
  }

  /**
   * Kiểm tra đoạn thẳng nối giữa 2 vị trí nhân vật (x1, y1) -> (x2, y2) có thông thoáng không vướng vật cản
   */
  private hasClearWalkLine(x1: number, y1: number, x2: number, y2: number): boolean {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (dist < 4) return true;
    const steps = Math.ceil(dist / 6);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const sx = x1 + (x2 - x1) * t;
      const sy = y1 + (y2 - y1) * t;
      if (!this.canWalkOn(sx, sy)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Thuật toán Tìm Đường Thông Minh A* (16px Sub-tile Grid + Chống cắt góc + Làm mượt đường đi Line-of-Sight)
   * Giúp nhân vật tự động đi vòng qua hàng rào, qua cổng chuồng trại, qua cầu gỗ, né nhà cửa/cây cối mà không bị kẹt!
   */
  private computePathToTarget(
    goalFootX: number,
    goalFootY: number,
    stopRadius: number = 0
  ): Array<{ x: number; y: number }> {
    const targetPlayerX = goalFootX;
    const targetPlayerY = goalFootY - 10;

    // 1. Nếu đường thẳng từ vị trí hiện tại tới đích hoàn toàn thông thoáng và đích đứng được -> Đi thẳng mượt mà!
    if (
      this.canWalkOn(targetPlayerX, targetPlayerY) &&
      this.hasClearWalkLine(this.player.x, this.player.y, targetPlayerX, targetPlayerY)
    ) {
      return [{ x: targetPlayerX, y: targetPlayerY }];
    }

    const STEP = 16; // Lưới nửa ô (16x16px) giúp lách qua cổng chuồng, cầu gỗ và khe hẹp cực mượt
    const cols = MAP_COLS * 2;
    const rows = MAP_ROWS * 2;
    const foot = this.getPlayerFootPos();

    const startGx = Phaser.Math.Clamp(Math.floor(foot.x / STEP), 1, cols - 2);
    const startGy = Phaser.Math.Clamp(Math.floor(foot.y / STEP), 1, rows - 2);
    const goalGx = Phaser.Math.Clamp(Math.floor(goalFootX / STEP), 1, cols - 2);
    const goalGy = Phaser.Math.Clamp(Math.floor(goalFootY / STEP), 1, rows - 2);

    const toPlayerPos = (gx: number, gy: number) => ({
      x: gx * STEP + STEP / 2,
      y: gy * STEP + STEP / 2 - 10
    });

    const isWalkableCell = (gx: number, gy: number): boolean => {
      if (gx < 1 || gx >= cols - 1 || gy < 1 || gy >= rows - 1) return false;
      if (gx === startGx && gy === startGy) return true;
      const p = toPlayerPos(gx, gy);
      return this.canWalkOn(p.x, p.y);
    };

    const totalCells = cols * rows;
    const gScore = new Float32Array(totalCells).fill(Infinity);
    const parent = new Int32Array(totalCells).fill(-1);
    const closed = new Uint8Array(totalCells);

    const startIdx = startGy * cols + startGx;
    gScore[startIdx] = 0;

    // Hàng đợi ưu tiên gọn nhẹ cho A*
    const openList: Array<{ idx: number; gx: number; gy: number; f: number; h: number }> = [];
    const startH = Math.hypot(goalGx - startGx, goalGy - startGy);
    openList.push({ idx: startIdx, gx: startGx, gy: startGy, f: startH, h: startH });

    let reachedIdx = -1;
    let closestIdx = startIdx;
    let closestH = startH;
    const effectiveRadius = stopRadius > 0 ? Math.max(18, stopRadius - 4) : 0;

    const dirs = [
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 1, dy: -1, cost: 1.414 },
      { dx: 1, dy: 1, cost: 1.414 },
      { dx: -1, dy: 1, cost: 1.414 },
      { dx: -1, dy: -1, cost: 1.414 }
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 5500;

    while (openList.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      // Lấy phần tử có f nhỏ nhất
      let bestPos = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[bestPos].f) {
          bestPos = i;
        }
      }
      const current = openList[bestPos];
      openList[bestPos] = openList[openList.length - 1];
      openList.pop();

      if (closed[current.idx]) continue;
      closed[current.idx] = 1;

      if (current.h < closestH && current.idx !== startIdx) {
        closestH = current.h;
        closestIdx = current.idx;
      }

      // Kiểm tra đã tới đích hoặc vào trong bán kính tương tác của vật thể chưa
      const cellFootX = current.gx * STEP + STEP / 2;
      const cellFootY = current.gy * STEP + STEP / 2;
      const distToGoal = Math.hypot(cellFootX - goalFootX, cellFootY - goalFootY);

      if ((current.gx === goalGx && current.gy === goalGy) || (effectiveRadius > 0 && distToGoal <= effectiveRadius)) {
        reachedIdx = current.idx;
        break;
      }

      for (const d of dirs) {
        const ngx = current.gx + d.dx;
        const ngy = current.gy + d.dy;
        if (!isWalkableCell(ngx, ngy)) continue;

        // Nếu đi chéo, bắt buộc 2 ô vuông góc liền kề phải thông thoáng để nhân vật không bao giờ vướng góc hàng rào/nhà
        if (d.dx !== 0 && d.dy !== 0) {
          if (!isWalkableCell(current.gx + d.dx, current.gy) || !isWalkableCell(current.gx, current.gy + d.dy)) {
            continue;
          }
        }

        const nIdx = ngy * cols + ngx;
        if (closed[nIdx]) continue;

        const tentativeG = gScore[current.idx] + d.cost;
        if (tentativeG < gScore[nIdx]) {
          gScore[nIdx] = tentativeG;
          parent[nIdx] = current.idx;
          const h = Math.hypot(goalGx - ngx, goalGy - ngy);
          openList.push({ idx: nIdx, gx: ngx, gy: ngy, f: tentativeG + h, h });
        }
      }
    }

    const finalIdx = reachedIdx !== -1 ? reachedIdx : closestIdx;
    if (finalIdx === startIdx) {
      return [];
    }

    // Truy vết ngược đường đi
    const rawWaypoints: Array<{ x: number; y: number }> = [];
    let cur = finalIdx;
    while (cur !== -1 && cur !== startIdx) {
      const gx = cur % cols;
      const gy = Math.floor(cur / cols);
      rawWaypoints.push(toPlayerPos(gx, gy));
      cur = parent[cur];
    }
    rawWaypoints.reverse();

    // Nếu nút cuối cùng dẫn thẳng tới tọa độ chính xác của đích được thì gán điểm cuối là đích chính xác
    if (
      reachedIdx !== -1 &&
      stopRadius === 0 &&
      this.canWalkOn(targetPlayerX, targetPlayerY) &&
      rawWaypoints.length > 0
    ) {
      const lastWp = rawWaypoints[rawWaypoints.length - 1];
      if (this.hasClearWalkLine(lastWp.x, lastWp.y, targetPlayerX, targetPlayerY)) {
        rawWaypoints[rawWaypoints.length - 1] = { x: targetPlayerX, y: targetPlayerY };
      }
    }

    // Làm mượt đường đi (Line-of-Sight String Pulling) để nhân vật bước đi tự nhiên, không giật cục theo ô vuông
    const smoothed: Array<{ x: number; y: number }> = [];
    let anchor = { x: this.player.x, y: this.player.y };
    let idx = 0;

    while (idx < rawWaypoints.length) {
      let furthest = idx;
      for (let probe = rawWaypoints.length - 1; probe > idx; probe--) {
        if (this.hasClearWalkLine(anchor.x, anchor.y, rawWaypoints[probe].x, rawWaypoints[probe].y)) {
          furthest = probe;
          break;
        }
      }
      smoothed.push(rawWaypoints[furthest]);
      anchor = rawWaypoints[furthest];
      idx = furthest + 1;
    }

    return smoothed;
  }

  /**
   * Khởi tạo hành trình tự động tìm đường đi vòng qua mọi vật cản tới (targetFootX, targetFootY)
   */
  private startAutoWalkTo(targetFootX: number, targetFootY: number, stopRadius: number = 0) {
    const path = this.computePathToTarget(targetFootX, targetFootY, stopRadius);
    if (path.length > 0) {
      this.clickPath = path;
      this.clickMoveTarget = this.clickPath[0];
      this.faceTowards(this.clickMoveTarget.x, this.clickMoveTarget.y + 10);
    } else {
      this.clickPath = [];
      this.clickMoveTarget = null;
    }
  }

  /**
   * Nếu bàn chân nhân vật đã đứng đủ gần mục tiêu (<= stopRadius) thì thực thi ngay.
   * Nếu đứng xa thì tự động tìm đường A* đi vòng qua vật cản lại gần tới nơi rồi mới thực thi hành động!
   */
  private walkThenExecute(targetX: number, targetY: number, stopRadius: number, execute: () => void) {
    const foot = this.getPlayerFootPos();
    const dist = Phaser.Math.Distance.Between(foot.x, foot.y, targetX, targetY);
    if (dist <= stopRadius) {
      this.clickPath = [];
      this.clickMoveTarget = null;
      this.pendingReachAction = null;
      execute();
    } else {
      this.pendingReachAction = { targetX, targetY, stopRadius, execute };
      this.startAutoWalkTo(targetX, targetY, stopRadius);
    }
  }

  private attachHoverTooltip(
    gameObject: Phaser.GameObjects.GameObject,
    text: string,
    offsetY: number = -28
  ) {
    gameObject.on('pointerover', () => {
      const target = gameObject as unknown as { x: number; y: number };
      this.hoverTooltipText.setText(text);
      this.hoverTooltipText.setPosition(target.x, target.y + offsetY);
      this.hoverTooltipText.setVisible(true);

      const bounds = this.hoverTooltipText.getBounds();
      this.hoverTooltipBg.setSize(bounds.width + 8, bounds.height + 4);
      this.hoverTooltipBg.setPosition(bounds.centerX, bounds.centerY);
      this.hoverTooltipBg.setVisible(true);
    });

    gameObject.on('pointerout', () => {
      this.hoverTooltipText.setVisible(false);
      this.hoverTooltipBg.setVisible(false);
    });
  }

  public applySeasonalVisuals(season: Season) {
    this.grassTiles.forEach((tile) => {
      tile.sprite.setTexture(`tile_grass_${season}_${tile.variant}`);
    });

    this.waterTiles.forEach((w) => {
      if (season === 'Đông') {
        w.sprite.setTexture(`tile_ice_${w.dir}`);
      } else {
        w.sprite.setTexture(`tile_water_${w.dir}_0`);
      }
    });

    this.seasonalTrees.forEach((t) => {
      if (t.node?.chopped) {
        t.sprite.setTexture('prop_tree_stump');
        return;
      }
      if (season === 'Đông') {
        t.sprite.setTexture(t.variant === 'pine' ? 'prop_tree_snowy' : 'prop_tree_bare');
      } else if (season === 'Thu') {
        t.sprite.setTexture(
          t.variant === 'pine'
            ? 'prop_tree_pine'
            : t.variant === 'golden'
              ? 'prop_tree_golden'
              : 'prop_tree_maple'
        );
      } else {
        t.sprite.setTexture(
          t.variant === 'pine'
            ? 'prop_tree_pine'
            : t.variant === 'golden'
              ? 'prop_tree_golden'
              : 'prop_tree'
        );
      }
    });

    this.seasonalBushes.forEach((b) => {
      if (season === 'Đông') {
        b.setTexture('prop_bush_snow');
      } else if (season === 'Thu') {
        b.setTexture('prop_bush_autumn');
      } else {
        b.setTexture('prop_bush');
      }
    });

    this.autumnLeafPiles.forEach((lp) => lp.setVisible(season === 'Thu'));
    this.winterSnowmen.forEach((sm) => sm.setVisible(season === 'Đông'));
    this.lotusSprites.forEach((lt) => lt.setVisible(season !== 'Đông'));
    this.wildflowerSprites.forEach((wf) => wf.setVisible(season === 'Xuân' || season === 'Hạ'));

    if (this.houseSprite) {
      this.houseSprite.setTexture(season === 'Đông' ? 'building_house_snow' : 'building_house');
    }

    this.scarecrowSprites.forEach((sc) => {
      sc.setTexture(season === 'Đông' ? 'prop_scarecrow_snow' : 'prop_scarecrow');
    });

    const bgColors: Record<Season, string> = {
      Xuân: '#4a8542',
      Hạ: '#3e7a38',
      Thu: '#8d5b34',
      Đông: '#9eaec4'
    };
    this.cameras.main.setBackgroundColor(bgColors[season]);
  }

  public syncPlotsAndCrops() {
    this.syncPlots();
  }

  public syncPlots() {
    const state = gameStore.getState();
    const plots = state.plots;
    const isWinter = state.season === 'Đông';

    const isPlotTilled = (nr: number, nc: number) => {
      const p = plots[`${nr},${nc}`];
      return Boolean(p && p.state !== 'grass');
    };

    const isPlotWatered = (nr: number, nc: number) => {
      const p = plots[`${nr},${nc}`];
      return Boolean(p && p.state !== 'grass' && p.watered);
    };

    this.plotSoilSprites.forEach((soilImg, key) => {
      const plot = plots[key];
      const cropImg = this.plotCropSprites.get(key);
      const badge = this.plotReadyBadges.get(key);

      if (!plot) {
        soilImg.setVisible(false);
        cropImg?.setVisible(false);
        badge?.setVisible(false);
        return;
      }

      soilImg.setVisible(true);

      if (plot.state === 'grass') {
        soilImg.setTexture('tile_plot_untilled');
        cropImg?.setVisible(false);
        badge?.setVisible(false);
        return;
      }

      if (plot.watered) {
        const dir = this.getAutotileSuffix(plot.r, plot.c, isPlotWatered);
        soilImg.setTexture(`tile_soil_wet_${dir}`);
      } else {
        const dir = this.getAutotileSuffix(plot.r, plot.c, isPlotTilled);
        soilImg.setTexture(isWinter ? `tile_soil_snow_${dir}` : `tile_soil_${dir}`);
      }

      if (plot.state === 'planted' && plot.cropId && cropImg) {
        const cropShort = plot.cropId.replace('crop_', '');
        let stage = 0;
        if (plot.readyToHarvest) {
          stage = 3;
        } else if (plot.growDaysNeeded > 0) {
          const ratio = plot.daysGrown / plot.growDaysNeeded;
          if (ratio >= 0.65) stage = 2;
          else if (ratio >= 0.3) stage = 1;
          else stage = 0;
        }

        const texKey = `crop_${cropShort}_stage_${stage}`;
        if (this.textures.exists(texKey)) {
          cropImg.setTexture(texKey);
        }
        cropImg.setVisible(true);
        badge?.setVisible(Boolean(plot.readyToHarvest));
      } else {
        cropImg?.setVisible(false);
        badge?.setVisible(false);
      }
    });
  }

  public syncAnimals() {
    const animals = gameStore.getState().animals;

    animals.forEach((animal, idx) => {
      let sp = this.animalSprites.get(animal.id);
      const ax = animal.x > 40 ? animal.x : animal.x * TILE_SIZE + 16;
      const ay = animal.y > 40 ? animal.y : animal.y * TILE_SIZE + 16;

      if (!sp) {
        const isBrown = idx % 2 === 1;
        const baseTex =
          animal.type === 'chicken'
            ? isBrown
              ? 'animal_chicken_brown'
              : 'animal_chicken'
            : isBrown
              ? 'animal_cow_brown'
              : 'animal_cow';

        const shadow = this.add
          .ellipse(ax, ay + 11, animal.type === 'cow' ? 26 : 16, 7, 0x000000, 0.25)
          .setDepth(9);
        this.animalShadows.set(animal.id, shadow);

        sp = this.add.sprite(ax, ay, `${baseTex}_down_0`).setDepth(this.calcYDepth(ay + 12));
        sp.setInteractive({ useHandCursor: true });
        this.attachHoverTooltip(sp, `${animal.name} (Nhấp để chăm sóc / thu hoạch)`, -24);
        sp.on('pointerdown', () => {
          this.walkThenExecute(sp!.x, sp!.y, 52, () => {
            this.faceTowards(sp!.x, sp!.y);
            const res = gameStore.interactWithAnimal(animal.id);
            this.showAnimalFeedback(sp!.x, sp!.y, res);
          });
        });

        this.animalSprites.set(animal.id, sp);
        this.animalWalkData.set(animal.id, {
          baseX: ax,
          baseY: ay,
          targetX: ax,
          targetY: ay,
          dir: 'down',
          walkTimer: 0,
          pauseTimer: 1000 + Math.random() * 2000,
          isBrown
        });
      }

      let icon = this.animalProductIcons.get(animal.id);
      if (!icon) {
        icon = this.add
          .text(sp.x, sp.y - 22, '', {
            fontFamily: '"Be Vietnam Pro", sans-serif',
            fontSize: '12px'
          })
          .setOrigin(0.5, 0.5)
          .setDepth(35);
        this.animalProductIcons.set(animal.id, icon);
      }

      if (animal.hasProduct) {
        icon.setText(animal.type === 'chicken' ? '🥚' : '🥛');
        icon.setVisible(true);
      } else if (!animal.fedToday) {
        icon.setText('🌾');
        icon.setVisible(true);
      } else {
        icon.setVisible(false);
      }
    });
  }

  private updateAnimalsMovement(delta: number) {
    const animals = gameStore.getState().animals;
    animals.forEach((animal) => {
      const sp = this.animalSprites.get(animal.id);
      const shadow = this.animalShadows.get(animal.id);
      const icon = this.animalProductIcons.get(animal.id);
      const data = this.animalWalkData.get(animal.id);
      if (!sp || !data) return;

      const prefix =
        animal.type === 'chicken'
          ? data.isBrown
            ? 'animal_chicken_brown'
            : 'animal_chicken'
          : data.isBrown
            ? 'animal_cow_brown'
            : 'animal_cow';

      if (data.pauseTimer > 0) {
        data.pauseTimer -= delta;
        sp.setTexture(`${prefix}_${data.dir}_0`);
        if (data.pauseTimer <= 0) {
          const dirs: Array<{ dx: number; dy: number; dir: 'down' | 'up' | 'left' | 'right' }> = [
            { dx: 26, dy: 0, dir: 'right' },
            { dx: -26, dy: 0, dir: 'left' },
            { dx: 0, dy: 20, dir: 'down' },
            { dx: 0, dy: -20, dir: 'up' }
          ];
          const pick = dirs[Math.floor(Math.random() * dirs.length)];
          data.targetX = Phaser.Math.Clamp(data.baseX + pick.dx, 2 * TILE_SIZE + 8, 6 * TILE_SIZE + 16);
          data.targetY = Phaser.Math.Clamp(data.baseY + pick.dy, 5.5 * TILE_SIZE, 14 * TILE_SIZE);
          data.dir = pick.dir;
        }
      } else {
        const dx = data.targetX - sp.x;
        const dy = data.targetY - sp.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 2) {
          sp.setPosition(data.targetX, data.targetY);
          data.pauseTimer = 1800 + Math.random() * 2400;
          sp.setTexture(`${prefix}_${data.dir}_0`);
        } else {
          const step = 22 * (delta / 1000);
          sp.x += (dx / dist) * step;
          sp.y += (dy / dist) * step;
          data.walkTimer += delta;
          const frame = Math.floor(data.walkTimer / 200) % 2 === 0 ? 1 : 2;
          sp.setTexture(`${prefix}_${data.dir}_${frame}`);
        }
      }

      sp.setDepth(this.calcYDepth(sp.y + 12));
      shadow?.setPosition(sp.x, sp.y + 11);
      icon?.setPosition(sp.x, sp.y - 22);
    });
  }

  private showAnimalFeedback(x: number, y: number, res: string) {
    if (res === 'collected') {
      this.spawnFloatingText(x, y - 24, '+1 Nông sản chăn nuôi!', '#ffd54f');
    } else if (res === 'fed') {
      this.spawnFloatingText(x, y - 24, '❤️ Đã cho ăn cỏ khô!', '#ff8a80');
    } else if (res === 'petted') {
      this.spawnFloatingText(x, y - 24, '💕 Vật nuôi rất vui!', '#ff80ab');
    }
  }

  private setupInputs() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      };

      this.wasd.SPACE.on('down', () => this.performPrimaryAction());
      this.wasd.E.on('down', () => this.performPrimaryAction());

      for (let i = 1; i <= 9; i++) {
        this.input.keyboard.on(`keydown-DIGIT${i}`, () => {
          soundManager.playSfx('click');
          gameStore.setSelectedSlot(i - 1);
        });
      }
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const col = Math.floor(worldPoint.x / TILE_SIZE);
      const row = Math.floor(worldPoint.y / TILE_SIZE);

      // Nếu click vào mặt nước Hồ Gương hoặc Suối Ngân Hà -> Đi tới bờ nước rồi câu cá
      if (this.isWaterTile(row, col) && !this.isBridgeOrDockTile(row, col)) {
        this.walkThenExecute(worldPoint.x, worldPoint.y, 72, () => {
          this.faceTowards(worldPoint.x, worldPoint.y);
          this.handleFishingAction(worldPoint.x, worldPoint.y);
        });
        return;
      }

      // Nếu không click trúng nút/cây/ruộng/NPC cụ thể, hỗ trợ Click-to-Move có Tìm Đường A* né vật cản mượt mà!
      if (currentlyOver.length === 0 && !this.isCliffWallTile(row, col)) {
        this.pendingReachAction = null;
        this.startAutoWalkTo(worldPoint.x, worldPoint.y, 0);
      }
    });
  }

  /**
   * Tính ô ruộng mục tiêu dựa trên vị trí BÀN CHÂN nhân vật (không dùng đỉnh đầu/mũ).
   * Trả về null nếu nhân vật đang đứng quá xa các ô ruộng (> MAX_TOOL_REACH = 36px).
   */
  private getTargetTile(): { r: number; c: number } | null {
    const foot = this.getPlayerFootPos();
    const plots = gameStore.getState().plots;

    // 1. Ưu tiên ô ruộng ngay dưới bàn chân nếu tâm ô đó trong tầm 36px
    const footCol = Math.floor(foot.x / TILE_SIZE);
    const footRow = Math.floor(foot.y / TILE_SIZE);
    const curKey = `${footRow},${footCol}`;
    if (plots[curKey]) {
      const cx = footCol * TILE_SIZE + 16;
      const cy = footRow * TILE_SIZE + 16;
      if (Phaser.Math.Distance.Between(foot.x, foot.y, cx, cy) <= MAX_TOOL_REACH) {
        return { r: footRow, c: footCol };
      }
    }

    // 2. Kiểm tra điểm ngay trước mũi giày 22px theo hướng mặt nhân vật
    const reachX = foot.x + this.facing.x * 22;
    const reachY = foot.y + this.facing.y * 22;
    const targetCol = Math.floor(reachX / TILE_SIZE);
    const targetRow = Math.floor(reachY / TILE_SIZE);
    const targetKey = `${targetRow},${targetCol}`;

    if (plots[targetKey]) {
      const tx = targetCol * TILE_SIZE + 16;
      const ty = targetRow * TILE_SIZE + 16;
      if (Phaser.Math.Distance.Between(foot.x, foot.y, tx, ty) <= MAX_TOOL_REACH) {
        return { r: targetRow, c: targetCol };
      }
    }

    return null;
  }

  public performPrimaryAction() {
    const foot = this.getPlayerFootPos();

    // 1. Kiểm tra nếu đứng gần cây cổ thụ có thể đốn củi
    for (const node of this.chopTreeNodes) {
      if (!node.chopped && Phaser.Math.Distance.Between(foot.x, foot.y, node.x, node.y) < 48) {
        this.handleChopSpecificTree(node);
        return;
      }
    }

    // 2. Kiểm tra vùng tương tác (Nhà, Cửa Hàng, Bảng Nhiệm Vụ, NPC, Bến Câu Cá)
    if (this.activeZone) {
      this.activeZone.onTrigger();
      return;
    }

    // 3. Kiểm tra chăm sóc Vật nuôi
    for (const animal of gameStore.getState().animals) {
      const sp = this.animalSprites.get(animal.id);
      if (sp && Phaser.Math.Distance.Between(foot.x, foot.y, sp.x, sp.y) < 44) {
        this.faceTowards(sp.x, sp.y);
        const res = gameStore.interactWithAnimal(animal.id);
        this.showAnimalFeedback(sp.x, sp.y, res);
        return;
      }
    }

    // 4. Ăn món ăn hồi phục thể lực
    const selected = gameStore.getSelectedItem();
    if (selected?.def.category === 'food') {
      gameStore.eatSelectedItem();
      this.spawnFloatingText(this.player.x, this.player.y - 24, `+${selected.def.energyRestore} Thể lực!`, '#69f0ae');
      return;
    }

    // 5. Tương tác với ô ruộng ngay sát chân
    const target = this.getTargetTile();
    if (!target) {
      gameStore.showToast('Bạn đang đứng quá xa ô đất! Hãy bước lại gần ruộng hơn.', 'info');
      return;
    }
    this.handleTileInteraction(target.r, target.c);
  }

  private handleTileInteraction(r: number, c: number) {
    const px = c * TILE_SIZE + 16;
    const py = r * TILE_SIZE + 16;
    const foot = this.getPlayerFootPos();

    // Kiểm tra tầm với công cụ tính từ bàn chân: bắt buộc phải đứng ngay trên ô ruộng hoặc sát mép (<= 36px)
    const dist = Phaser.Math.Distance.Between(foot.x, foot.y, px, py);
    if (dist > MAX_TOOL_REACH) {
      this.walkThenExecute(px, py, MAX_TOOL_REACH, () => this.handleTileInteraction(r, c));
      return;
    }

    // Xoay mặt nhân vật về phía ô ruộng đang thao tác
    this.faceTowards(px, py);

    this.tweens.add({
      targets: this.player,
      scaleY: 0.86,
      scaleX: 1.12,
      duration: 85,
      yoyo: true
    });

    const outcome = gameStore.interactWithPlot(r, c);
    if (outcome.action === 'tilled') {
      this.spawnSoilParticles(px, py, 0x8d5524);
      this.spawnFloatingText(px, py - 14, 'Đã cuốc đất', '#ffe0b2');
    } else if (outcome.action === 'watered') {
      this.spawnSoilParticles(px, py, 0x4fc3f7);
      this.spawnFloatingText(px, py - 14, '💧 Đã tưới nước', '#81d4fa');
    } else if (outcome.action === 'planted') {
      this.spawnSoilParticles(px, py, 0x81c784);
      this.spawnFloatingText(px, py - 14, '🌱 Đã gieo hạt', '#b9f6ca');
    } else if (outcome.action === 'harvested') {
      this.spawnSoilParticles(px, py, 0xffd54f);
      this.spawnFloatingText(px, py - 20, '✨ Thu hoạch!', '#ffd54f');
    }
  }

  private handleShippingBinInteract() {
    const binX = 18 * TILE_SIZE + 16;
    const binY = 6.5 * TILE_SIZE;
    this.faceTowards(binX, binY);

    const selected = gameStore.getSelectedItem();
    if (selected && selected.def.sellPrice && selected.def.category !== 'tool') {
      const goldGain = selected.def.sellPrice * selected.slot.quantity;
      const itemName = selected.def.name;
      const qty = selected.slot.quantity;
      gameStore.sellItem(selected.def.id, qty);
      this.spawnFloatingText(binX, binY - 12, `+${goldGain}G (${qty}x ${itemName})`, '#ffd54f');
    } else {
      const total = gameStore.sellAllHarvestedCrops();
      if (total > 0) {
        this.spawnFloatingText(binX, binY - 12, `+${total}G!`, '#ffd54f');
      } else {
        soundManager.playSfx('shop');
        gameStore.requestModal('shop');
      }
    }
  }

  private handleFishingAction(x: number, y: number) {
    this.faceTowards(x, y);
    const selected = gameStore.getSelectedItem();
    if (selected?.def.id !== 'tool_rod') {
      const rodSlotIdx = gameStore.getState().inventory.findIndex((s) => s?.itemId === 'tool_rod');
      if (rodSlotIdx !== -1) {
        gameStore.setSelectedSlot(rodSlotIdx);
      }
    }

    this.spawnSoilParticles(x, y, 0x81d4fa);
    const fishId = gameStore.catchFish();
    if (fishId && fishId !== 'no_energy' && fishId !== 'full') {
      const def = ITEMS[fishId];
      this.spawnFloatingText(x, y - 20, `🎣 +1 ${def.name}!`, '#ffd54f');
    }
  }

  private promptSleepModal() {
    gameStore.sleepAndAdvanceDay();
  }

  private spawnSoilParticles(x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const dot = this.add.rectangle(x, y, 4, 4, color).setDepth(75);
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 12 + Math.random() * 12;
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 6,
        alpha: 0,
        duration: 360,
        onComplete: () => dot.destroy()
      });
    }
  }

  public spawnFloatingText(x: number, y: number, message: string, color = '#ffffff') {
    const txt = this.add
      .text(x, y, message, {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color,
        stroke: '#1f1005',
        strokeThickness: 3
      })
      .setOrigin(0.5, 0.5)
      .setDepth(88);

    this.tweens.add({
      targets: txt,
      y: y - 26,
      alpha: 0,
      duration: 1150,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  private createRainParticles() {
    const worldWidth = MAP_COLS * TILE_SIZE;
    const worldHeight = MAP_ROWS * TILE_SIZE;
    for (let i = 0; i < 85; i++) {
      const drop = this.add
        .rectangle(Math.random() * worldWidth, Math.random() * worldHeight, 2, 10, 0x90caf9, 0.55)
        .setDepth(76)
        .setVisible(false);
      this.rainDrops.push(drop);
    }
  }

  private createAmbientAtmosphere() {
    const worldWidth = MAP_COLS * TILE_SIZE;
    const worldHeight = MAP_ROWS * TILE_SIZE;

    for (let i = 0; i < 36; i++) {
      const petal = this.add
        .rectangle(Math.random() * worldWidth, Math.random() * worldHeight, 4, 4, 0xffb2dd, 0.8)
        .setDepth(74);
      this.ambientPetals.push({
        sprite: petal,
        vx: 0.25 + Math.random() * 0.35,
        vy: 0.35 + Math.random() * 0.4
      });
    }

    for (let i = 0; i < 30; i++) {
      const fly = this.add
        .circle(Math.random() * worldWidth, Math.random() * worldHeight, 3, 0xfff59d, 0)
        .setDepth(82);
      this.fireflies.push({
        sprite: fly,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private spawnChimneySmoke() {
    const smokeX = 13 * TILE_SIZE + 28;
    const smokeY = 4.8 * TILE_SIZE - 42;
    const puff = this.add.circle(smokeX, smokeY, 4, 0xffffff, 0.55).setDepth(65);
    this.tweens.add({
      targets: puff,
      x: smokeX + 12 + Math.random() * 10,
      y: smokeY - 28 - Math.random() * 10,
      scale: 2.1,
      alpha: 0,
      duration: 2200,
      ease: 'Sine.easeOut',
      onComplete: () => puff.destroy()
    });
  }

  private updateDayNightOverlay() {
    if (!this.nightOverlay) return;
    const mins = gameStore.getState().timeMinutes;
    let lampAlpha = 0;
    if (mins < 990) {
      this.nightOverlay.setFillStyle(0x09122c, 0);
      lampAlpha = 0;
    } else if (mins < 1140) {
      const ratio = (mins - 990) / 150;
      this.nightOverlay.setFillStyle(0x3a1c3d, ratio * 0.28);
      lampAlpha = ratio * 0.22;
    } else {
      const ratio = Math.min(1, (mins - 1140) / 180);
      this.nightOverlay.setFillStyle(0x081026, 0.28 + ratio * 0.25);
      lampAlpha = 0.25;
    }
    this.lampGlows.forEach((g) => g.setAlpha(lampAlpha));
  }

  private updateRoamingNPCs(delta: number) {
    this.roamingNPCs.forEach((npc) => {
      if (npc.pauseTimer > 0) {
        npc.pauseTimer -= delta;
        npc.sprite.setTexture(`${npc.id}_${npc.dir}_0`);
        if (npc.pauseTimer <= 0) {
          const offsets: Array<{ dx: number; dy: number; dir: 'down' | 'up' | 'left' | 'right' }> = [
            { dx: 32, dy: 0, dir: 'right' },
            { dx: -32, dy: 0, dir: 'left' },
            { dx: 0, dy: 24, dir: 'down' },
            { dx: 0, dy: -24, dir: 'up' },
            { dx: 0, dy: 0, dir: 'down' }
          ];
          const pick = offsets[Math.floor(Math.random() * offsets.length)];
          npc.targetX = npc.baseX + pick.dx;
          npc.targetY = npc.baseY + pick.dy;
          npc.dir = pick.dir;
        }
        return;
      }

      const dx = npc.targetX - npc.sprite.x;
      const dy = npc.targetY - npc.sprite.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        npc.sprite.setPosition(npc.targetX, npc.targetY);
        npc.pauseTimer = 2200 + Math.random() * 2800;
        npc.sprite.setTexture(`${npc.id}_${npc.dir}_0`);
      } else {
        // Luôn đồng bộ hướng mặt NPC với hướng vector di chuyển thực tế
        if (Math.abs(dx) >= Math.abs(dy)) {
          npc.dir = dx < 0 ? 'left' : 'right';
        } else {
          npc.dir = dy < 0 ? 'up' : 'down';
        }
        const stepSpeed = 28 * (delta / 1000);
        npc.sprite.x += (dx / dist) * stepSpeed;
        npc.sprite.y += (dy / dist) * stepSpeed;
        npc.walkTimer += delta;
        const stepIdx = Math.floor(npc.walkTimer / 210) % 2 === 0 ? 1 : 2;
        npc.sprite.setTexture(`${npc.id}_${npc.dir}_${stepIdx}`);
      }

      npc.sprite.setDepth(this.calcYDepth(npc.sprite.y + 14));
      npc.shadow.setPosition(npc.sprite.x, npc.sprite.y + 12);
      npc.nameTag.setPosition(npc.sprite.x, npc.sprite.y - 22);
      npc.nameTag.setDepth(this.calcYDepth(npc.sprite.y + 30));

      const zone = this.interactZones.find((z) => z.id === `talk_${npc.id}`);
      if (zone) {
        zone.x = npc.sprite.x;
        zone.y = npc.sprite.y;
      }
    });
  }

  private canWalkOn(worldX: number, worldY: number): boolean {
    // Tính tọa độ bàn chân thực tế của nhân vật (tâm sprite + 10px xuống dưới)
    const footX = worldX;
    const footY = worldY + 10;
    const col = Math.floor(footX / TILE_SIZE);
    const row = Math.floor(footY / TILE_SIZE);

    if (col < 1 || col >= MAP_COLS - 1 || row < 1 || row >= MAP_ROWS - 1) return false;
    if (this.isCliffWallTile(row, col)) return false;

    // Kiểm tra va chạm với toàn bộ công trình, hàng rào, gốc cây, tảng đá, chuồng trại
    const footRect = new Phaser.Geom.Rectangle(footX - 6, footY - 4, 12, 8);
    for (const c of this.solidColliders) {
      if (c.active && Phaser.Geom.Intersects.RectangleToRectangle(footRect, c.rect)) {
        return false;
      }
    }

    if (this.isBridgeOrDockTile(row, col)) return true;
    if (this.isWaterTile(row, col) && this.currentRenderedSeason !== 'Đông') return false;
    return true;
  }

  public update(_time: number, delta: number) {
    const state = gameStore.getState();
    const speed = 165;
    let vx = this.virtualJoystick.dx;
    let vy = this.virtualJoystick.dy;

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) vx += 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) vy += 1;

    // Nếu người chơi nhấn phím hoặc kéo joystick, hủy mục tiêu click chuột & hành động chờ
    if (vx !== 0 || vy !== 0) {
      this.clickPath = [];
      this.clickMoveTarget = null;
      this.pendingReachAction = null;
    } else if (this.clickMoveTarget) {
      // Nếu đang đi bộ tới mục tiêu tương tác và bàn chân đã vào trong tầm với -> Dừng lại & thực thi ngay!
      if (this.pendingReachAction) {
        const foot = this.getPlayerFootPos();
        const reachDist = Phaser.Math.Distance.Between(
          foot.x,
          foot.y,
          this.pendingReachAction.targetX,
          this.pendingReachAction.targetY
        );
        if (reachDist <= this.pendingReachAction.stopRadius) {
          const action = this.pendingReachAction.execute;
          this.clickPath = [];
          this.clickMoveTarget = null;
          this.pendingReachAction = null;
          action();
        }
      }

      if (this.clickMoveTarget) {
        const cdx = this.clickMoveTarget.x - this.player.x;
        const cdy = this.clickMoveTarget.y - this.player.y;
        const cdist = Math.hypot(cdx, cdy);
        if (cdist < 6) {
          // Đã tới waypoint hiện tại -> Chuyển sang waypoint tiếp theo trong hành trình A*
          this.clickPath.shift();
          if (this.clickPath.length > 0) {
            this.clickMoveTarget = this.clickPath[0];
            const nextDx = this.clickMoveTarget.x - this.player.x;
            const nextDy = this.clickMoveTarget.y - this.player.y;
            const nextDist = Math.hypot(nextDx, nextDy);
            if (nextDist > 0.5) {
              vx = nextDx / nextDist;
              vy = nextDy / nextDist;
            }
          } else {
            this.clickMoveTarget = null;
            if (this.pendingReachAction) {
              const foot = this.getPlayerFootPos();
              const reachDist = Phaser.Math.Distance.Between(
                foot.x,
                foot.y,
                this.pendingReachAction.targetX,
                this.pendingReachAction.targetY
              );
              if (reachDist <= this.pendingReachAction.stopRadius + 24) {
                const action = this.pendingReachAction.execute;
                this.pendingReachAction = null;
                action();
              } else {
                this.pendingReachAction = null;
              }
            }
          }
        } else {
          vx = cdx / cdist;
          vy = cdy / cdist;
        }
      }
    }

    if (vx !== 0 || vy !== 0) {
      // Cập nhật hướng quay mặt chuẩn xác 100% theo vector vận tốc (vx, vy)
      if (Math.abs(vx) >= Math.abs(vy)) {
        this.facing = { x: Math.sign(vx), y: 0 };
        this.facingDir = vx < 0 ? 'left' : 'right';
      } else {
        this.facing = { x: 0, y: Math.sign(vy) };
        this.facingDir = vy < 0 ? 'up' : 'down';
      }

      const len = Math.hypot(vx, vy);
      const stepDist = speed * (delta / 1000);
      const stepX = (vx / len) * stepDist;
      const stepY = (vy / len) * stepDist;

      const candX = Phaser.Math.Clamp(this.player.x + stepX, TILE_SIZE * 1.2, (MAP_COLS - 1.2) * TILE_SIZE);
      const candY = Phaser.Math.Clamp(this.player.y + stepY, TILE_SIZE * 1.2, (MAP_ROWS - 1.2) * TILE_SIZE);

      // Cho phép trượt dọc bờ suối / vách đá / góc vật cản mượt mà
      let moved = false;
      if (this.canWalkOn(candX, candY)) {
        this.player.setPosition(candX, candY);
        moved = true;
      } else if (Math.abs(stepX) > 0.01 && this.canWalkOn(candX, this.player.y)) {
        this.player.setX(candX);
        moved = true;
      } else if (Math.abs(stepY) > 0.01 && this.canWalkOn(this.player.x, candY)) {
        this.player.setY(candY);
        moved = true;
      } else {
        // Thử lách nhẹ sang phương vuông góc (Corner Slide Assist) nếu vướng mép góc 1-2px
        const perpAngles = [Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2];
        const baseAngle = Math.atan2(vy, vx);
        for (const offsetAngle of perpAngles) {
          const testX = this.player.x + Math.cos(baseAngle + offsetAngle) * stepDist;
          const testY = this.player.y + Math.sin(baseAngle + offsetAngle) * stepDist;
          if (this.canWalkOn(testX, testY)) {
            this.player.setPosition(testX, testY);
            moved = true;
            break;
          }
        }
      }

      if (!moved) {
        // Nếu vẫn bị chặn hoàn toàn, kiểm tra xem đã đủ tầm thực thi hành động chưa
        if (this.pendingReachAction) {
          const foot = this.getPlayerFootPos();
          const d = Phaser.Math.Distance.Between(
            foot.x,
            foot.y,
            this.pendingReachAction.targetX,
            this.pendingReachAction.targetY
          );
          if (d <= this.pendingReachAction.stopRadius + 20) {
            const action = this.pendingReachAction.execute;
            this.pendingReachAction = null;
            this.clickPath = [];
            this.clickMoveTarget = null;
            action();
          }
        }
        this.clickPath = [];
        this.clickMoveTarget = null;
        this.pendingReachAction = null;
      }

      if (moved) {
        soundManager.playStepSfx();
      }

      this.walkAnimTimer += delta;
      const stepFrame = Math.floor(this.walkAnimTimer / 135) % 2 === 0 ? 1 : 2;
      this.player.setTexture(`player_${this.facingDir}_${stepFrame}`);
    } else {
      this.player.setTexture(`player_${this.facingDir}_0`);
    }

    // Y-Sorting động cho nhân vật chính: đi phía trước gốc cây sẽ che gốc cây, đi vòng ra sau sẽ khuất dưới tán lá!
    this.player.setDepth(this.calcYDepth(this.player.y + 14));
    this.playerShadow.setPosition(this.player.x, this.player.y + 12);

    this.updateRoamingNPCs(delta);
    this.updateAnimalsMovement(delta);

    this.targetHighlight.clear();
    if (state.settings.showGridHint) {
      const target = this.getTargetTile();
      if (target) {
        this.targetHighlight.lineStyle(2, 0xffeb3b, 0.9);
        this.targetHighlight.strokeRoundedRect(
          target.c * TILE_SIZE + 2,
          target.r * TILE_SIZE + 2,
          TILE_SIZE - 4,
          TILE_SIZE - 4,
          4
        );
      }
    }

    let closest: InteractZone | null = null;
    let minDist = Infinity;
    for (const z of this.interactZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y);
      if (d <= z.radius && d < minDist) {
        minDist = d;
        closest = z;
      }
    }
    this.activeZone = closest;

    if (closest) {
      this.promptText.setText(closest.label);
      this.promptText.setPosition(this.player.x, this.player.y - 24);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    this.waterAnimTimer += delta;
    if (this.waterAnimTimer > 520 && this.currentRenderedSeason !== 'Đông') {
      this.waterAnimTimer = 0;
      this.waterFrame = (this.waterFrame + 1) % 3;
      this.waterTiles.forEach((w) => {
        w.sprite.setTexture(`tile_water_${w.dir}_${this.waterFrame}`);
      });
    }

    this.chimneySmokeTimer += delta;
    if (this.chimneySmokeTimer > 950) {
      this.chimneySmokeTimer = 0;
      this.spawnChimneySmoke();
    }

    const isRaining = state.weather === 'Mưa Rào';
    const worldHeight = MAP_ROWS * TILE_SIZE;
    const worldWidth = MAP_COLS * TILE_SIZE;
    this.rainDrops.forEach((drop) => {
      drop.setVisible(isRaining);
      if (isRaining) {
        drop.y += 7.5;
        drop.x -= 1.5;
        if (drop.y > worldHeight) drop.y = 0;
        if (drop.x < 0) drop.x = worldWidth;
      }
    });

    const seasonColor =
      this.currentRenderedSeason === 'Xuân'
        ? 0xff9ec7
        : this.currentRenderedSeason === 'Hạ'
          ? 0xfff59d
          : this.currentRenderedSeason === 'Thu'
            ? 0xff8a3d
            : 0xffffff;

    this.ambientPetals.forEach((p) => {
      p.sprite.setFillStyle(seasonColor, isRaining ? 0 : 0.78);
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      if (p.sprite.y > worldHeight) p.sprite.y = 0;
      if (p.sprite.x > worldWidth) p.sprite.x = 0;
    });

    const isEvening = state.timeMinutes >= 1020;
    this.fireflies.forEach((f) => {
      if (!isEvening || isRaining) {
        f.sprite.setAlpha(0);
      } else {
        f.phase += delta * 0.004;
        f.sprite.setAlpha(0.3 + Math.sin(f.phase) * 0.35);
        f.sprite.x += Math.cos(f.phase * 0.7) * 0.25;
        f.sprite.y += Math.sin(f.phase) * 0.25;
      }
    });
  }
}
