---
name: pixel-art-farming-studio
description: "Specialized skill for crafting cozy 16-bit top-down pixel art farming games (Stardew Valley, Fields of Mistria, Story of Seasons style) with Vietnamese localization, crisp nearest-neighbor rendering, hue-shifted palettes, and tactile wooden parchment HUDs."
---

# Pixel Art Farming Studio Skill

## 1. Visual & Pixel Art Standards
- **Integer Scaling & Nearest-Neighbor**: Always enforce `image-rendering: pixelated; image-rendering: crisp-edges;` on both canvas and UI icons, and `pixelArt: true, roundPixels: true` in Phaser config.
- **16-Bit Hue-Shifted Color Ramps**:
  - Grass & Foliage: Shift shadows toward cool teal-green (`#1e4d2b`, `#2c6b36`) and highlights toward warm sunlit lime-yellow (`#68b849`, `#95db61`).
  - Soil & Farmland: Warm terracotta/ochre highlights (`#b57c4a`) and deep umber shadows (`#4a2a14`) for dry tilled soil; rich dark chocolate (`#2b1608`, `#3d200d`) with specular moisture dots for watered soil.
  - Wood & Architecture: Cozy amber-oak planks (`#9c5d32`, `#78421e`, `#4d270e`) with warm Terracotta or Bamboo-Thatch roofs.
  - Water: Animated 2-frame ripple highlights (`#2994c4`, `#42b2e3`, `#8ce3ff`) with shoreline foam borders.
- **Sprite Readability & Silhouettes**:
  - Every character, animal, tool, and crop stage must have a dark selective outline (`#1f1209` or `#182414`) and a subtle ground drop shadow so sprites pop cleanly against grass and soil tiles.
  - Multi-stage crop growth: Stage 0 (Seeds), Stage 1 (Sprout), Stage 2 (Leafy Stem/Buds), Stage 3 (Lush Ripe Harvest with golden sparkle indicator).

## 2. Vietnamese UI & Typography
- **Font Pairing**: Use `Be Vietnam Pro` or `Plus Jakarta Sans` with full Vietnamese diacritic support (`ă, â, đ, ê, ô, ơ, ư` and all 5 tone marks). Never use bitmap fonts that drop or misalign Vietnamese accents.
- **Tactile Wooden & Parchment Chrome**:
  - Frame HUD and modals with multi-layered pixel-bevel borders (`border: 4px solid #261409`, inner highlight `#ad6a3e`, parchment body `#fcf3de`).
  - Provide instant visual feedback on hover/press (`transform: translateY`, warm highlight glow, crisp audio SFX).

## 3. Core Gameplay Loop & QA Verification
- **Zero-Dead-End Economy**: Ensure players always have access to free stamina recovery or forage/fishing income, clear tool selection feedback, and one-click shipping/selling.
- **Interactive Clarity**: Highlight target tiles in front of the player, show floating harvest/gold text popups, and support both keyboard (`WASD`/Arrows + `1-9` + `Space`/`E`) and direct mouse/touch interaction.
