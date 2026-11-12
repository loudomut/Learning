/**
 * High-detail pixel-art canvas renderer for "Кошка Мышка: Побег от поцелуев"
 */

import { Player, Boss, GoldenFish, Platform, GreenCloud, Particle, SkyHand } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Clear and render background
  public renderBackground(cameraX: number, isBossArena: boolean) {
    const ctx = this.ctx;
    
    // Cozy wallpaper gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (!isBossArena) {
      wallGrad.addColorStop(0, '#fbf4ea');
      wallGrad.addColorStop(0.7, '#f5e4ce');
      wallGrad.addColorStop(1, '#e8cfb0');
    } else {
      // Warm evening living room lighting for boss arena
      wallGrad.addColorStop(0, '#f9edd8');
      wallGrad.addColorStop(0.7, '#ecd0b0');
      wallGrad.addColorStop(1, '#dbba96');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Wooden baseboard
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, this.height - 110, this.width, 14);
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, this.height - 110, this.width, 3);

    // Parquet wooden floor
    const floorGrad = ctx.createLinearGradient(0, this.height - 96, 0, this.height);
    floorGrad.addColorStop(0, '#b8860b');
    floorGrad.addColorStop(0.5, '#996515');
    floorGrad.addColorStop(1, '#7a500e');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, this.height - 96, this.width, 96);

    // Parquet plank grid lines
    ctx.strokeStyle = '#5c3d0b';
    ctx.lineWidth = 1.5;
    const plankWidth = 50;
    const plankOffset = -(cameraX * 0.8) % plankWidth;
    for (let x = plankOffset; x < this.width + plankWidth; x += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(x, this.height - 96);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    // Horizontal wood lines
    ctx.beginPath();
    ctx.moveTo(0, this.height - 64);
    ctx.lineTo(this.width, this.height - 64);
    ctx.moveTo(0, this.height - 32);
    ctx.lineTo(this.width, this.height - 32);
    ctx.stroke();

    // Wall decorations (cat photos, clock, paintings) with parallax
    this.renderWallDecorations(cameraX, isBossArena);
  }

  private renderWallDecorations(cameraX: number, isBossArena: boolean) {
    const ctx = this.ctx;
    const decorPositions = isBossArena
      ? [200, 500, 800, 1100]
      : [180, 480, 820, 1200, 1600, 2000, 2400];

    decorPositions.forEach((worldX, i) => {
      const screenX = worldX - cameraX * 0.3;
      if (screenX < -150 || screenX > this.width + 150) return;

      const y = 80 + (i % 3) * 20;

      if (i % 3 === 0) {
        // Framed photo of Myshka (One-eyed cat portrait on the wall!)
        ctx.fillStyle = '#6d4c41'; // Wooden frame
        ctx.fillRect(screenX, y, 64, 52);
        ctx.fillStyle = '#faebd7'; // Photo matte
        ctx.fillRect(screenX + 4, y + 4, 56, 44);
        
        // Mini pixel portrait of Myshka inside frame
        ctx.fillStyle = '#828894'; // Grey cat
        ctx.fillRect(screenX + 24, y + 24, 18, 14);
        // Ears
        ctx.beginPath();
        ctx.moveTo(screenX + 24, y + 24);
        ctx.lineTo(screenX + 20, y + 15);
        ctx.lineTo(screenX + 29, y + 24);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screenX + 33, y + 24);
        ctx.lineTo(screenX + 42, y + 15);
        ctx.lineTo(screenX + 38, y + 24);
        ctx.fill();
        // Emerald left eye
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX + 27, y + 28, 4, 3);
        // Right eye is absent/closed line!
        ctx.fillStyle = '#374151';
        ctx.fillRect(screenX + 34, y + 29, 4, 1);
        // Tiny cute pink nose
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(screenX + 31, y + 33, 2, 2);

        // Frame string
        ctx.strokeStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(screenX + 32, y);
        ctx.lineTo(screenX + 32, y - 10);
        ctx.stroke();

      } else if (i % 3 === 1) {
        // Wall clock (cat tail pendulum clock!)
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(screenX + 20, y + 20, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX + 20, y + 20, 16, 0, Math.PI * 2);
        ctx.fill();
        // Clock hands
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX + 20, y + 20);
        ctx.lineTo(screenX + 20, y + 10);
        ctx.moveTo(screenX + 20, y + 20);
        ctx.lineTo(screenX + 28, y + 20);
        ctx.stroke();
      } else {
        // Shelf with small potted plant
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(screenX - 10, y + 40, 70, 8);
        // Terracotta pot
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX + 15, y + 22, 18, 18);
        // Green leaves
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(screenX + 24, y + 16, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Render cozy carpets/rugs on the floor
  public renderRugs(cameraX: number) {
    const ctx = this.ctx;
    const rugPositions = [
      { x: 300, w: 220, color1: '#dc2626', color2: '#fbbf24' },
      { x: 950, w: 280, color1: '#2563eb', color2: '#93c5fd' },
      { x: 1750, w: 240, color1: '#059669', color2: '#a7f3d0' },
      { x: 2600, w: 320, color1: '#7c3aed', color2: '#ddd6fe' },
    ];

    rugPositions.forEach(rug => {
      const rx = rug.x - cameraX;
      if (rx + rug.w < -50 || rx > this.width + 50) return;

      const ry = this.height - 96;
      ctx.fillStyle = rug.color1;
      ctx.fillRect(rx, ry, rug.w, 14);

      // Pattern / fringes
      ctx.fillStyle = rug.color2;
      for (let fx = rx + 8; fx < rx + rug.w - 8; fx += 16) {
        ctx.fillRect(fx, ry + 2, 8, 10);
      }
      // White fringe on sides
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(rx - 4, ry + 1, 4, 12);
      ctx.fillRect(rx + rug.w, ry + 1, 4, 12);
    });
  }

  // Render furniture platforms and obstacles
  public renderPlatform(plat: Platform, cameraX: number) {
    const ctx = this.ctx;
    const px = plat.x - cameraX;
    const py = plat.y;
    const pw = plat.width;
    const ph = plat.height;

    if (px + pw < -100 || px > this.width + 100) return;

    if (plat.type === 'table') {
      // Dining / work table - Myshka can crawl under!
      ctx.fillStyle = '#92400e'; // Table top
      ctx.fillRect(px, py, pw, 14);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px, py, pw, 4);

      // Hanging decorative tablecloth / cloth edge
      ctx.fillStyle = '#fef3c7';
      for (let cx = px + 6; cx < px + pw - 6; cx += 14) {
        ctx.beginPath();
        ctx.arc(cx, py + 14, 6, 0, Math.PI);
        ctx.fill();
      }

      // Table legs
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 10, py + 14, 10, ph - 14);
      ctx.fillRect(px + pw - 20, py + 14, 10, ph - 14);

      // Under-table clearance guide label for player if crawling
      if (plat.canCrawlUnder) {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.font = '8px monospace';
        ctx.fillText('▼ ПОЛЗТИ ЗДЕСЬ (S) ▼', px + pw / 2 - 50, py + ph - 8);
      }

    } else if (plat.type === 'bed') {
      // Cozy bed with hanging blanket (crawler zone!)
      ctx.fillStyle = '#5b21b6'; // Purple blanket
      ctx.fillRect(px, py, pw, 18);
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(px, py, pw, 5);

      // Pillows
      ctx.fillStyle = '#ede9fe';
      ctx.beginPath();
      ctx.ellipse(px + 28, py - 4, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bed wooden frame and legs
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(px, py + 18, pw, 10);
      ctx.fillRect(px + 4, py + 28, 12, ph - 28);
      ctx.fillRect(px + pw - 16, py + 28, 12, ph - 28);

      // Cozy dark space underneath
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(px + 16, py + 28, pw - 32, ph - 28);

    } else if (plat.type === 'cabinet' || plat.type === 'nightstand') {
      // Wooden drawers / cabinet
      ctx.fillStyle = '#a16207';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);

      // Drawers lines & handles
      const numDrawers = ph > 90 ? 3 : 2;
      const dHeight = (ph - 12) / numDrawers;
      for (let d = 0; d < numDrawers; d++) {
        const dy = py + 6 + d * dHeight;
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 6, dy, pw - 12, dHeight - 4);
        // Brass knob
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(px + pw / 2, dy + dHeight / 2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // If it's a nightstand, add small lamp on top
      if (plat.type === 'nightstand' && ph < 80) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(px + pw / 2 - 12, py - 18);
        ctx.lineTo(px + pw / 2 + 12, py - 18);
        ctx.lineTo(px + pw / 2 + 16, py - 6);
        ctx.lineTo(px + pw / 2 - 16, py - 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillRect(px + pw / 2 - 2, py - 6, 4, 6);
      }

    } else if (plat.type === 'fridge') {
      // Big retro silver-white refrigerator!
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8);

      // Freezer division line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py + ph * 0.35);
      ctx.lineTo(px + pw, py + ph * 0.35);
      ctx.stroke();

      // Handles
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + 6, py + ph * 0.2, 4, 18);
      ctx.fillRect(px + 6, py + ph * 0.42, 4, 26);

      // Cute magnets on fridge (Cat paw magnet, fish magnet, memo notes)
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(px + pw - 18, py + 22, 6, 0, Math.PI * 2);
      ctx.fill(); // Heart magnet
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 18, py + ph * 0.5, 18, 18); // Sticky note

    } else if (plat.type === 'chair') {
      // Chair with cushion
      ctx.fillStyle = '#f87171'; // Red cushion
      ctx.fillRect(px, py, pw, 10);
      ctx.fillStyle = '#78350f'; // Legs
      ctx.fillRect(px + 4, py + 10, 6, ph - 10);
      ctx.fillRect(px + pw - 10, py + 10, 6, ph - 10);
      // Chair backrest
      ctx.fillRect(px + pw - 8, py - 28, 6, 28);
      ctx.fillRect(px, py - 26, pw, 6);

    } else {
      // Wooden shelf
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px, py, pw, 3);
      // Shelf brackets
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + 8, py + ph, 8, 10);
      ctx.fillRect(px + pw - 16, py + ph, 8, 10);
    }
  }

  // Render Myshka (The one-eyed grey striped cat - Highly detailed!)
  public renderMyshka(player: Player, cameraX: number) {
    const ctx = this.ctx;
    const px = Math.floor(player.x - cameraX);
    const py = Math.floor(player.y);
    const facing = player.facing;
    const isCrouching = player.isCrouching || player.isCrawling;

    // Invulnerability blinking flash
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(px + player.width / 2, py + player.height / 2);
    ctx.scale(facing, 1);

    const time = Date.now() * 0.005;

    if (player.isCaughtByBoss) {
      // Myshka squished comically while being kissed!
      ctx.rotate(Math.sin(time * 6) * 0.2);

      // Body squished vertically, wider horizontally
      ctx.fillStyle = '#788190'; // Tabby grey
      ctx.fillRect(-18, -10, 36, 20);

      // Grey stripes
      ctx.fillStyle = '#3f4551';
      ctx.fillRect(-10, -10, 4, 20);
      ctx.fillRect(0, -10, 4, 20);
      ctx.fillRect(10, -10, 4, 20);

      // Head
      ctx.fillStyle = '#828894';
      ctx.fillRect(10, -16, 18, 18);
      // Ears
      ctx.fillStyle = '#666e7d';
      ctx.beginPath();
      ctx.moveTo(14, -16);
      ctx.lineTo(12, -26);
      ctx.lineTo(20, -16);
      ctx.fill();

      // Emerald left eye (spinning spiral or dizzy)
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(20, -10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, -10, 2, 0, Math.PI * 1.5);
      ctx.stroke();

      // Right eye: NO EYE! Stitched cute closed line
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(13, -10);
      ctx.lineTo(17, -8);
      ctx.lineTo(13, -6);
      ctx.stroke();

      // GIANT RED LIPSTICK KISS MARK on forehead/cheek!
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.ellipse(18, -5, 6, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(19, -2, 5, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    if (isCrouching) {
      // ----------------------------------------------------
      // CROUCHING / CRAWLING ANIMATION (Stealth Cat Loaf/Sneak)
      // Flat body sneaking under low furniture!
      // ----------------------------------------------------
      const sneakWalk = Math.sin(time * 3);

      // Low elongated body
      ctx.fillStyle = '#828894'; // Grey coat
      ctx.fillRect(-18, 0, 36, 14);

      // Soft light tummy underneath
      ctx.fillStyle = '#b2b8c2';
      ctx.fillRect(-14, 8, 28, 6);

      // Dark grey tabby stripes on back
      ctx.fillStyle = '#424854';
      ctx.fillRect(-12, 0, 3, 9);
      ctx.fillRect(-5, 0, 3, 9);
      ctx.fillRect(2, 0, 3, 9);
      ctx.fillRect(9, 0, 3, 9);

      // Paws creeping flat forward and back
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(10 + sneakWalk * 3, 10, 8, 5); // Front paw
      ctx.fillRect(-16 - sneakWalk * 3, 10, 8, 5); // Back paw
      // Pink toe beans!
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(16 + sneakWalk * 3, 13, 2, 2);

      // Head pushed low forward
      ctx.fillStyle = '#828894';
      ctx.fillRect(14, -2, 16, 14);

      // Flattened stealth ears (airplane ears!)
      ctx.fillStyle = '#555d6b';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(6, -4);
      ctx.lineTo(16, 2);
      ctx.fill();
      // Inner pink
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(10, 0, 3, 2);

      // --- CRITICAL: EYES OF MYSHKA ---
      // LEFT EYE (Active, emerald green, focused forward!):
      ctx.fillStyle = '#2ecc71'; // Emerald
      ctx.fillRect(23, 2, 4, 3);
      ctx.fillStyle = '#064e3b'; // Pupil
      ctx.fillRect(25, 2, 1.5, 3);
      ctx.fillStyle = '#ffffff'; // White highlight shine
      ctx.fillRect(24, 2, 1, 1);

      // RIGHT EYE (NO EYE! Cute gentle closed lid / scar line):
      ctx.strokeStyle = '#2d333b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(18, 4);
      ctx.lineTo(21, 4);
      ctx.stroke();

      // Tiny pink nose and whiskers
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(28, 7, 2, 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(27, 7);
      ctx.lineTo(34, 6);
      ctx.moveTo(27, 8);
      ctx.lineTo(34, 10);
      ctx.stroke();

      // Tail trailing low behind with subtle wag
      const tailWag = Math.sin(time * 4) * 2;
      ctx.fillStyle = '#828894';
      ctx.fillRect(-26, 6 + tailWag, 10, 4);
      ctx.fillStyle = '#424854';
      ctx.fillRect(-22, 6 + tailWag, 2, 4);
      ctx.fillRect(-18, 6 + tailWag, 2, 4);

    } else {
      // ----------------------------------------------------
      // STANDING / RUNNING / JUMPING ANIMATION
      // ----------------------------------------------------
      const isRunning = Math.abs(player.vx) > 0.5 && player.isGrounded;
      const isJumping = !player.isGrounded;

      let runCycle = isRunning ? Math.sin(time * 8) : 0;
      let jumpStretch = isJumping ? (player.vy < 0 ? -3 : 2) : 0;

      // Cat Torso
      ctx.fillStyle = '#828894'; // Medium grey base coat
      ctx.fillRect(-14, -8 + jumpStretch, 28, 20);

      // Lighter belly
      ctx.fillStyle = '#b2b8c2';
      ctx.fillRect(-10, 4 + jumpStretch, 20, 8);

      // Distinctive dark tabby stripes
      ctx.fillStyle = '#424854';
      ctx.fillRect(-8, -8 + jumpStretch, 3, 14);
      ctx.fillRect(-1, -8 + jumpStretch, 3, 14);
      ctx.fillRect(6, -8 + jumpStretch, 3, 14);

      // Legs / Paws
      ctx.fillStyle = '#6b7280';
      if (isJumping) {
        // Paws extended in jump
        ctx.fillRect(8, 10, 6, 8);
        ctx.fillRect(-14, 10, 6, 8);
        // Pink toe beans!
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(10, 16, 3, 2);
        ctx.fillRect(-12, 16, 3, 2);
      } else if (isRunning) {
        // Galloping legs
        ctx.fillRect(6 + runCycle * 6, 8, 5, 12);
        ctx.fillRect(-10 - runCycle * 6, 8, 5, 12);
        ctx.fillRect(10 - runCycle * 6, 8, 5, 12);
        ctx.fillRect(-6 + runCycle * 6, 8, 5, 12);
      } else {
        // Idle standing paws
        ctx.fillRect(6, 10, 5, 10);
        ctx.fillRect(-10, 10, 5, 10);
        ctx.fillRect(12, 10, 5, 10);
        ctx.fillRect(-4, 10, 5, 10);
      }

      // Head
      ctx.fillStyle = '#828894';
      ctx.fillRect(8, -18 + jumpStretch, 18, 16);

      // Cute pointy cat ears
      ctx.fillStyle = '#555d6b';
      // Front ear
      ctx.beginPath();
      ctx.moveTo(18, -18 + jumpStretch);
      ctx.lineTo(24, -28 + jumpStretch);
      ctx.lineTo(26, -18 + jumpStretch);
      ctx.fill();
      // Back ear
      ctx.beginPath();
      ctx.moveTo(10, -18 + jumpStretch);
      ctx.lineTo(13, -26 + jumpStretch);
      ctx.lineTo(17, -18 + jumpStretch);
      ctx.fill();
      // Pink inside ears
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(20, -24 + jumpStretch, 3, 4);

      // --- CRITICAL: EYES OF MYSHKA ---
      // 1. LEFT EYE: Gorgeous emerald cat eye!
      const isBlinking = Math.sin(time * 0.8) > 0.95;
      if (!isBlinking) {
        ctx.fillStyle = '#2ecc71'; // Emerald green
        ctx.fillRect(18, -13 + jumpStretch, 5, 5);
        // Slit pupil
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(20, -13 + jumpStretch, 2, 5);
        // White glossy highlight reflection
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(19, -13 + jumpStretch, 1.5, 1.5);
      } else {
        // Blinking line
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(18, -11 + jumpStretch, 5, 1.5);
      }

      // 2. RIGHT EYE: NO EYE! Gentle, sweet closed eye mark / wink
      // Explicitly visible to show she has only one eye!
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(11, -11 + jumpStretch);
      ctx.lineTo(14, -10 + jumpStretch);
      ctx.lineTo(16, -11 + jumpStretch);
      ctx.stroke();

      // Tiny pink nose and whiskers
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(24, -8 + jumpStretch, 3, 2.5);

      // Whiskers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(25, -7 + jumpStretch);
      ctx.lineTo(33, -9 + jumpStretch);
      ctx.moveTo(25, -6 + jumpStretch);
      ctx.lineTo(33, -5 + jumpStretch);
      ctx.moveTo(25, -5 + jumpStretch);
      ctx.lineTo(32, -2 + jumpStretch);
      ctx.stroke();

      // Tail with dynamic curve & wagging
      const tailAngle = isRunning 
        ? Math.sin(time * 8) * 0.4 - 0.2
        : Math.sin(time * 3) * 0.25 - 0.4;
      
      ctx.save();
      ctx.translate(-14, -4 + jumpStretch);
      ctx.rotate(tailAngle);
      ctx.fillStyle = '#828894';
      ctx.fillRect(-16, -14, 6, 16);
      // Stripe rings on tail
      ctx.fillStyle = '#424854';
      ctx.fillRect(-16, -10, 6, 3);
      ctx.fillRect(-16, -4, 6, 3);
      ctx.restore();
    }

    ctx.restore();
  }

  // Render Boss 1 (Папа в трусах) & Boss 2 (Мама в длинной футболке)
  public renderBoss(boss: Boss, cameraX: number) {
    const ctx = this.ctx;
    const bx = Math.floor(boss.x - cameraX);
    const by = Math.floor(boss.y);
    const time = Date.now() * 0.005;

    // Red damage flash
    const isFlashing = boss.flashTimer > 0 && Math.floor(boss.flashTimer * 15) % 2 === 0;

    // If boss jumped off-screen, don't draw body, but render hands!
    if (boss.action !== 'JUMP_OFFSCREEN' && boss.action !== 'HANDS_ATTACK') {
      ctx.save();
      ctx.translate(bx + boss.width / 2, by + boss.height / 2);
      ctx.scale(boss.facing, 1);

      if (boss.type === 'DAD') {
        this.drawDad(ctx, boss, isFlashing, time);
      } else {
        this.drawMom(ctx, boss, isFlashing, time);
      }

      ctx.restore();

      // Floating overhead Boss HP bar & hearts
      if (boss.hp > 0) {
        const hpBarW = 76;
        const hpBarH = 9;
        const hpX = bx + (boss.width - hpBarW) / 2;
        const hpY = by - 26;

        // Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(hpX - 3, hpY - 3, hpBarW + 6, hpBarH + 6);

        // Fill
        const hpRatio = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = boss.type === 'DAD' ? '#f43f5e' : '#ec4899';
        ctx.fillRect(hpX, hpY, hpBarW * hpRatio, hpBarH);

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hpX - 3, hpY - 3, hpBarW + 6, hpBarH + 6);

        // Hearts text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`HP: ${boss.hp}/${boss.maxHp}`, hpX + 10, hpY + 7);
      }
    }

    // Render Sky Hands if during HANDS_ATTACK phase
    if (boss.action === 'HANDS_ATTACK' || boss.action === 'JUMP_OFFSCREEN') {
      this.renderSkyHands(boss, cameraX, time);
    }

    // Render Boss Dialogue Speech Bubble
    if (boss.speechText && boss.speechTimer > 0) {
      this.renderBossSpeechBubble(boss, cameraX);
    }
  }

  // Draw Boss 1: Папа (Big human in boxer shorts / underpants, chasing bent over)
  private drawDad(ctx: CanvasRenderingContext2D, boss: Boss, isFlashing: boolean, time: number) {
    const isBent = boss.action === 'CHASE_BENT';
    const isHurt = boss.action === 'HURT';

    // Skin tones
    const skinTone = isFlashing ? '#f87171' : isHurt ? '#86efac' : '#fbcfe8';
    const skinShadow = isFlashing ? '#dc2626' : isHurt ? '#4ade80' : '#f472b6';
    const hairColor = '#3b2f2f'; // Dark home hair
    const stubbleColor = '#4a3b32';

    // Legs with hair/stumble (giant legs!)
    const legOffset = Math.sin(time * 6) * 12;

    // Legs
    ctx.fillStyle = skinTone;
    ctx.fillRect(-25 + legOffset, 10, 20, 60); // Back leg
    ctx.fillRect(5 - legOffset, 10, 20, 60);  // Front leg

    // Feet / Home slippers (голубые домашние тапочки)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-32 + legOffset, 65, 30, 14);
    ctx.fillRect(-2 - legOffset, 65, 30, 14);

    // TRUSY (Boxer shorts with cute pink/red hearts!)
    ctx.fillStyle = '#ffffff'; // White boxer shorts
    ctx.fillRect(-32, -10, 64, 34);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(-32, -10, 64, 34);

    // Red hearts on boxers
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-20, 4, 3, 0, Math.PI * 2);
    ctx.arc(-14, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, 4, 3, 0, Math.PI * 2);
    ctx.arc(14, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Torso (Giant bare chest/belly)
    ctx.save();
    if (isBent) {
      // Bent over 45 degrees towards the cat!
      ctx.rotate(0.35);
      ctx.translate(10, -10);
    }

    ctx.fillStyle = skinTone;
    // Big round dad tummy & chest
    ctx.fillRect(-30, -70, 60, 65);
    // Subtle belly shadow
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(10, -25, 12, 0, Math.PI);
    ctx.fill();

    // Arms stretching forward to catch Myshka!
    const armWiggle = Math.sin(time * 10) * 8;
    ctx.fillStyle = skinTone;
    if (isHurt) {
      // Covering face/coughing
      ctx.fillRect(0, -60, 35, 16);
      ctx.fillRect(25, -75, 16, 25);
    } else {
      // Outstretched grabby dad hands!
      ctx.fillRect(10, -60, 55, 18);
      ctx.fillRect(10, -45 + armWiggle * 0.5, 50, 16);

      // Grabbing fingers
      ctx.fillStyle = skinShadow;
      ctx.fillRect(65, -62, 10, 6);
      ctx.fillRect(65, -54, 10, 6);
      ctx.fillRect(65, -46, 10, 6);
    }

    // Head
    ctx.fillStyle = skinTone;
    ctx.fillRect(12, -105, 36, 38);

    // Stubble / beard
    ctx.fillStyle = stubbleColor;
    ctx.fillRect(24, -85, 24, 16);

    // Mouth
    if (isHurt) {
      // Coughing mouth
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.arc(38, -78, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Loving kissy lips or wide smile
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.ellipse(42, -78, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes
    if (isHurt) {
      // Squeezed shut eyes
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, -94);
      ctx.lineTo(36, -91);
      ctx.lineTo(30, -88);
      ctx.stroke();
    } else {
      // Loving eyes with hearts or wide pupils looking at Myshka
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(32, -95, 6, 6);
      ctx.fillStyle = '#ef4444'; // Little heart reflection
      ctx.fillRect(34, -95, 2, 2);
    }

    // Messy home hair
    ctx.fillStyle = hairColor;
    ctx.fillRect(8, -112, 42, 14);
    // Tuft sticks out
    ctx.beginPath();
    ctx.moveTo(15, -112);
    ctx.lineTo(20, -124);
    ctx.lineTo(28, -112);
    ctx.fill();

    ctx.restore();
  }

  // Draw Boss 2: Мама (Cozy woman with brown hair, long t-shirt to knees, slightly chubby)
  private drawMom(ctx: CanvasRenderingContext2D, boss: Boss, isFlashing: boolean, time: number) {
    const isBent = boss.action === 'CHASE_BENT';
    const isHurt = boss.action === 'HURT';

    const skinTone = isFlashing ? '#f87171' : isHurt ? '#86efac' : '#fed7aa';
    const hairColor = '#5c3a21'; // Warm brown hair (коричневые волосы)
    const shirtColor = '#c4b5fd'; // Lavender oversized cozy t-shirt
    const shirtShadow = '#a78bfa';

    const legOffset = Math.sin(time * 7) * 10;

    // Bare legs underneath long t-shirt
    ctx.fillStyle = skinTone;
    ctx.fillRect(-22 + legOffset, 24, 18, 48);
    ctx.fillRect(4 - legOffset, 24, 18, 48);

    // Cozy fluffy home slippers (розовые мягкие тапочки-зайчики)
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-28 + legOffset, 64, 28, 14);
    ctx.fillRect(-2 - legOffset, 64, 28, 14);
    // Bunny ears on slippers!
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(-18 + legOffset, 58, 4, 6);
    ctx.fillRect(8 - legOffset, 58, 4, 6);

    // Torso with LONG T-SHIRT down to knees (slightly chubby, soft comfortable silhouette!)
    ctx.save();
    if (isBent) {
      ctx.rotate(0.3);
      ctx.translate(8, -8);
    }

    // T-shirt body reaching all the way down to knees
    ctx.fillStyle = shirtColor;
    // Rounder curves for the slightly chubby silhouette
    ctx.beginPath();
    ctx.ellipse(0, -25, 34, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom hem of t-shirt
    ctx.fillStyle = shirtShadow;
    ctx.fillRect(-32, 14, 64, 8);

    // Cute print on Mama's t-shirt (Cute cat face print!)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -45, 24, 16);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -40, 4, 3);
    ctx.fillRect(4, -40, 4, 3);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-2, -34, 4, 2);

    // Arms reaching out for giant loving hugs!
    const armWiggle = Math.sin(time * 8) * 6;
    ctx.fillStyle = skinTone;
    if (isHurt) {
      // Waving away the smelly green cloud
      ctx.fillRect(10, -55, 30, 14);
      ctx.fillRect(28, -75, 14, 28);
    } else {
      ctx.fillRect(12, -58, 52, 16);
      ctx.fillRect(12, -42 + armWiggle, 48, 15);
      // Soft loving hands
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(64, -60, 10, 14);
    }

    // Head
    ctx.fillStyle = skinTone;
    ctx.fillRect(14, -98, 32, 34);

    // Warm, loving smile or kissing mouth
    if (isHurt) {
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.arc(36, -74, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.ellipse(38, -74, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Big loving eyes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, -88, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(32, -88, 2, 2);

    // Soft blush on cheeks
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(36, -80, 5, 0, Math.PI * 2);
    ctx.fill();

    // Luxurious brown hair (flowing down past shoulders)
    ctx.fillStyle = hairColor;
    ctx.fillRect(8, -106, 40, 18); // Top
    ctx.fillRect(2, -100, 14, 45);  // Long flowing back hair
    // Front fringe / bangs
    ctx.fillRect(24, -102, 22, 10);

    ctx.restore();
  }

  // Render Giant Hands swooping from the ceiling!
  private renderSkyHands(boss: Boss, cameraX: number, time: number) {
    const ctx = this.ctx;

    boss.hands.forEach(hand => {
      const screenTargetX = hand.targetX - cameraX;

      // 1. WARNING TARGET ON THE FLOOR / CARPET
      // Circular pulsing red shadow alerting the player!
      const shadowRadius = 32 + Math.sin(time * 12) * 6;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.ellipse(screenTargetX, this.height - 96, shadowRadius, shadowRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing outer ring
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(screenTargetX, this.height - 96, shadowRadius + 8, (shadowRadius + 8) * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Warning text bubble
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('⚠ ЛОВИТ!', screenTargetX - 30, this.height - 110);

      // 2. GIANT ARM DROPPING FROM SKY
      const armX = hand.x - cameraX;
      const armY = hand.y;
      const isDad = boss.type === 'DAD';
      const skinColor = isDad ? '#fbcfe8' : '#fed7aa';

      // Massive arm from top of screen down to hand.y
      ctx.fillStyle = skinColor;
      ctx.fillRect(armX - 22, -100, 44, armY + 100);

      // Forearm muscle details
      ctx.fillStyle = isDad ? '#f472b6' : '#fdba74';
      ctx.fillRect(armX - 16, armY - 30, 8, 25);

      // GIANT HAND WITH GRABBING / CUDDLING FINGERS
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(armX, armY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Curved grabby fingers swooping down
      ctx.fillStyle = isDad ? '#f472b6' : '#fdba74';
      const fingerSpread = Math.sin(time * 8) * 6;
      ctx.fillRect(armX - 28, armY + 12, 12, 28 + fingerSpread);
      ctx.fillRect(armX - 12, armY + 16, 12, 34);
      ctx.fillRect(armX + 4, armY + 16, 12, 34);
      ctx.fillRect(armX + 18, armY + 12, 12, 28 - fingerSpread);

      // If Mom, add cute nail polish and gold bracelet!
      if (!isDad) {
        // Red nails
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(armX - 28, armY + 36, 12, 4);
        ctx.fillRect(armX - 12, armY + 46, 12, 4);
        ctx.fillRect(armX + 4, armY + 46, 12, 4);
        ctx.fillRect(armX + 18, armY + 36, 12, 4);

        // Gold bracelet on wrist
        ctx.fillStyle = '#facc15';
        ctx.fillRect(armX - 24, armY - 20, 48, 8);
      }
    });
  }

  // Render dialogue bubble for bosses
  private renderBossSpeechBubble(boss: Boss, cameraX: number) {
    const ctx = this.ctx;
    const bx = boss.x - cameraX + boss.width / 2;
    const by = Math.max(70, boss.y - 40);

    ctx.font = 'bold 13px sans-serif';
    const textWidth = ctx.measureText(boss.speechText).width;
    const bubbleWidth = textWidth + 24;
    const bubbleHeight = 32;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;

    // Rounded speech bubble
    ctx.beginPath();
    ctx.roundRect(bx - bubbleWidth / 2, by - bubbleHeight, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer tail
    ctx.beginPath();
    ctx.moveTo(bx - 6, by);
    ctx.lineTo(bx, by + 10);
    ctx.lineTo(bx + 6, by);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#0f172a';
    ctx.fillText(boss.speechText, bx - bubbleWidth / 2 + 12, by - 11);
  }

  // Render Golden Fishes (sparkling collectibles)
  public renderFish(fish: GoldenFish, cameraX: number) {
    if (fish.collected) return;
    const ctx = this.ctx;
    const fx = fish.x - cameraX;
    const fy = fish.y + Math.sin(Date.now() * 0.005 + fish.floatOffset) * 6;

    if (fx < -40 || fx > this.width + 40) return;

    ctx.save();
    ctx.translate(fx, fy);

    // Glowing halo
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    glow.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
    glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Golden fish body
    ctx.fillStyle = '#eab308'; // Rich Gold
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight shimmer
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-2, -2, 8, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, -8);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-18, 8);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(2, -12);
    ctx.lineTo(5, -7);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, -3, 2.5, 2.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -3, 1, 1);

    // Little sparkle star
    if (Math.sin(Date.now() * 0.01 + fish.id) > 0.6) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, -10, 3, 3);
      ctx.fillRect(9, -11, 1, 5);
      ctx.fillRect(7, -9, 5, 1);
    }

    ctx.restore();
  }

  // Render Green Gas Clouds (Myshka's Fart Attack)
  public renderGreenCloud(cloud: GreenCloud, cameraX: number) {
    const ctx = this.ctx;
    const cx = cloud.x - cameraX;
    const cy = cloud.y;
    const progress = 1 - cloud.life / cloud.maxLife;
    const currentRadius = cloud.radius * (0.5 + progress * 0.9);
    const alpha = Math.max(0, 1 - progress);

    ctx.save();
    ctx.translate(cx, cy);

    // Glowing green stink radial gradient
    const grad = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, currentRadius);
    grad.addColorStop(0, `rgba(132, 204, 22, ${alpha * 0.85})`); // Lime
    grad.addColorStop(0.6, `rgba(74, 222, 128, ${alpha * 0.7})`); // Green
    grad.addColorStop(1, `rgba(22, 101, 52, 0)`);
    ctx.fillStyle = grad;

    // Bubbly cluster of gas spheres
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + progress * 2;
      const dist = currentRadius * 0.45;
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(bx, by, currentRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling stink wavy lines / stars
    ctx.strokeStyle = `rgba(217, 249, 157, ${alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 0.7, 0, Math.PI * 1.2);
    ctx.stroke();

    ctx.restore();
  }

  // Render dynamic particles (hearts, sparkles, kisses, text)
  public renderParticle(p: Particle, cameraX: number) {
    const ctx = this.ctx;
    const px = p.x - cameraX;
    const py = p.y;
    const progress = 1 - p.life / p.maxLife;
    const alpha = Math.max(0, 1 - progress);

    if (p.type === 'heart') {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1 + progress * 0.5, 1 + progress * 0.5);
      ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-5, -5, -12, 0, 0, 12);
      ctx.bezierCurveTo(12, 0, 5, -5, 0, 3);
      ctx.fill();
      ctx.restore();

    } else if (p.type === 'kiss') {
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = `rgba(225, 29, 72, ${alpha})`;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('💋 ЧМОК!', -20, 0);
      ctx.restore();

    } else if (p.type === 'text' && p.text) {
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = `rgba(234, 179, 8, ${alpha})`;
      ctx.font = 'bold 14px "Press Start 2P", monospace, sans-serif';
      ctx.fillText(p.text, -20, 0);
      ctx.restore();

    } else if (p.type === 'smoke') {
      ctx.fillStyle = `rgba(132, 204, 22, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size * (1 + progress), 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Golden sparkle
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
    }
  }
}
