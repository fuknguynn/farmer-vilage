import React, { useState } from 'react';
import {
  X,
  Coins,
  Sparkles,
  CheckCircle2,
  Hammer,
  Heart,
  Gift,
  MessageCircle,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Sun,
  Award,
  ShoppingBag,
  ArrowUpCircle
} from 'lucide-react';
import type { GameState, DailyReport } from '../types/game';
import { ITEMS, NPC_DIALOGUES, TOOL_UPGRADE_INFO } from '../data/gameData';
import { gameStore } from '../state/gameStore';
import { PixelIcon } from './PixelIcon';

interface ModalsProps {
  activeModal: string | null;
  modalPayload: unknown;
  state: GameState;
  onClose: () => void;
  onReturnToTitle: () => void;
}

export const GameModals: React.FC<ModalsProps> = ({
  activeModal,
  modalPayload,
  state,
  onClose,
  onReturnToTitle
}) => {
  const [shopTab, setShopTab] = useState<'buy_seeds' | 'sell_crops' | 'upgrade_tools' | 'farm_expand'>('buy_seeds');
  const [swapSource, setSwapSource] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!activeModal) return null;

  // 1. TÚI ĐỒ & KHO VẬT PHẨM (INVENTORY MODAL)
  if (activeModal === 'inventory') {
    const selectedSlot = state.inventory[state.selectedSlot];
    const selectedDef = selectedSlot ? ITEMS[selectedSlot.itemId] : null;

    const handleSlotClick = (idx: number) => {
      if (swapSource === null) {
        gameStore.setSelectedSlot(idx);
      } else {
        gameStore.swapInventorySlots(swapSource, idx);
        setSwapSource(null);
      }
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window pixel-wood-panel" id="modal-inventory" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🎒 Túi Đồ & Trang Bị Nông Trại</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="inventory-stats-strip">
            <span>👤 Nông dân: <strong>{state.playerName}</strong></span>
            <span>🌾 Đã thu hoạch: <strong>{state.stats.cropsHarvested}</strong> vụ</span>
            <span>🎣 Đã câu: <strong>{state.stats.fishCaught}</strong> cá</span>
            <span>💰 Tổng thu nhập: <strong>{state.totalGoldEarned.toLocaleString('vi-VN')} Vàng</strong></span>
          </div>

          <p className="modal-hint">
            Nhấn vào ô để trang bị. Hàng đầu tiên (1-9) là Thanh Công Cụ Nhanh hiển thị trên màn hình.
          </p>

          <div className="inventory-grid-24">
            {state.inventory.map((slot, idx) => {
              const def = slot ? ITEMS[slot.itemId] : null;
              const isSelected = state.selectedSlot === idx;
              const isSwapping = swapSource === idx;
              return (
                <button
                  key={idx}
                  id={`inv-slot-${idx}`}
                  className={`inv-cell ${isSelected ? 'active' : ''} ${isSwapping ? 'swapping' : ''}`}
                  onClick={() => handleSlotClick(idx)}
                >
                  {idx < 9 && <span className="cell-hotbar-tag">Phím {idx + 1}</span>}
                  {def ? (
                    <>
                      <PixelIcon iconKey={def.iconKey} size={38} />
                      <span className="cell-name">{def.name}</span>
                      {def.category !== 'tool' && slot && (
                        <span className="cell-qty">x{slot.quantity}</span>
                      )}
                    </>
                  ) : (
                    <span className="cell-empty">Trống</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDef && (
            <div className="inventory-detail-box">
              <div className="detail-left">
                <PixelIcon iconKey={selectedDef.iconKey} size={48} />
                <div>
                  <h3>{selectedDef.name}</h3>
                  <p>{selectedDef.description}</p>
                  <div className="detail-tags">
                    {selectedDef.sellPrice && (
                      <span className="tag-gold">Giá bán: {selectedDef.sellPrice} Vàng</span>
                    )}
                    {selectedDef.energyRestore && (
                      <span className="tag-energy">Hồi phục: +{selectedDef.energyRestore} Thể lực</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  className="pixel-btn pixel-btn-wood"
                  onClick={() => setSwapSource(swapSource === state.selectedSlot ? null : state.selectedSlot)}
                >
                  {swapSource === state.selectedSlot ? 'Huỷ đổi vị trí' : 'Đổi vị trí ô'}
                </button>
                {selectedDef.energyRestore && (
                  <button
                    className="pixel-btn pixel-btn-primary"
                    onClick={() => gameStore.eatSelectedItem()}
                  >
                    Sử dụng (+{selectedDef.energyRestore} Thể lực)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. CỬA HÀNG NÔNG SẢN, LÒ RÈN & MỞ RỘNG (SHOP MODAL)
  if (activeModal === 'shop') {
    const seedItems = Object.values(ITEMS).filter(
      (i) => i.category === 'seed' || i.category === 'food' || i.id === 'item_fodder'
    );

    const sellableSlots = state.inventory
      .map((slot, idx) => ({ slot, idx, def: slot ? ITEMS[slot.itemId] : null }))
      .filter((x) => x.slot && x.def && x.def.sellPrice && x.def.category !== 'tool');

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window modal-large pixel-wood-panel" id="modal-shop" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🏪 Cửa Hàng Nông Sản & Lò Rèn Làng Mây</h2>
            <div className="header-gold-pill">
              <Coins size={18} />
              <span>{state.gold.toLocaleString('vi-VN')} Vàng</span>
            </div>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="shop-tabs">
            <button
              id="tab-buy-seeds"
              className={`pixel-tab-btn ${shopTab === 'buy_seeds' ? 'active' : ''}`}
              onClick={() => setShopTab('buy_seeds')}
            >
              <ShoppingBag size={16} />
              <span>Mua Hạt Giống & Vật Phẩm</span>
            </button>
            <button
              id="tab-sell-crops"
              className={`pixel-tab-btn ${shopTab === 'sell_crops' ? 'active' : ''}`}
              onClick={() => setShopTab('sell_crops')}
            >
              <Coins size={16} />
              <span>Bán Nông Sản Thu Hoạch</span>
            </button>
            <button
              id="tab-upgrade-tools"
              className={`pixel-tab-btn ${shopTab === 'upgrade_tools' ? 'active' : ''}`}
              onClick={() => setShopTab('upgrade_tools')}
            >
              <Hammer size={16} />
              <span>Rèn Nâng Cấp Công Cụ</span>
            </button>
            <button
              id="tab-farm-expand"
              className={`pixel-tab-btn ${shopTab === 'farm_expand' ? 'active' : ''}`}
              onClick={() => setShopTab('farm_expand')}
            >
              <ArrowUpCircle size={16} />
              <span>Chăn Nuôi & Mở Rộng Đất</span>
            </button>
          </div>

          {/* TAB 1: MUA HẠT GIỐNG & THỨC ĂN */}
          {shopTab === 'buy_seeds' && (
            <div className="shop-items-grid">
              {seedItems.map((item) => (
                <div key={item.id} className="shop-item-card">
                  <div className="shop-card-left">
                    <PixelIcon iconKey={item.iconKey} size={42} />
                    <div className="shop-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <span className="owned-badge">
                        Đang có trong túi: {gameStore.getItemCount(item.id)}
                      </span>
                    </div>
                  </div>
                  <div className="shop-card-actions">
                    <span className="price-tag">{item.buyPrice} Vàng</span>
                    <div className="buy-btn-group">
                      <button
                        id={`btn-buy-1-${item.id}`}
                        className="pixel-btn pixel-btn-primary"
                        onClick={() => gameStore.buyItem(item.id, 1)}
                      >
                        Mua +1
                      </button>
                      <button
                        id={`btn-buy-5-${item.id}`}
                        className="pixel-btn pixel-btn-secondary"
                        onClick={() => gameStore.buyItem(item.id, 5)}
                      >
                        Mua +5
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: BÁN NÔNG SẢN */}
          {shopTab === 'sell_crops' && (
            <div className="shop-sell-section">
              <div className="sell-all-banner">
                <div>
                  <h4>📦 Giao Bán Nhanh Toàn Bộ Nông Sản</h4>
                  <p>Bán tất cả rau củ, trái cây, cá và trứng sữa trong túi đồ chỉ với 1 cú nhấp.</p>
                </div>
                <button
                  id="btn-sell-all-crops"
                  className="pixel-btn pixel-btn-primary"
                  onClick={() => gameStore.sellAllHarvestedCrops()}
                >
                  <Coins size={18} />
                  <span>Bán Tất Cả Nông Sản</span>
                </button>
              </div>

              {sellableSlots.length === 0 ? (
                <div className="empty-shop-notice">
                  Hiện chưa có nông sản nào trong túi đồ để bán. Hãy thu hoạch mùa màng, câu cá hoặc nhặt trứng gà nhé!
                </div>
              ) : (
                <div className="shop-items-grid">
                  {sellableSlots.map(({ slot, def }) => {
                    if (!slot || !def) return null;
                    return (
                      <div key={def.id} className="shop-item-card">
                        <div className="shop-card-left">
                          <PixelIcon iconKey={def.iconKey} size={42} />
                          <div className="shop-item-info">
                            <h4>
                              {def.name} <span className="qty-pill">x{slot.quantity}</span>
                            </h4>
                            <p>{def.description}</p>
                          </div>
                        </div>
                        <div className="shop-card-actions">
                          <span className="price-tag gold-earn">+{def.sellPrice} Vàng / cái</span>
                          <div className="buy-btn-group">
                            <button
                              id={`btn-sell-1-${def.id}`}
                              className="pixel-btn pixel-btn-secondary"
                              onClick={() => gameStore.sellItem(def.id, 1)}
                            >
                              Bán 1
                            </button>
                            <button
                              id={`btn-sell-all-${def.id}`}
                              className="pixel-btn pixel-btn-primary"
                              onClick={() => gameStore.sellItem(def.id, slot.quantity)}
                            >
                              Bán hết ({ (def.sellPrice || 0) * slot.quantity } Vàng)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NÂNG CẤP CÔNG CỤ */}
          {shopTab === 'upgrade_tools' && (
            <div className="shop-items-grid">
              {(
                [
                  { key: 'hoe', name: 'Cuốc Đất', icon: 'icon_hoe', desc: 'Giảm thể lực tiêu hao mỗi lần cuốc đất.' },
                  {
                    key: 'watering',
                    name: 'Bình Tưới Nước',
                    icon: 'icon_watering',
                    desc: 'Giảm thể lực tiêu hao mỗi lần tưới cây.'
                  },
                  { key: 'rod', name: 'Cần Câu Tre', icon: 'icon_rod', desc: 'Giúp câu cá nhẹ nhàng, ít tốn sức hơn.' },
                  { key: 'axe', name: 'Rìu Đốn Gỗ', icon: 'icon_axe', desc: 'Chặt gỗ thông nhanh và tiết kiệm sức lực.' }
                ] as const
              ).map((t) => {
                const curLv = state.toolLevels[t.key];
                const curInfo = TOOL_UPGRADE_INFO[curLv];
                const nextInfo = TOOL_UPGRADE_INFO[curLv + 1];
                return (
                  <div key={t.key} className="shop-item-card">
                    <div className="shop-card-left">
                      <PixelIcon iconKey={t.icon} size={42} />
                      <div className="shop-item-info">
                        <h4>
                          {t.name} — <span style={{ color: curInfo.color }}>{curInfo.name}</span>
                        </h4>
                        <p>{t.desc}</p>
                      </div>
                    </div>
                    <div className="shop-card-actions">
                      {nextInfo ? (
                        <>
                          <span className="price-tag">{nextInfo.cost} Vàng</span>
                          <button
                            id={`btn-upgrade-${t.key}`}
                            className="pixel-btn pixel-btn-primary"
                            onClick={() => gameStore.upgradeTool(t.key)}
                          >
                            Nâng lên {nextInfo.name}
                          </button>
                        </>
                      ) : (
                        <span className="max-level-badge">✨ Đã đạt cấp Hoàng Kim tối đa</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: CHĂN NUÔI & MỞ RỘNG NÔNG TRẠI */}
          {shopTab === 'farm_expand' && (
            <div className="shop-items-grid">
              <div className="shop-item-card">
                <div className="shop-card-left">
                  <PixelIcon iconKey="icon_egg" size={42} />
                  <div className="shop-item-info">
                    <h4>Nhận Nuôi Gà Đẻ Trứng Mới</h4>
                    <p>Đón thêm một chú gà đáng yêu về Chuồng Gà Mái Đỏ, cung cấp Trứng Gà Ta Tươi mỗi sáng (Tối đa 12 vật nuôi — Hiện có: {state.animals.length}/12).</p>
                  </div>
                </div>
                <div className="shop-card-actions">
                  <span className="price-tag">220 Vàng</span>
                  <button
                    id="btn-buy-chicken"
                    className="pixel-btn pixel-btn-primary"
                    onClick={() => gameStore.buyNewAnimal('chicken')}
                  >
                    Đón Gà Mới
                  </button>
                </div>
              </div>

              <div className="shop-item-card">
                <div className="shop-card-left">
                  <PixelIcon iconKey="icon_milk" size={42} />
                  <div className="shop-item-info">
                    <h4>Nhận Nuôi Bò Sữa Mây Trắng</h4>
                    <p>Đón thêm bò sữa khỏe mạnh về Chuồng Gia Súc Lớn, cho Sữa Bò Tươi Nguyên Chất giá trị cao (Tối đa 12 vật nuôi — Hiện có: {state.animals.length}/12).</p>
                  </div>
                </div>
                <div className="shop-card-actions">
                  <span className="price-tag">480 Vàng</span>
                  <button
                    id="btn-buy-cow"
                    className="pixel-btn pixel-btn-primary"
                    onClick={() => gameStore.buyNewAnimal('cow')}
                  >
                    Đón Bò Sữa
                  </button>
                </div>
              </div>

              <div className="shop-item-card">
                <div className="shop-card-left">
                  <PixelIcon iconKey="icon_hoe" size={42} />
                  <div className="shop-item-info">
                    <h4>Mở Rộng Khu Ruộng Phía Nam (+48 Ô Đất)</h4>
                    <p>Khai hoang cánh đồng màu mỡ phía Nam để nâng tổng diện tích gieo trồng lên 120 ô đất!</p>
                  </div>
                </div>
                <div className="shop-card-actions">
                  {state.unlockedSouthField ? (
                    <span className="max-level-badge">✅ Đã mở khóa Cánh Đồng Phía Nam</span>
                  ) : (
                    <>
                      <span className="price-tag">450 Vàng</span>
                      <button
                        id="btn-unlock-south-field"
                        className="pixel-btn pixel-btn-primary"
                        onClick={() => gameStore.unlockSouthField()}
                      >
                        Mở Rộng Đất Ngay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. BẢNG NHIỆM VỤ & TIẾN TRÌNH (QUESTS MODAL)
  if (activeModal === 'quests') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window pixel-wood-panel" id="modal-quests" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>📜 Bảng Nhiệm Vụ Thung Lũng Mây Trắng</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="quests-list-container">
            {state.quests.map((q) => {
              const pct = Math.min(100, Math.round((q.currentCount / q.requiredCount) * 100));
              const rewardItemDef = q.rewardItem ? ITEMS[q.rewardItem.itemId] : null;
              return (
                <div key={q.id} className={`quest-card ${q.completed ? 'completed' : ''} ${q.claimed ? 'claimed' : ''}`}>
                  <div className="quest-card-main">
                    <div className="quest-title-row">
                      <h3>
                        {q.completed ? '✅' : '🌱'} {q.title}
                      </h3>
                      <span className="quest-giver">Người giao: {q.giver}</span>
                    </div>
                    <p className="quest-desc">{q.description}</p>

                    <div className="quest-progress-row">
                      <div className="quest-bar-bg">
                        <div className="quest-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="quest-progress-text">
                        Tiến độ: {q.currentCount}/{q.requiredCount}
                      </span>
                    </div>
                  </div>

                  <div className="quest-card-reward">
                    <div className="reward-badges">
                      <span className="reward-gold">+{q.rewardGold} Vàng</span>
                      {rewardItemDef && q.rewardItem && (
                        <span className="reward-item">
                          +{q.rewardItem.quantity} {rewardItemDef.name}
                        </span>
                      )}
                    </div>

                    {q.claimed ? (
                      <span className="claimed-label">
                        <CheckCircle2 size={16} /> Đã nhận thưởng
                      </span>
                    ) : q.completed ? (
                      <button
                        id={`btn-claim-${q.id}`}
                        className="pixel-btn pixel-btn-primary"
                        onClick={() => gameStore.claimQuestReward(q.id)}
                      >
                        <Award size={16} />
                        <span>Nhận Thưởng</span>
                      </button>
                    ) : (
                      <span className="in-progress-label">Đang thực hiện</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. HỘI THOẠI NPC & TẶNG QUÀ (NPC DIALOGUE MODAL)
  if (activeModal === 'npc_dialog') {
    const npcId = (modalPayload as string) || 'npc_bac_ba';
    const npc = state.npcs[npcId];
    if (!npc) return null;

    const dialogues = NPC_DIALOGUES[npcId]?.[state.season] || NPC_DIALOGUES[npcId]?.default || [];
    const defaultList = NPC_DIALOGUES[npcId]?.default || [];
    const allLines = [...dialogues, ...defaultList];
    const line = allLines[(state.day + Math.floor(npc.hearts)) % allLines.length];

    const selected = gameStore.getSelectedItem();
    const canGift = selected && selected.def.category !== 'tool' && !npc.giftedToday;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window npc-dialog-window pixel-wood-panel" id="modal-npc" onClick={(e) => e.stopPropagation()}>
          <div className="npc-dialog-body">
            <div className="npc-portrait-frame">
              <PixelIcon iconKey={npc.portraitKey} size={76} />
              <div className="npc-hearts">
                <Heart size={14} fill="#ff4081" color="#ff4081" />
                <span>{npc.hearts} / 10 Tim</span>
              </div>
            </div>

            <div className="npc-speech-content">
              <div className="npc-title-bar">
                <h3>{npc.name}</h3>
                <span className="npc-role-badge">{npc.role}</span>
              </div>

              <p className="npc-speech-text">“{line}”</p>

              <div className="npc-favorites-hint">
                <span>💝 Quà yêu thích: </span>
                {npc.favoriteItems.map((fid) => ITEMS[fid]?.name).join(', ')}
              </div>
            </div>
          </div>

          <div className="npc-dialog-footer">
            {canGift && selected && (
              <button
                id="btn-gift-npc"
                className="pixel-btn pixel-btn-secondary"
                onClick={() => gameStore.giftItemToNPC(npcId, selected.def.id)}
              >
                <Gift size={18} />
                <span>Tặng 1x {selected.def.name}</span>
              </button>
            )}
            <button id="btn-close-npc" className="pixel-btn pixel-btn-primary" onClick={onClose}>
              <MessageCircle size={18} />
              <span>Tạm biệt & Tiếp tục</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. SỔ TAY DÂN LÀNG (SOCIAL NOTEBOOK — CHỈ XEM THÔNG TIN)
  if (activeModal === 'social') {
    const npcList = Object.values(state.npcs);
    const talkedCount = npcList.filter((n) => n.talkedToday).length;
    const giftedCount = npcList.filter((n) => n.giftedToday).length;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-window modal-large pixel-wood-panel"
          id="modal-social"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>👥 Sổ Tay Dân Làng</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="inventory-stats-strip">
            <span>
              👥 Đã trò chuyện hôm nay: <strong>{talkedCount}/{npcList.length}</strong>
            </span>
            <span>
              💝 Đã tặng quà hôm nay: <strong>{giftedCount}/{npcList.length}</strong>
            </span>
          </div>

          <p className="modal-hint">
            Sổ tay chỉ để tra cứu. Muốn trò chuyện hoặc tặng quà, hãy bấm vào dân làng ngoài bản đồ.
          </p>

          <section className="social-section">
            <div className="social-grid">
              {npcList.map((npc) => (
                <article key={npc.id} className="social-card" id={`social-npc-${npc.id}`}>
                  <div className="social-card-top">
                    <div className="social-avatar">
                      <PixelIcon iconKey={npc.portraitKey} size={44} />
                    </div>
                    <div className="social-card-info">
                      <div className="social-name">{npc.name}</div>
                      <div className="social-role">{npc.role}</div>
                      <div className="social-hearts">
                        <Heart size={13} fill="#ff4081" color="#ff4081" />
                        <span>{npc.hearts} / 10 tim</span>
                      </div>
                    </div>
                  </div>

                  <div className="social-chip-row">
                    <span className={`social-chip ${npc.talkedToday ? 'done' : 'todo'}`}>
                      {npc.talkedToday ? 'Đã trò chuyện' : 'Chưa trò chuyện'}
                    </span>
                    {npc.giftedToday && <span className="social-chip done">Đã tặng quà</span>}
                  </div>

                  <div className="social-favorites">
                    💝 <strong>Quà yêu thích:</strong>{' '}
                    {npc.favoriteItems
                      .map((fid) => ITEMS[fid]?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="modal-footer-center">
            <button id="btn-close-social" className="pixel-btn pixel-btn-primary" onClick={onClose}>
              <X size={18} />
              <span>Đóng Sổ Tay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. SỔ TAY VẬT NUÔI (ANIMALS NOTEBOOK — CHỈ XEM THÔNG TIN)
  if (activeModal === 'animals') {
    const fedCount = state.animals.filter((a) => a.fedToday).length;
    const readyProducts = state.animals.filter((a) => a.hasProduct).length;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-window modal-large pixel-wood-panel"
          id="modal-animals"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>🐾 Sổ Tay Vật Nuôi</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="inventory-stats-strip">
            <span>
              🍽️ Đã cho ăn hôm nay: <strong>{fedCount}/{state.animals.length}</strong>
            </span>
            <span>
              🥚 Sản phẩm chờ thu hoạch: <strong>{readyProducts}/{state.animals.length}</strong>
            </span>
          </div>

          <p className="modal-hint">
            Sổ tay chỉ để tra cứu. Muốn cho ăn, vuốt ve hoặc thu sản phẩm, hãy bấm vào vật nuôi ở Khu Đồng Cỏ.
          </p>

          {state.animals.length === 0 ? (
            <p className="modal-hint">Chưa có vật nuôi nào trong nông trại.</p>
          ) : (
            <section className="social-section">
              <div className="social-grid">
                {state.animals.map((animal) => (
                  <article key={animal.id} className="social-card" id={`social-animal-${animal.id}`}>
                    <div className="social-card-top">
                      <div className="social-avatar social-animal-emoji">
                        {animal.type === 'chicken' ? '🐔' : '🐄'}
                      </div>
                      <div className="social-card-info">
                        <div className="social-name">{animal.name}</div>
                        <div className="social-role">
                          {animal.type === 'chicken' ? 'Gà đẻ trứng' : 'Bò sữa'}
                        </div>
                        <div className="social-hearts">Thân thiết {Math.round(animal.affection)}/100</div>
                      </div>
                    </div>

                    <div
                      className="social-affection-track"
                      title={`Độ thân thiết ${Math.round(animal.affection)}/100`}
                    >
                      <div
                        className="social-affection-fill"
                        style={{ width: `${Math.round(animal.affection)}%` }}
                      />
                    </div>

                    <div className="social-chip-row">
                      <span className={`social-chip ${animal.fedToday ? 'done' : 'todo'}`}>
                        {animal.fedToday ? 'Đã cho ăn' : 'Đang đói'}
                      </span>
                      {animal.pettedToday && <span className="social-chip done">Đã vuốt ve</span>}
                      {animal.hasProduct && <span className="social-chip ready">Có sản phẩm</span>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="modal-footer-center">
            <button id="btn-close-animals" className="pixel-btn pixel-btn-primary" onClick={onClose}>
              <X size={18} />
              <span>Đóng Sổ Tay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. BÁO CÁO TỔNG KẾT NGÀY MỚI (DAILY REPORT MODAL)
  if (activeModal === 'daily_report') {
    const report = (modalPayload as DailyReport) || gameStore.lastDailyReport;
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window pixel-wood-panel daily-report-modal" id="modal-daily-report" onClick={(e) => e.stopPropagation()}>
          <div className="report-banner">
            <Sun size={32} className="sun-spin" />
            <h2>Bình Minh Ngày Mới Đã Lên!</h2>
            <p>
              Chào đón <strong>Ngày {state.day} — Mùa {state.season} (Năm {state.year})</strong>
            </p>
          </div>

          <div className="report-summary-grid">
            <div className="report-stat-box">
              <span>Thời tiết hôm nay</span>
              <strong>{state.weather}</strong>
              <small>
                {state.weather === 'Mưa Rào'
                  ? 'Cơn mưa đầu ngày đã tưới mát toàn bộ ruộng vườn của bạn!'
                  : 'Tiết trời tuyệt đẹp để chăm sóc nông trại và dạo quanh làng.'}
              </small>
            </div>
            <div className="report-stat-box">
              <span>Nông sản đã bán hôm qua</span>
              <strong>{report?.cropsSoldCount || 0} sản phẩm</strong>
            </div>
            <div className="report-stat-box">
              <span>Doanh thu hôm qua</span>
              <strong className="gold-text">+{report?.goldEarnedToday || 0} Vàng</strong>
            </div>
            <div className="report-stat-box">
              <span>Thể lực hiện tại</span>
              <strong className="energy-text">100 / 100 (Đã hồi phục 100%)</strong>
            </div>
          </div>

          <div className="modal-footer-center">
            <button id="btn-start-new-day" className="pixel-btn pixel-btn-primary btn-large" onClick={onClose}>
              <Sparkles size={20} />
              <span>Bắt Đầu Ngày Mới</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. CẨM NANG HƯỚNG DẪN CHƠI (GUIDE MODAL)
  if (activeModal === 'guide') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window pixel-wood-panel" id="modal-guide" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>📖 Cẩm Nang Nông Trại Mộng Mơ</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="guide-grid">
            <div className="guide-section">
              <h3>🌱 1. Quy Trình Trồng Trọt</h3>
              <ul>
                <li>Chọn <strong>Cuốc Đất</strong> (Phím 1) và nhấn vào ô đất cỏ để xới đất.</li>
                <li>Chọn <strong>Hạt Giống</strong> (Phím 6, 7...) và nhấn vào ô đất để gieo hạt.</li>
                <li>Chọn <strong>Bình Tưới Nước</strong> (Phím 2) để tưới ẩm đất mỗi ngày.</li>
                <li>Nhấn <strong>Qua ngày mới</strong> hoặc vào Ngôi Nhà Gỗ nghỉ ngơi để cây lớn lên. Khi hiện nhãn <strong>✨ Chín</strong>, nhấn vào cây để thu hoạch!</li>
              </ul>
            </div>

            <div className="guide-section">
              <h3>🐔 2. Chăn Nuôi & Câu Cá</h3>
              <ul>
                <li>Ghé <strong>Chuồng Trại</strong> phía Tây Bắc mỗi ngày để nhặt <strong>Trứng Gà</strong> và vắt <strong>Sữa Bò</strong>.</li>
                <li>Mua <strong>Cỏ Khô Chăn Nuôi</strong> tại cửa hàng để cho vật nuôi ăn.</li>
                <li>Ra <strong>Cầu Gỗ Hồ Gương</strong> phía Tây Nam để thả câu bắt Cá Chép Vảy Rồng quý hiếm.</li>
              </ul>
            </div>

            <div className="guide-section">
              <h3>💰 3. Giao Thương & Nâng Cấp</h3>
              <ul>
                <li>Đứng cạnh <strong>Thùng Giao Hàng</strong> hoặc mở <strong>Cửa Hàng Nông Sản</strong> để bán nông sản lấy Vàng.</li>
                <li>Gặp <strong>Chú Bảy Thợ Rèn</strong> trong Cửa Hàng để nâng cấp nông cụ lên Đồng, Bạc và Ho��ng Kim.</li>
              </ul>
            </div>

            <div className="guide-section">
              <h3>🎮 4. Điều Khiển Linh Hoạt</h3>
              <ul>
                <li><strong>Bàn phím:</strong> Di chuyển bằng <code>WASD</code> hoặc <code>Phím Mũi Tên</code>. Thao tác bằng <code>Space</code> hoặc <code>E</code>. Chọn nhanh công cụ bằng phím <code>1 - 9</code>.</li>
                <li><strong>Chuột & Cảm ứng:</strong> Nhấp trực tiếp vào ô ruộng, vật nuôi, cửa hàng hoặc dùng cụm phím điều hướng ảo trên màn hình.</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer-center">
            <button className="pixel-btn pixel-btn-primary" onClick={onClose}>
              Đã Hiểu — Quay Lại Nông Trại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 9. CÀI ĐẶT, ÂM THANH & LƯU GAME (SETTINGS MODAL)
  if (activeModal === 'settings') {
    const { settings } = state;
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window pixel-wood-panel" id="modal-settings" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⚙️ Cài Đặt & Quản Lý Tiến Trình</h2>
            <button id="btn-close-modal" className="pixel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="settings-list">
            <div className="setting-row">
              <div>
                <h4>Âm thanh tổng thể</h4>
                <p>Bật hoặc tắt toàn bộ nhạc nền và hiệu ứng âm thanh.</p>
              </div>
              <button
                id="btn-toggle-mute"
                className={`pixel-btn ${settings.muted ? 'pixel-btn-wood' : 'pixel-btn-primary'}`}
                onClick={() => gameStore.updateSettings({ muted: !settings.muted })}
              >
                {settings.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{settings.muted ? 'Đang Tắt Tiếng' : 'Đang Bật Tiếng'}</span>
              </button>
            </div>

            <div className="setting-row">
              <div>
                <h4>Âm lượng Nhạc nền ({Math.round(settings.bgmVolume * 100)}%)</h4>
                <p>Giai điệu đồng quê thư giãn.</p>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bgmVolume}
                onChange={(e) => gameStore.updateSettings({ bgmVolume: parseFloat(e.target.value) })}
              />
            </div>

            <div className="setting-row">
              <div>
                <h4>Âm lượng Hiệu ứng ({Math.round(settings.sfxVolume * 100)}%)</h4>
                <p>Tiếng cuốc đất, tưới nước, thu hoạch và tiền vàng.</p>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => gameStore.updateSettings({ sfxVolume: parseFloat(e.target.value) })}
              />
            </div>

            <div className="setting-row">
              <div>
                <h4>Hiển thị khung ô đất mục tiêu</h4>
                <p>Đánh dấu ô đất trước mặt nhân vật để dễ canh vị trí.</p>
              </div>
              <button
                className={`pixel-btn ${settings.showGridHint ? 'pixel-btn-primary' : 'pixel-btn-wood'}`}
                onClick={() => gameStore.updateSettings({ showGridHint: !settings.showGridHint })}
              >
                {settings.showGridHint ? 'Đang Bật' : 'Đang Tắt'}
              </button>
            </div>

            <div className="setting-row">
              <div>
                <h4>Bàn phím ảo trên màn hình (Mobile D-Pad)</h4>
                <p>Chế độ hiển thị cụm nút di chuyển cảm ứng.</p>
              </div>
              <button
                id="btn-toggle-touch-controls"
                className="pixel-btn pixel-btn-secondary"
                onClick={() => {
                  const next =
                    settings.touchControls === 'auto'
                      ? 'always'
                      : settings.touchControls === 'always'
                        ? 'off'
                        : 'auto';
                  gameStore.updateSettings({ touchControls: next });
                }}
              >
                {settings.touchControls === 'auto'
                  ? 'Tự động (Mobile)'
                  : settings.touchControls === 'always'
                    ? 'Luôn hiển thị'
                    : 'Ẩn'}
              </button>
            </div>
          </div>

          <div className="settings-actions-footer">
            <button
              id="btn-modal-save"
              className="pixel-btn pixel-btn-primary"
              onClick={() => gameStore.saveGame(false)}
            >
              <Save size={18} />
              <span>Lưu tiến trình ngay</span>
            </button>

            <button
              id="btn-open-guide-from-settings"
              className="pixel-btn pixel-btn-secondary"
              onClick={() => gameStore.requestModal('guide')}
            >
              <span>📖 Cẩm Nang Nông Trại</span>
            </button>

            <button
              id="btn-return-title"
              className="pixel-btn pixel-btn-wood"
              onClick={() => {
                gameStore.saveGame(true);
                onClose();
                onReturnToTitle();
              }}
            >
              <span>Về Màn Hình Chính</span>
            </button>

            {!confirmReset ? (
              <button
                id="btn-init-reset"
                className="pixel-btn pixel-btn-danger"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw size={18} />
                <span>Khởi tạo lại nông trại</span>
              </button>
            ) : (
              <button
                id="btn-confirm-reset"
                className="pixel-btn pixel-btn-danger"
                onClick={() => {
                  gameStore.resetNewGame();
                  setConfirmReset(false);
                  onClose();
                }}
              >
                <span>Xác nhận xoá & Chơi mới!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
