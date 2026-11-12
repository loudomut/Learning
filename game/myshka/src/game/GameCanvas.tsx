import React, { useEffect, useRef, useCallback } from 'react';
import { Player, Boss, GoldenFish, Platform, GreenCloud, Particle, GameMode } from './types';
import { GameRenderer } from './renderer';
import { createLevelData } from './levelData';
import { sound } from '../audio/soundEngine';

interface GameCanvasProps {
  onUpdateStats: (stats: {
    lives: number;
    fishes: number;
    fartReady: boolean;
    bossHp: number;
    bossMaxHp: number;
    bossName: string;
    gameMode: GameMode;
    totalFishes: number;
    fartsCount: number;
    kissesCount: number;
  }) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  virtualInput: {
    left: boolean;
    right: boolean;
    crouch: boolean;
    jump: boolean;
    fart: boolean;
  };
  onResetFartTrigger: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onUpdateStats,
  gameMode,
  setGameMode,
  virtualInput,
  onResetFartTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard state with case & layout normalization
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Game internal state
  const stateRef = useRef<{
    currentMode: GameMode;
    player: Player;
    boss: Boss | null;
    platforms: Platform[];
    fishes: GoldenFish[];
    clouds: GreenCloud[];
    particles: Particle[];
    cameraX: number;
    viewportWidth: number;
    viewportHeight: number;
    floorY: number;
    fartsCount: number;
    kissesCount: number;
    shake: number;
    arenaMinX: number;
    arenaMaxX: number;
    levelMaxX: number;
  }>({
    currentMode: 'LEVEL_PLATFORM',
    player: {
      x: 100,
      y: 380,
      vx: 0,
      vy: 0,
      width: 32,
      height: 26,
      facing: 1,
      isGrounded: true,
      isCrouching: false,
      isCrawling: false,
      lives: 9,
      maxLives: 9,
      fishes: 0,
      fartCooldown: 0,
      maxFartCooldown: 0.35,
      invulnerableTimer: 0,
      isCaughtByBoss: false,
      caughtTimer: 0,
      animFrame: 0,
      animTimer: 0
    },
    boss: null,
    platforms: [],
    fishes: [],
    clouds: [],
    particles: [],
    cameraX: 0,
    viewportWidth: 800,
    viewportHeight: 500,
    floorY: 404,
    fartsCount: 0,
    kissesCount: 0,
    shake: 0,
    arenaMinX: 2800,
    arenaMaxX: 3950,
    levelMaxX: 4000
  });

  // Dad dialogue quotes
  const dadQuotes = [
    'Мыыышка! Иди поцелую!',
    'Куда бежишь, пушистая?',
    'Дай зацелую в носик!',
    'Папа поймает Мышку!',
    'Иди к папочке!'
  ];
  const dadHurtQuotes = [
    'Фууу! Мышка, чем тебя кормили?!',
    'Кхе-кхе! Ну и газовая атака!',
    'Ой, Мышка, проветрить надо!',
    'Фу, кто дал кошке сухой корм?!'
  ];

  // Mom dialogue quotes
  const momQuotes = [
    'Мышенька! Сладкий мой пирожочек!',
    'Иди к мамочке на ручки!',
    'Затискаю пушистику пузико!',
    'Какая мягонькая кошечка!',
    'Мама зацелует Мышку!'
  ];
  const momHurtQuotes = [
    'О боже, Мышка! Опять тунец?!',
    'Кхе-кхе! Ну ты и вонючка!',
    'Мышкааа! Где освежитель воздуха?!',
    'Фууу, мой нос!'
  ];

  // Init Boss 1: Dad (Папа в трусах)
  const initBossDad = useCallback(() => {
    const s = stateRef.current;
    s.currentMode = 'BOSS_1_DAD';
    s.boss = {
      type: 'DAD',
      name: 'Папа в трусах',
      x: 3250, // Clearly visible inside screen
      y: s.floorY - 140,
      vx: 0,
      vy: 0,
      width: 70,
      height: 140,
      hp: 6,
      maxHp: 6,
      facing: -1,
      action: 'CHASE_BENT',
      actionTimer: 4.0,
      jumpCountdown: 3.5, // Leaps into sky every ~3.5-4s!
      fartHits: 0,
      hands: [],
      handsWaveCount: 0,
      speechText: 'Мыыышка! Иди поцелую!',
      speechTimer: 2.5,
      shakeTimer: 0,
      flashTimer: 0
    };
    sound.playMusic('boss');
    setGameMode('BOSS_1_DAD');
  }, [setGameMode]);

  // Init Boss 2: Mom (Мама в длинной футболке)
  const initBossMom = useCallback(() => {
    const s = stateRef.current;
    s.currentMode = 'BOSS_2_MOM';
    s.boss = {
      type: 'MOM',
      name: 'Мама в длинной футболке',
      x: 3280,
      y: s.floorY - 135,
      vx: 0,
      vy: 0,
      width: 68,
      height: 135,
      hp: 8,
      maxHp: 8,
      facing: -1,
      action: 'CHASE_BENT',
      actionTimer: 4.0,
      jumpCountdown: 3.5,
      fartHits: 0,
      hands: [],
      handsWaveCount: 0,
      speechText: 'Так, Папа не справился! Теперь мама затискает!',
      speechTimer: 3.0,
      shakeTimer: 0,
      flashTimer: 0
    };
    sound.playMusic('boss');
    setGameMode('BOSS_2_MOM');
  }, [setGameMode]);

  // Init / Restart Game
  const initGame = useCallback((mode: GameMode = 'LEVEL_PLATFORM') => {
    const s = stateRef.current;
    s.currentMode = mode;
    const { platforms, fishes } = createLevelData(s.floorY);
    s.platforms = platforms;
    s.fishes = fishes;
    s.clouds = [];
    s.particles = [];
    s.fartsCount = 0;
    s.kissesCount = 0;
    s.shake = 0;

    s.player = {
      x: (mode === 'BOSS_1_DAD' || mode === 'BOSS_2_MOM') ? 2850 : 100,
      y: s.floorY - 30,
      vx: 0,
      vy: 0,
      width: 32,
      height: 26,
      facing: 1,
      isGrounded: true,
      isCrouching: false,
      isCrawling: false,
      lives: 9,
      maxLives: 9,
      fishes: 0,
      fartCooldown: 0,
      maxFartCooldown: 0.35,
      invulnerableTimer: 0,
      isCaughtByBoss: false,
      caughtTimer: 0,
      animFrame: 0,
      animTimer: 0
    };

    if (mode === 'BOSS_1_DAD' || mode === 'BOSS_1_INTRO') {
      initBossDad();
    } else if (mode === 'BOSS_2_MOM' || mode === 'BOSS_2_INTRO') {
      initBossMom();
    } else {
      s.boss = null;
      sound.playMusic('level');
      setGameMode(mode);
    }
  }, [setGameMode, initBossDad, initBossMom]);

  // Synchronize external mode changes (e.g. from checkpoint buttons)
  useEffect(() => {
    if (gameMode !== stateRef.current.currentMode) {
      initGame(gameMode);
    }
  }, [gameMode, initGame]);

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code.toLowerCase()] = true;
      keysRef.current[e.code] = true;

      // Meow on M
      if (e.key.toLowerCase() === 'm' || e.code === 'KeyM' || e.key.toLowerCase() === 'ь') {
        sound.playMeow();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Window resize & canvas setup
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const targetWidth = 800;
      const targetHeight = 500;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const s = stateRef.current;
      s.viewportWidth = targetWidth;
      s.viewportHeight = targetHeight;
      s.floorY = targetHeight - 96;

      if (s.platforms.length === 0) {
        initGame(gameMode);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initGame, gameMode]);

  // Main Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      updateGame(dt);
      renderGame();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update Game Logic
  const updateGame = (dt: number) => {
    const s = stateRef.current;
    const player = s.player;
    const keys = keysRef.current;

    if (s.currentMode === 'VICTORY' || s.currentMode === 'GAME_OVER') {
      return;
    }

    // Input collection: supports both English (WASD/Arrows/F) and Russian (ЦФЫВ/А) layouts!
    const moveLeft = 
      keys['arrowleft'] || keys['a'] || keys['ф'] || keys['keya'] || virtualInput.left;
    const moveRight = 
      keys['arrowright'] || keys['d'] || keys['в'] || keys['keyd'] || virtualInput.right;
    const crouchKey = 
      keys['arrowdown'] || keys['s'] || keys['ы'] || keys['keys'] || virtualInput.crouch;
    const jumpKey = 
      keys['arrowup'] || keys['w'] || keys['ц'] || keys['keyw'] || keys['space'] || keys[' '] || virtualInput.jump;
    
    // FART KEY: Explicitly F / physical KeyF (Russian 'а') and X / physical KeyX (Russian 'ч')
    const fartKey = 
      keys['f'] || keys['а'] || keys['keyf'] || 
      keys['x'] || keys['ч'] || keys['keyx'] || 
      virtualInput.fart;

    if (virtualInput.fart) {
      onResetFartTrigger();
    }

    // Decrease cooldowns & iframes
    if (player.fartCooldown > 0) {
      player.fartCooldown = Math.max(0, player.fartCooldown - dt);
    }
    if (player.invulnerableTimer > 0) {
      player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
    }

    // Myshka caught by Boss animation timer
    if (player.isCaughtByBoss) {
      player.caughtTimer -= dt;
      player.vx = 0;
      player.vy = 0;
      if (player.caughtTimer <= 0) {
        player.isCaughtByBoss = false;
        player.invulnerableTimer = 2.5; // generous iframes after kiss
        // Push Myshka back safely
        player.vx = player.facing === 1 ? -6 : 6;
        player.vy = -5;
      }
      return;
    }

    // ---------------------------------------------
    // CROUCHING / CRAWLING MECHANIC
    // ---------------------------------------------
    const isUnderLowObstacle = s.platforms.some(p => {
      if (!p.canCrawlUnder) return false;
      const px = player.x + player.width / 2;
      return px >= p.x && px <= p.x + p.width && player.y + player.height > p.y;
    });

    if (crouchKey || isUnderLowObstacle) {
      player.isCrouching = true;
      player.height = 14;
    } else {
      player.isCrouching = false;
      player.height = 24;
    }

    // Horizontal Movement
    const speed = player.isCrouching ? 2.6 : 5.2;
    if (moveLeft && !moveRight) {
      player.vx = -speed;
      player.facing = -1;
      player.isCrawling = player.isCrouching;
    } else if (moveRight && !moveLeft) {
      player.vx = speed;
      player.facing = 1;
      player.isCrawling = player.isCrouching;
    } else {
      player.vx *= 0.75;
      player.isCrawling = false;
    }

    // Jump
    if (jumpKey && player.isGrounded && !player.isCrouching && !isUnderLowObstacle) {
      player.vy = -11.8;
      player.isGrounded = false;
      sound.playJump();
    }

    // Gravity
    player.vy += 22 * dt;
    if (player.vy > 14) player.vy = 14;

    player.x += player.vx;
    player.y += player.vy;

    // Platform & Floor Collisions
    player.isGrounded = false;

    if (player.y + player.height >= s.floorY) {
      player.y = s.floorY - player.height;
      player.vy = 0;
      player.isGrounded = true;
    }

    s.platforms.forEach(plat => {
      const pLeft = plat.x;
      const pRight = plat.x + plat.width;
      const pTop = plat.y;
      const pBottom = plat.y + plat.height;

      if (player.x + player.width > pLeft && player.x < pRight) {
        if (plat.canCrawlUnder) {
          if (!player.isCrouching && player.y + player.height > pTop + 10 && player.y < pBottom) {
            if (player.vx > 0) player.x = pLeft - player.width;
            if (player.vx < 0) player.x = pRight;
          }
        } else {
          const prevY = player.y - player.vy;
          if (prevY + player.height <= pTop + 8 && player.y + player.height >= pTop && player.vy >= 0) {
            player.y = pTop - player.height;
            player.vy = 0;
            player.isGrounded = true;
          } else if (player.y + player.height > pTop && player.y < pBottom) {
            if (player.vx > 0 && player.x + player.width - player.vx <= pLeft + 4) {
              player.x = pLeft - player.width;
            } else if (player.vx < 0 && player.x - player.vx >= pRight - 4) {
              player.x = pRight;
            }
          }
        }
      }
    });

    // Level Boundaries
    const isBossFight = s.currentMode === 'BOSS_1_DAD' || s.currentMode === 'BOSS_2_MOM';
    const minX = isBossFight ? s.arenaMinX : 20;
    const maxX = isBossFight ? s.arenaMaxX - 40 : s.levelMaxX;
    if (player.x < minX) player.x = minX;
    if (player.x > maxX) player.x = maxX;

    // -------------------------------------------------------------
    // FART ATTACK (Самоноводящиеся зеленые облачка!)
    // -------------------------------------------------------------
    if (fartKey && player.fartCooldown <= 0) {
      player.fartCooldown = player.maxFartCooldown;
      s.fartsCount++;
      sound.playFart();

      const cloudX = player.x + (player.facing === 1 ? -12 : player.width + 12);
      const cloudY = player.y + player.height * 0.5;

      s.clouds.push({
        id: Date.now() + Math.random(),
        x: cloudX,
        y: cloudY,
        vx: -player.facing * 4.0,
        vy: -1.0,
        radius: 20,
        life: 2.8,
        maxLife: 2.8,
        damage: 1,
        hasHitBoss: false,
        isHoming: true
      });

      s.particles.push({
        id: Math.random(),
        x: cloudX,
        y: cloudY - 14,
        vx: -player.facing * 0.5,
        vy: -1.2,
        color: '#84cc16',
        size: 14,
        life: 0.8,
        maxLife: 0.8,
        type: 'text',
        text: 'ПУК! 💨'
      });
    }

    // ---------------------------------------------
    // COLLECT GOLDEN FISHES
    // ---------------------------------------------
    s.fishes.forEach(fish => {
      if (fish.collected) return;
      const dist = Math.hypot(
        (player.x + player.width / 2) - fish.x,
        (player.y + player.height / 2) - fish.y
      );

      if (dist < 26) {
        fish.collected = true;
        player.fishes += fish.type === 'super' ? 3 : 1;
        sound.playFishCollect();

        for (let i = 0; i < 6; i++) {
          s.particles.push({
            id: Math.random(),
            x: fish.x,
            y: fish.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#facc15',
            size: 4,
            life: 0.6,
            maxLife: 0.6,
            type: 'sparkle'
          });
        }
      }
    });

    // -------------------------------------------------------------
    // UPDATE GREEN CLOUDS (САМОНАВОДКА НА БОССА + УРОН!)
    // -------------------------------------------------------------
    s.clouds.forEach(cloud => {
      // Homing guidance: if Boss is active, steer directly towards Boss!
      if (s.boss && s.boss.action !== 'DEFEATED') {
        const targetX = s.boss.x + s.boss.width / 2;
        const targetY = (s.boss.action === 'JUMP_OFFSCREEN' || s.boss.action === 'HANDS_ATTACK')
          ? s.floorY - 90
          : s.boss.y + s.boss.height * 0.45;

        const dx = targetX - cloud.x;
        const dy = targetY - cloud.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          const homingSpeed = 9.8;
          const targetVx = (dx / dist) * homingSpeed;
          const targetVy = (dy / dist) * homingSpeed;

          cloud.vx += (targetVx - cloud.vx) * 0.3;
          cloud.vy += (targetVy - cloud.vy) * 0.3;
        }
      }

      cloud.x += cloud.vx;
      cloud.y += cloud.vy;
      cloud.life -= dt;
      cloud.radius += 5 * dt;

      // Stink trail particles
      if (Math.random() < 0.4) {
        s.particles.push({
          id: Math.random(),
          x: cloud.x + (Math.random() - 0.5) * 8,
          y: cloud.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: '#84cc16',
          size: 5,
          life: 0.4,
          maxLife: 0.4,
          type: 'smoke'
        });
      }

      // Check collision with Boss using full bounding box + radius!
      // Can hit Boss whenever on-screen or during slam/hurt/chase!
      if (
        s.boss &&
        !cloud.hasHitBoss &&
        s.boss.action !== 'DEFEATED' &&
        s.boss.action !== 'JUMP_OFFSCREEN'
      ) {
        const bLeft = s.boss.x - 20;
        const bRight = s.boss.x + s.boss.width + 20;
        const bTop = s.boss.y - 20;
        const bBottom = s.boss.y + s.boss.height + 20;

        if (
          cloud.x >= bLeft &&
          cloud.x <= bRight &&
          cloud.y >= bTop &&
          cloud.y <= bBottom
        ) {
          cloud.hasHitBoss = true;
          cloud.life = 0; // explode into green smoke
          damageBoss(s.boss, cloud.damage);
        }
      }
    });
    s.clouds = s.clouds.filter(c => c.life > 0);

    // -------------------------------------------------------------
    // BOSS ARENA TRIGGER (Triggered ONCE via stateRef currentMode!)
    // -------------------------------------------------------------
    if (s.currentMode === 'LEVEL_PLATFORM' && player.x >= 2750) {
      initBossDad();
    }

    // ---------------------------------------------
    // BOSS LOGIC & AI
    // ---------------------------------------------
    if (s.boss) {
      updateBoss(s.boss, dt);
    }

    // ---------------------------------------------
    // PARTICLES UPDATE
    // ---------------------------------------------
    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
    });
    s.particles = s.particles.filter(p => p.life > 0);

    // Camera follow Myshka smoothly
    if (isBossFight) {
      const targetCamX = s.arenaMinX - 40;
      s.cameraX += (targetCamX - s.cameraX) * 0.1;
    } else {
      const targetCamX = player.x - s.viewportWidth * 0.35;
      s.cameraX += (Math.max(0, targetCamX) - s.cameraX) * 0.12;
    }

    // Screen shake decay
    if (s.shake > 0) {
      s.shake = Math.max(0, s.shake - dt * 20);
    }

    // Update HUD Stats
    onUpdateStats({
      lives: player.lives,
      fishes: player.fishes,
      fartReady: player.fartCooldown <= 0,
      bossHp: s.boss ? s.boss.hp : 0,
      bossMaxHp: s.boss ? s.boss.maxHp : 6,
      bossName: s.boss ? s.boss.name : '',
      gameMode: s.currentMode,
      totalFishes: s.fishes.length,
      fartsCount: s.fartsCount,
      kissesCount: s.kissesCount
    });
  };

  // Damage Boss by Green Cloud
  const damageBoss = (boss: Boss, damage: number) => {
    const s = stateRef.current;
    if (boss.hp <= 0 || boss.action === 'DEFEATED') return;

    boss.hp = Math.max(0, boss.hp - damage);
    boss.flashTimer = 0.5;
    boss.fartHits = (boss.fartHits || 0) + 1;
    sound.playBossHurt();

    // Floating damage text particle
    s.particles.push({
      id: Math.random(),
      x: boss.x + boss.width / 2,
      y: boss.y - 20,
      vx: 0,
      vy: -2.2,
      color: '#ef4444',
      size: 16,
      life: 0.9,
      maxLife: 0.9,
      type: 'text',
      text: '-1 HP!'
    });

    // Funny cough dialogue
    const quotes = boss.type === 'DAD' ? dadHurtQuotes : momHurtQuotes;
    boss.speechText = quotes[Math.floor(Math.random() * quotes.length)];
    boss.speechTimer = 2.0;

    // Green explosion smoke
    for (let i = 0; i < 14; i++) {
      s.particles.push({
        id: Math.random(),
        x: boss.x + Math.random() * boss.width,
        y: boss.y + Math.random() * boss.height * 0.6,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        color: '#84cc16',
        size: 8,
        life: 0.8,
        maxLife: 0.8,
        type: 'smoke'
      });
    }

    // Check defeat
    if (boss.hp <= 0) {
      boss.action = 'DEFEATED';
      boss.actionTimer = 2.5;

      if (boss.type === 'DAD') {
        boss.speechText = 'Ох, Мышка... чемпион по газовой атаке! Мама, спасай!';
        setTimeout(() => {
          initBossMom();
        }, 2000);
      } else {
        boss.speechText = 'Всё, Мышенька, мы сдаёмся! Иди кушай рыбок!';
        setTimeout(() => {
          s.currentMode = 'VICTORY';
          setGameMode('VICTORY');
          sound.playMusic('victory');
        }, 1800);
      }
      return;
    }

    // If hit with 2 farts, immediately provoke the sky jump!
    if (boss.fartHits >= 2 && boss.action !== 'PREPARE_JUMP' && boss.action !== 'JUMP_OFFSCREEN') {
      boss.fartHits = 0;
      boss.action = 'PREPARE_JUMP';
      boss.actionTimer = 0.5;
      boss.speechText = 'КУДА ТЫ СПРЯТАЛАСЬ?! ЛОВЛЮ С НЕБА!';
      boss.speechTimer = 1.6;
    } else {
      // Brief flinch
      boss.action = 'HURT';
      boss.actionTimer = 0.45;
    }
  };

  // Catch Myshka and Kiss her (Loses 1 life)
  const catchAndKissPlayer = (boss: Boss) => {
    const s = stateRef.current;
    const player = s.player;
    if (player.invulnerableTimer > 0 || player.isCaughtByBoss) return;

    player.isCaughtByBoss = true;
    player.caughtTimer = 1.6;
    player.lives = Math.max(0, player.lives - 1);
    s.kissesCount++;
    boss.action = 'KISSING';
    boss.actionTimer = 1.6;

    sound.playKiss();
    sound.playMeow();

    boss.speechText = boss.type === 'DAD' ? 'ЧМОК В НОСИК! ЗАЦЕЛУЮ!' : 'МОЙ ПИРОЖОЧЕК! ЧМОК-ЧМОК!';
    boss.speechTimer = 2.0;

    for (let i = 0; i < 10; i++) {
      s.particles.push({
        id: Math.random(),
        x: player.x + (Math.random() - 0.5) * 30,
        y: player.y - 20 - Math.random() * 20,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        color: '#f43f5e',
        size: 16,
        life: 1.2,
        maxLife: 1.2,
        type: i % 2 === 0 ? 'kiss' : 'heart'
      });
    }

    if (player.lives <= 0) {
      setTimeout(() => {
        s.currentMode = 'GAME_OVER';
        setGameMode('GAME_OVER');
      }, 1600);
    }
  };

  // Boss AI: Active chase, jump off-screen, sky hands, slam down!
  const updateBoss = (boss: Boss, dt: number) => {
    const s = stateRef.current;
    const player = s.player;

    if (boss.action === 'DEFEATED') return;

    if (boss.flashTimer > 0) boss.flashTimer -= dt;
    if (boss.speechTimer > 0) boss.speechTimer -= dt;

    boss.actionTimer -= dt;

    // Independent jumpCountdown: Guaranteed sky jump every ~3.5 to 4.5 seconds!
    if (boss.action === 'CHASE_BENT' || boss.action === 'HURT') {
      boss.jumpCountdown = (boss.jumpCountdown ?? 3.5) - dt;
      if (boss.jumpCountdown <= 0) {
        boss.jumpCountdown = 4.0;
        boss.fartHits = 0;
        boss.action = 'PREPARE_JUMP';
        boss.actionTimer = 0.6;
        boss.speechText = 'КУДА ТЫ СПРЯТАЛАСЬ?! ЛОВЛЮ С НЕБА!';
        boss.speechTimer = 1.5;
        return;
      }
    }

    // Face player
    boss.facing = player.x < boss.x + boss.width / 2 ? -1 : 1;

    switch (boss.action) {
      case 'CHASE_BENT': {
        const chaseSpeed = boss.type === 'DAD' ? 3.6 : 4.2;
        const dx = (player.x + player.width / 2) - (boss.x + boss.width / 2);

        boss.vx = Math.sign(dx) * chaseSpeed;
        boss.x += boss.vx;

        boss.y = s.floorY - boss.height;
        if (boss.x < s.arenaMinX + 10) boss.x = s.arenaMinX + 10;
        if (boss.x > s.arenaMaxX - boss.width - 10) boss.x = s.arenaMaxX - boss.width - 10;

        if (Math.random() < 0.01 && boss.speechTimer <= 0) {
          const quotes = boss.type === 'DAD' ? dadQuotes : momQuotes;
          boss.speechText = quotes[Math.floor(Math.random() * quotes.length)];
          boss.speechTimer = 2.0;
        }

        // CATCH CHECK: Horizontal & vertical reach
        const playerCenterX = player.x + player.width / 2;
        const bossCenterX = boss.x + boss.width / 2;
        const distX = Math.abs(playerCenterX - bossCenterX);

        const isUnderLowFurniture = s.platforms.some(p => {
          if (!p.canCrawlUnder) return false;
          return player.x + player.width > p.x && player.x < p.x + p.width;
        });
        const isSafeCrawling = isUnderLowFurniture && player.isCrouching;

        if (distX < 52 && (player.y + player.height >= boss.y + 15) && !isSafeCrawling) {
          catchAndKissPlayer(boss);
        }
        break;
      }

      case 'PREPARE_JUMP':
        // Squatting down before rocket jump
        if (boss.actionTimer <= 0) {
          boss.action = 'JUMP_OFFSCREEN';
          boss.actionTimer = 0.6;
          sound.playJump();
        }
        break;

      case 'JUMP_OFFSCREEN':
        // Rockets up into ceiling and vanishes off-screen!
        boss.y -= 1300 * dt;
        if (boss.y < -160 || boss.actionTimer <= 0) {
          boss.y = -220; // completely above screen
          boss.action = 'HANDS_ATTACK';
          boss.actionTimer = 5.2;
          boss.hands = [];
          boss.handsWaveCount = 0;
          spawnSkyHandWave(boss, player.x);
        }
        break;

      case 'HANDS_ATTACK':
        // Giant arms with hairy hands plunge from ceiling!
        updateSkyHands(boss, dt, player);

        if (boss.actionTimer <= 0 && boss.hands.length === 0) {
          boss.action = 'SLAM_DOWN';
          boss.actionTimer = 0.7;
          boss.x = player.x + (Math.random() > 0.5 ? 80 : -80);
          boss.y = -220;
          sound.playSwoop();
        }
        break;

      case 'SLAM_DOWN':
        // Drops back down from the sky with huge crash!
        boss.y += 1050 * dt;
        if (boss.y >= s.floorY - boss.height) {
          boss.y = s.floorY - boss.height;
          boss.action = 'CHASE_BENT';
          boss.jumpCountdown = 4.0;
          boss.actionTimer = 4.5;
          s.shake = 16;

          for (let i = 0; i < 16; i++) {
            s.particles.push({
              id: Math.random(),
              x: boss.x + Math.random() * boss.width,
              y: s.floorY,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 3,
              color: '#94a3b8',
              size: 5,
              life: 0.5,
              maxLife: 0.5,
              type: 'smoke'
            });
          }
        }
        break;

      case 'HURT':
        // Stun flinch
        if (boss.actionTimer <= 0) {
          boss.action = 'CHASE_BENT';
          boss.actionTimer = 3.5;
        }
        break;

      case 'KISSING':
        if (boss.actionTimer <= 0) {
          boss.action = 'CHASE_BENT';
          boss.actionTimer = 4.0;
        }
        break;
    }
  };

  // Spawn Sky Hand Wave
  const spawnSkyHandWave = (boss: Boss, playerX: number) => {
    sound.playSwoop();
    const isMom = boss.type === 'MOM';

    if (isMom && Math.random() > 0.3) {
      boss.hands = [
        {
          x: playerX - 55,
          targetX: playerX - 55,
          y: -100,
          targetY: stateRef.current.floorY - 60,
          width: 50,
          height: 120,
          state: 'WARNING',
          timer: 1.0,
          warningProgress: 0,
          side: 'left'
        },
        {
          x: playerX + 55,
          targetX: playerX + 55,
          y: -100,
          targetY: stateRef.current.floorY - 60,
          width: 50,
          height: 120,
          state: 'WARNING',
          timer: 1.0,
          warningProgress: 0,
          side: 'right'
        }
      ];
    } else {
      boss.hands = [
        {
          x: playerX,
          targetX: playerX,
          y: -100,
          targetY: stateRef.current.floorY - 60,
          width: 55,
          height: 120,
          state: 'WARNING',
          timer: 1.0,
          warningProgress: 0,
          side: 'left'
        }
      ];
    }
  };

  // Update Sky Hands Behavior
  const updateSkyHands = (boss: Boss, dt: number, player: Player) => {
    boss.hands.forEach(hand => {
      hand.timer -= dt;

      if (hand.state === 'WARNING') {
        hand.warningProgress = Math.min(1, 1 - hand.timer / 1.0);
        if (hand.timer <= 0) {
          hand.state = 'DROP';
          hand.timer = 0.45;
          sound.playSwoop();
        }
      } else if (hand.state === 'DROP') {
        hand.y += 900 * dt;
        if (hand.y >= hand.targetY) {
          hand.y = hand.targetY;
          hand.state = 'HOLD';
          hand.timer = 0.55;
          stateRef.current.shake = 8;

          // Catch Myshka from above
          const dist = Math.abs(player.x + player.width / 2 - hand.targetX);
          if (dist < 45 && player.isGrounded && !player.isCaughtByBoss) {
            catchAndKissPlayer(boss);
          }
        }
      } else if (hand.state === 'HOLD') {
        if (hand.timer <= 0) {
          hand.state = 'RETRACT';
          hand.timer = 0.45;
        }
      } else if (hand.state === 'RETRACT') {
        hand.y -= 800 * dt;
      }
    });

    boss.hands = boss.hands.filter(h => h.state !== 'RETRACT' || h.y > -80);

    if (boss.hands.length === 0 && boss.actionTimer > 1.2) {
      boss.handsWaveCount++;
      if (boss.handsWaveCount < 2) {
        spawnSkyHandWave(boss, player.x);
      }
    }
  };

  // Render Frame
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const renderer = new GameRenderer(ctx, canvas.width, canvas.height);

    ctx.save();

    if (s.shake > 0) {
      const sx = (Math.random() - 0.5) * s.shake;
      const sy = (Math.random() - 0.5) * s.shake;
      ctx.translate(sx, sy);
    }

    const isBossArena = s.currentMode === 'BOSS_1_DAD' || s.currentMode === 'BOSS_2_MOM';

    renderer.renderBackground(s.cameraX, isBossArena);
    renderer.renderRugs(s.cameraX);

    s.platforms.forEach(plat => {
      renderer.renderPlatform(plat, s.cameraX);
    });

    s.fishes.forEach(fish => {
      renderer.renderFish(fish, s.cameraX);
    });

    s.clouds.forEach(cloud => {
      renderer.renderGreenCloud(cloud, s.cameraX);
    });

    if (s.boss) {
      renderer.renderBoss(s.boss, s.cameraX);
    }

    renderer.renderMyshka(s.player, s.cameraX);

    s.particles.forEach(p => {
      renderer.renderParticle(p, s.cameraX);
    });

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      <div className="relative w-full max-w-[800px] aspect-[800/500] shadow-2xl rounded-xl overflow-hidden border-4 border-amber-900/60 bg-amber-950">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};
