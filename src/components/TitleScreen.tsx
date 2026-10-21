import React from 'react';
import { Play, RotateCcw, Sparkles, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { PixelIcon } from './PixelIcon';
import { soundManager } from '../utils/sound';

interface TitleScreenProps {
  hasSave: boolean;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSave,
  onStartNewGame,
  onContinueGame,
  onOpenGuide
}) => {
  const [muted, setMuted] = React.useState(soundManager.muted);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    soundManager.updateSettings(soundManager.bgmVolume, soundManager.sfxVolume, next);
  };

  return (
    <div className="title-screen-overlay" id="title-screen">
      {/* Bầu trời & cảnh quan Pixel Art trang trí sống động */}
      <div className="title-sky-decor">
        <div className="pixel-cloud cloud-1" />
        <div className="pixel-cloud cloud-2" />
        <div className="pixel-cloud cloud-3" />
      </div>

      <button
        id="btn-title-mute"
        onClick={toggleSound}
        className="pixel-btn-icon top-right-sound"
        title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        <span>{muted ? 'Đang tắt tiếng' : 'Âm thanh: Bật'}</span>
      </button>

      <div className="title-card pixel-wood-panel">
        <div className="title-badge">
          <Sparkles size={16} />
          <span>PHIÊN BẢN HOÀN CHỈNH — THUNG LŨNG MÂY TRẮNG</span>
        </div>

        <h1 className="game-main-title">NÔNG TRẠI MỘNG MƠ</h1>
        <p className="game-subtitle">
          Gieo mầm hạnh phúc, chăm sóc mùa màng, câu cá bên Hồ Gương và xây dựng cuộc sống bình yên nơi miền quê Việt.
        </p>

        {/* Hàng biểu tượng Pixel Art minh họa sinh động */}
        <div className="title-icon-showcase">
          <div className="showcase-item">
            <PixelIcon iconKey="icon_crop_strawberry" size={42} />
            <span>Dâu Tây Mộng Mơ</span>
          </div>
          <div className="showcase-item">
            <PixelIcon iconKey="icon_crop_pumpkin" size={42} />
            <span>Bí Ngô Hoàng Kim</span>
          </div>
          <div className="showcase-item">
            <PixelIcon iconKey="icon_crop_sunflower" size={42} />
            <span>Hướng Dương Rực Rỡ</span>
          </div>
          <div className="showcase-item">
            <PixelIcon iconKey="icon_fish_golden" size={42} />
            <span>Cá Chép Vảy Rồng</span>
          </div>
        </div>

        <div className="title-actions">
          {hasSave && (
            <button
              id="btn-continue-game"
              className="pixel-btn pixel-btn-primary btn-large"
              onClick={onContinueGame}
            >
              <Play size={22} />
              <span>Tiếp tục hành trình</span>
            </button>
          )}

          <button
            id="btn-new-game"
            className={`pixel-btn ${hasSave ? 'pixel-btn-secondary' : 'pixel-btn-primary'} btn-large`}
            onClick={onStartNewGame}
          >
            {hasSave ? <RotateCcw size={20} /> : <Play size={22} />}
            <span>Bắt đầu cuộc sống mới</span>
          </button>

          <button
            id="btn-title-guide"
            className="pixel-btn pixel-btn-wood"
            onClick={onOpenGuide}
          >
            <BookOpen size={18} />
            <span>Cẩm nang & Hướng dẫn chơi</span>
          </button>
        </div>

        <div className="title-footer-info">
          <span>🎮 Điều khiển: WASD / Phím Mũi Tên / Chạm Trực Tiếp</span>
          <span>•</span>
          <span>💾 Tự động lưu tiến trình</span>
        </div>
      </div>
    </div>
  );
};
