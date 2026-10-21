import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FarmScene } from './game/FarmScene';
import { gameStore } from './state/gameStore';
import { soundManager } from './utils/sound';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { GameModals } from './components/GameModals';

interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'gold';
}

export function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  const [inTitleScreen, setInTitleScreen] = useState(true);
  const [hasSave, setHasSave] = useState(() => gameStore.hasSaveFile());
  const [gameState, setGameState] = useState(() => gameStore.getState());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<unknown>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubState = gameStore.subscribe(() => {
      setGameState({ ...gameStore.getState() });
      setHasSave(gameStore.hasSaveFile());
    });

    const unsubToast = gameStore.onToast((message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    });

    const unsubModal = gameStore.onModalRequest((modal, payload) => {
      setActiveModal(modal);
      setModalPayload(payload);
    });

    return () => {
      unsubState();
      unsubToast();
      unsubModal();
    };
  }, []);

  useEffect(() => {
    if (!gameContainerRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: gameContainerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      backgroundColor: '#5ca844',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [FarmScene]
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const handleStartNewGame = () => {
    soundManager.startBgm();
    gameStore.resetNewGame();
    const scene = (window as unknown as { __FARM_SCENE__?: FarmScene }).__FARM_SCENE__;
    if (scene) {
      scene.syncPlotsAndCrops();
      scene.syncAnimals();
    }
    setInTitleScreen(false);
  };

  const handleContinueGame = () => {
    soundManager.startBgm();
    gameStore.loadGame();
    const scene = (window as unknown as { __FARM_SCENE__?: FarmScene }).__FARM_SCENE__;
    if (scene) {
      scene.syncPlotsAndCrops();
      scene.syncAnimals();
    }
    setInTitleScreen(false);
  };

  return (
    <div className="app-shell">
      {/* Khung Canvas Phaser 3 */}
      <div ref={gameContainerRef} className="phaser-viewport" id="phaser-viewport" />

      {/* Hệ thống thông báo nổi (Toasts) */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pixel-toast toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Màn hình Mở đầu hoặc Giao diện HUD trong game */}
      {inTitleScreen ? (
        <TitleScreen
          hasSave={hasSave}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenGuide={() => setActiveModal('guide')}
        />
      ) : (
        <HUD state={gameState} onOpenModal={(m) => setActiveModal(m)} />
      )}

      {/* Các hộp thoại tương tác (Túi đồ, Cửa hàng, Nhiệm vụ, NPC, Cẩm nang, Cài đặt) */}
      <GameModals
        activeModal={activeModal}
        modalPayload={modalPayload}
        state={gameState}
        onClose={() => setActiveModal(null)}
        onReturnToTitle={() => {
          setHasSave(gameStore.hasSaveFile());
          setInTitleScreen(true);
        }}
      />
    </div>
  );
}

export default App;
