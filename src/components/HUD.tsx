import React, { useState, useEffect } from 'react';
import type { GameState } from '../types/game';
import { ITEMS } from '../data/gameData';
import { gameStore } from '../state/gameStore';
import { PixelIcon } from './PixelIcon';
import { soundManager } from '../utils/sound';
import type { FarmScene } from '../game/FarmScene';

interface HUDProps {
  state: GameState;
  activeModal?: string | null;
  onOpenModal: (modal: string | null) => void;
}

export const HUD: React.FC<HUDProps> = ({ state, activeModal = null, onOpenModal }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 900;
      setIsTouchDevice(hasCoarsePointer);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const hours = Math.floor(state.timeMinutes / 60);
  const mins = state.timeMinutes % 60;
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  const energyPct = Math.max(0, Math.min(100, Math.round((state.energy / state.maxEnergy) * 100)));
  const selectedItem = gameStore.getSelectedItem();

  const readyQuestsCount = state.quests.filter((q) => q.completed && !q.claimed).length;
  const activeQuestsCount = state.quests.filter((q) => !q.claimed).length;

  const setJoystick = (dx: number, dy: number) => {
    const scene = (window as unknown as { __FARM_SCENE__?: FarmScene }).__FARM_SCENE__;
    if (scene) {
      scene.virtualJoystick = { dx, dy };
    }
  };

  const triggerPrimaryAction = () => {
    const scene = (window as unknown as { __FARM_SCENE__?: FarmScene }).__FARM_SCENE__;
    if (scene) {
      scene.performPrimaryAction();
    }
  };

  const seasonIconKey =
    state.season === 'Xuân'
      ? 'ui_spring'
      : state.season === 'Hạ'
        ? 'ui_summer'
        : state.season === 'Thu'
          ? 'ui_autumn'
          : 'ui_winter';

  const showVirtualControls =
    state.settings.touchControls === 'always' ||
    (state.settings.touchControls as string) === 'on' ||
    (state.settings.touchControls === 'auto' && isTouchDevice);

  return (
    <div className="hud-layer" aria-label="Giao diện điều khiển nông trại">
      {/* Thanh trên tối giản: Trái = Trạng thái Mùa/Giờ/Thể lực/Vàng | Phải = Cụm 6 nút Icon nhỏ gọn */}
      <header className="hud-top-bar">
        <div className="hud-status-pill wood-panel">
          <div className="hud-chip" title={`Mùa ${state.season} - Ngày ${state.day} Năm ${state.year}`}>
            <PixelIcon iconKey={seasonIconKey} size={18} />
            <span className="hud-chip-strong">
              {state.season} • Ng.{state.day}
            </span>
          </div>

          <span className="hud-divider" />

          <div className="hud-chip" title={`Thời tiết: ${state.weather}`}>
            <PixelIcon iconKey={state.weather === 'Mưa Rào' ? 'ui_rain' : 'ui_sun'} size={18} />
            <span className="hud-clock-text">{formattedTime}</span>
          </div>

          <span className="hud-divider" />

          <div className="hud-chip hud-energy-chip" title={`Thể lực: ${state.energy}/${state.maxEnergy}`}>
            <PixelIcon iconKey="ui_energy" size={16} />
            <div className="energy-bar-track">
              <div
                className="energy-bar-fill"
                style={{
                  width: `${energyPct}%`,
                  background:
                    energyPct > 50
                      ? 'linear-gradient(90deg, #43a047, #9ccc65)'
                      : energyPct > 25
                        ? 'linear-gradient(90deg, #fb8c00, #ffd54f)'
                        : 'linear-gradient(90deg, #d32f2f, #ff5252)'
                }}
              />
            </div>
            <span className="hud-energy-num">{state.energy}</span>
          </div>

          <span className="hud-divider" />

          <div className="hud-chip hud-gold-chip" title="Vàng hiện có">
            <PixelIcon iconKey="ui_coin" size={18} />
            <span className="gold-amount">{state.gold.toLocaleString('vi-VN')}G</span>
          </div>
        </div>

        {/* Cụm nút chức năng dạng Icon vuông gọn gàng ở góc trên-phải */}
        <nav className="hud-icon-cluster" aria-label="Menu chức năng">
          <button
            id="btn-open-inventory"
            type="button"
            title="Túi Đồ & Chế biến (24 ô)"
            aria-label="Túi Đồ"
            className={`hud-icon-btn ${activeModal === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playSfx('click');
              onOpenModal(activeModal === 'inventory' ? null : 'inventory');
            }}
          >
            <PixelIcon iconKey="ui_bag" size={20} />
            <span className="hud-icon-label">Túi đồ</span>
          </button>

          <button
            id="btn-open-quests"
            type="button"
            title="Nhiệm vụ Làng Mây"
            aria-label="Nhiệm Vụ"
            className={`hud-icon-btn ${activeModal === 'quests' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playSfx('click');
              onOpenModal(activeModal === 'quests' ? null : 'quests');
            }}
          >
            <PixelIcon iconKey="ui_quest" size={20} />
            <span className="hud-icon-label">Nhiệm vụ</span>
            {(readyQuestsCount > 0 || activeQuestsCount > 0) && (
              <span className={`hud-badge ${readyQuestsCount > 0 ? 'ready' : 'normal'}`}>
                {readyQuestsCount > 0 ? `!` : activeQuestsCount}
              </span>
            )}
          </button>

          <button
            id="btn-open-shop"
            type="button"
            title="Cửa Hàng Hạt Giống & Lò Rèn"
            aria-label="Cửa Hàng"
            className={`hud-icon-btn ${activeModal === 'shop' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playSfx('shop');
              onOpenModal(activeModal === 'shop' ? null : 'shop');
            }}
          >
            <PixelIcon iconKey="ui_shop" size={20} />
            <span className="hud-icon-label">Cửa hàng</span>
          </button>

          <button
            id="btn-open-social"
            type="button"
            title="Sổ Tay Dân Làng & Vật Nuôi"
            aria-label="Dân Làng"
            className={`hud-icon-btn ${activeModal === 'social' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playSfx('click');
              onOpenModal(activeModal === 'social' ? null : 'social');
            }}
          >
            <PixelIcon iconKey="ui_heart" size={20} />
            <span className="hud-icon-label">Dân làng</span>
          </button>

          <button
            id="btn-sleep-day"
            type="button"
            title="Nghỉ ngơi qua ngày mới"
            aria-label="Qua Ngày"
            className="hud-icon-btn sleep-btn"
            onClick={() => gameStore.sleepAndAdvanceDay()}
          >
            <PixelIcon iconKey="ui_bed" size={20} />
            <span className="hud-icon-label">Qua ngày</span>
          </button>

          <button
            id="btn-open-settings"
            type="button"
            title="Cài Đặt, Lưu Game & Hướng Dẫn"
            aria-label="Cài Đặt"
            className={`hud-icon-btn ${activeModal === 'settings' || activeModal === 'help' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playSfx('click');
              onOpenModal(activeModal === 'settings' ? null : 'settings');
            }}
          >
            <PixelIcon iconKey="ui_settings" size={20} />
          </button>
        </nav>
      </header>

      {/* Phím cảm ứng D-Pad chỉ hiển thị trên điện thoại hoặc khi bật thủ công */}
      {showVirtualControls && (
        <div className="touch-controls-row">
          <div className="dpad-cluster">
            <button
              type="button"
              className="dpad-btn up"
              onPointerDown={() => setJoystick(0, -1)}
              onPointerUp={() => setJoystick(0, 0)}
              onPointerLeave={() => setJoystick(0, 0)}
            >
              ▲
            </button>
            <button
              type="button"
              className="dpad-btn left"
              onPointerDown={() => setJoystick(-1, 0)}
              onPointerUp={() => setJoystick(0, 0)}
              onPointerLeave={() => setJoystick(0, 0)}
            >
              ◀
            </button>
            <button
              type="button"
              className="dpad-btn right"
              onPointerDown={() => setJoystick(1, 0)}
              onPointerUp={() => setJoystick(0, 0)}
              onPointerLeave={() => setJoystick(0, 0)}
            >
              ▶
            </button>
            <button
              type="button"
              className="dpad-btn down"
              onPointerDown={() => setJoystick(0, 1)}
              onPointerUp={() => setJoystick(0, 0)}
              onPointerLeave={() => setJoystick(0, 0)}
            >
              ▼
            </button>
          </div>

          <div className="action-cluster">
            {selectedItem?.def.category === 'food' && (
              <button type="button" className="touch-eat-btn" onClick={() => gameStore.eatSelectedItem()}>
                🍽️ Ăn (+{selectedItem.def.energyRestore})
              </button>
            )}
            <button
              id="btn-primary-action"
              type="button"
              className="touch-action-btn"
              onClick={triggerPrimaryAction}
            >
              ⚡ Thao Tác
            </button>
          </div>
        </div>
      )}

      {/* Thanh Hotbar 9 ô nhỏ gọn phía dưới + Nhãn 1 dòng tên công cụ đang chọn */}
      <footer className="hud-bottom-bar">
        {selectedItem && (
          <div className="selected-item-pill">
            <span className="selected-item-name">{selectedItem.def.name}</span>
            {selectedItem.def.category === 'food' && (
              <button
                type="button"
                className="inline-eat-btn"
                onClick={() => gameStore.eatSelectedItem()}
              >
                Ăn +{selectedItem.def.energyRestore}⚡
              </button>
            )}
          </div>
        )}

        <div className="hotbar-container wood-panel" role="toolbar" aria-label="Thanh công cụ nhanh">
          {state.inventory.slice(0, 9).map((slot, index) => {
            const item = slot ? ITEMS[slot.itemId] : null;
            const isSelected = state.selectedSlot === index;
            return (
              <button
                key={index}
                id={`hotbar-slot-${index + 1}`}
                type="button"
                className={`hotbar-slot ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  soundManager.playSfx('click');
                  gameStore.setSelectedSlot(index);
                }}
                title={item ? `${item.name} — ${item.description}` : `Ô trống ${index + 1}`}
              >
                <span className="slot-key">{index + 1}</span>
                {item && (
                  <>
                    <PixelIcon iconKey={item.iconKey} size={26} className="slot-pixel-icon" />
                    {slot && slot.quantity > 1 && <span className="slot-qty">{slot.quantity}</span>}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
