export type GameMode = 
  | 'STORY_INTRO'
  | 'LEVEL_PLATFORM'
  | 'BOSS_1_INTRO'
  | 'BOSS_1_DAD'
  | 'BOSS_2_INTRO'
  | 'BOSS_2_MOM'
  | 'VICTORY'
  | 'GAME_OVER';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  isGrounded: boolean;
  isCrouching: boolean;
  isCrawling: boolean;
  lives: number;
  maxLives: number;
  fishes: number;
  fartCooldown: number; // 0 when ready
  maxFartCooldown: number;
  invulnerableTimer: number; // frames/seconds of iframes
  isCaughtByBoss: boolean;
  caughtTimer: number;
  animFrame: number;
  animTimer: number;
}

export interface GoldenFish {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  floatOffset: number;
  type: 'regular' | 'super';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'floor' | 'table' | 'chair' | 'cabinet' | 'bed' | 'fridge' | 'nightstand' | 'shelf';
  canCrawlUnder?: boolean; // if true, Myshka can sneak beneath it!
  clearanceHeight?: number; // space under furniture
  label?: string;
}

export interface GreenCloud {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  damage: number;
  hasHitBoss: boolean;
  isHoming?: boolean;
}

export type BossAction = 
  | 'ENTER'
  | 'CHASE_BENT'
  | 'PREPARE_JUMP'
  | 'JUMP_OFFSCREEN'
  | 'HANDS_ATTACK'
  | 'SLAM_DOWN'
  | 'HURT'
  | 'KISSING'
  | 'DEFEATED';

export interface SkyHand {
  x: number;
  targetX: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  state: 'WARNING' | 'DROP' | 'HOLD' | 'RETRACT';
  timer: number;
  warningProgress: number;
  side: 'left' | 'right';
}

export interface Boss {
  type: 'DAD' | 'MOM';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  action: BossAction;
  actionTimer: number;
  hands: SkyHand[];
  handsWaveCount: number;
  speechText: string;
  speechTimer: number;
  shakeTimer: number;
  flashTimer: number;
  jumpCountdown: number;
  fartHits: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'heart' | 'sparkle' | 'kiss' | 'smoke' | 'sweat' | 'text';
  text?: string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean; // crouch
  jump: boolean;
  fart: boolean;
}
