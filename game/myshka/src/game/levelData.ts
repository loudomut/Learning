import { Platform, GoldenFish } from './types';

export function createLevelData(floorY: number): { platforms: Platform[]; fishes: GoldenFish[] } {
  const platforms: Platform[] = [
    // 1. Bedside nightstand with lamp
    {
      x: 260,
      y: floorY - 60,
      width: 70,
      height: 60,
      type: 'nightstand',
      label: 'Тумбочка'
    },
    // 2. Tall Bookshelf
    {
      x: 420,
      y: floorY - 140,
      width: 85,
      height: 140,
      type: 'cabinet',
      label: 'Шкаф с книгами'
    },
    // 3. Low Coffee Table (MUST CRAWL UNDER OR JUMP OVER!)
    {
      x: 620,
      y: floorY - 45,
      width: 150,
      height: 45,
      type: 'table',
      canCrawlUnder: true,
      clearanceHeight: 28,
      label: 'Низкий столик (ползти)'
    },
    // 4. Dining Chair 1
    {
      x: 880,
      y: floorY - 55,
      width: 48,
      height: 55,
      type: 'chair',
      label: 'Стул'
    },
    // 5. Dining Table (Crawl under or jump on!)
    {
      x: 950,
      y: floorY - 95,
      width: 220,
      height: 95,
      type: 'table',
      canCrawlUnder: true,
      clearanceHeight: 60,
      label: 'Обеденный стол'
    },
    // 6. Dining Chair 2
    {
      x: 1190,
      y: floorY - 55,
      width: 48,
      height: 55,
      type: 'chair',
      label: 'Стул'
    },
    // 7. Cozy Big Bed with clearance underneath!
    {
      x: 1360,
      y: floorY - 75,
      width: 260,
      height: 75,
      type: 'bed',
      canCrawlUnder: true,
      clearanceHeight: 40,
      label: 'Кровать'
    },
    // 8. High Wall Shelf
    {
      x: 1720,
      y: floorY - 160,
      width: 130,
      height: 16,
      type: 'shelf',
      label: 'Полка'
    },
    // 9. Dresser / Chest of Drawers
    {
      x: 1940,
      y: floorY - 110,
      width: 110,
      height: 110,
      type: 'cabinet',
      label: 'Комод'
    },
    // 10. Kitchen Counter & Refrigerator!
    {
      x: 2180,
      y: floorY - 90,
      width: 130,
      height: 90,
      type: 'cabinet',
      label: 'Кухонная тумба'
    },
    {
      x: 2330,
      y: floorY - 190,
      width: 100,
      height: 190,
      type: 'fridge',
      label: 'Холодильник'
    },
    // 11. Shelf above door
    {
      x: 2520,
      y: floorY - 120,
      width: 120,
      height: 16,
      type: 'shelf',
      label: 'Антресоль'
    },

    // 12. Boss Arena Boundaries & decorative platforms
    // Arena starts at x = 2800 to x = 4000
    {
      x: 3000,
      y: floorY - 60,
      width: 80,
      height: 60,
      type: 'nightstand',
      label: 'Тумба'
    },
    {
      x: 3300,
      y: floorY - 50,
      width: 140,
      height: 50,
      type: 'table',
      canCrawlUnder: true,
      clearanceHeight: 32,
      label: 'Журнальный столик'
    },
    {
      x: 3650,
      y: floorY - 70,
      width: 180,
      height: 70,
      type: 'bed',
      canCrawlUnder: true,
      clearanceHeight: 35,
      label: 'Диван'
    }
  ];

  // Distribute Golden Fishes along the floor and on top of furniture
  const fishes: GoldenFish[] = [];
  let fishId = 1;

  // Floor fishes
  for (let x = 120; x < 2700; x += 90) {
    // Skip if right inside solid furniture
    fishes.push({
      id: fishId++,
      x,
      y: floorY - 30,
      collected: false,
      floatOffset: fishId * 0.4,
      type: 'regular'
    });
  }

  // Fishes on top of furniture!
  // On nightstand
  fishes.push({ id: fishId++, x: 295, y: floorY - 90, collected: false, floatOffset: 0.1, type: 'regular' });
  // On bookshelf
  fishes.push({ id: fishId++, x: 440, y: floorY - 170, collected: false, floatOffset: 0.5, type: 'regular' });
  fishes.push({ id: fishId++, x: 480, y: floorY - 170, collected: false, floatOffset: 0.9, type: 'regular' });
  // Under low coffee table (crawling reward!)
  fishes.push({ id: fishId++, x: 670, y: floorY - 18, collected: false, floatOffset: 0.2, type: 'super' });
  fishes.push({ id: fishId++, x: 720, y: floorY - 18, collected: false, floatOffset: 0.4, type: 'super' });
  // On dining table
  fishes.push({ id: fishId++, x: 1020, y: floorY - 125, collected: false, floatOffset: 0.3, type: 'regular' });
  fishes.push({ id: fishId++, x: 1060, y: floorY - 125, collected: false, floatOffset: 0.7, type: 'regular' });
  fishes.push({ id: fishId++, x: 1100, y: floorY - 125, collected: false, floatOffset: 1.1, type: 'regular' });
  // Under bed (secret treat!)
  fishes.push({ id: fishId++, x: 1450, y: floorY - 20, collected: false, floatOffset: 0.6, type: 'super' });
  fishes.push({ id: fishId++, x: 1530, y: floorY - 20, collected: false, floatOffset: 1.2, type: 'super' });
  // On high shelf
  fishes.push({ id: fishId++, x: 1760, y: floorY - 190, collected: false, floatOffset: 0.8, type: 'regular' });
  fishes.push({ id: fishId++, x: 1800, y: floorY - 190, collected: false, floatOffset: 1.4, type: 'regular' });
  // On dresser
  fishes.push({ id: fishId++, x: 1980, y: floorY - 140, collected: false, floatOffset: 0.2, type: 'regular' });
  // TOP OF REFRIGERATOR (Legendary King Fish!)
  fishes.push({ id: fishId++, x: 2380, y: floorY - 230, collected: false, floatOffset: 0.0, type: 'super' });

  // Arena fishes (for dodging during boss fight!)
  for (let x = 2900; x < 3900; x += 110) {
    fishes.push({
      id: fishId++,
      x,
      y: floorY - 30,
      collected: false,
      floatOffset: fishId * 0.5,
      type: 'regular'
    });
  }

  return { platforms, fishes };
}
