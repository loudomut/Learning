import sys
import pygame

# Инициализация
pygame.init()

# Окно 800 на 600
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Симулятор разработчика и кота")

clock = pygame.time.Clock()

# Переменные игры
code_lines = 0
cat_attention = 100.0

# Зоны для кликов (увеличим кошачью зону вокруг самого кота)
laptop_rect = pygame.Rect(250, 200, 300, 180)
cat_click_rect = pygame.Rect(100, 350, 140, 110)

# Шрифт
try:
  font = pygame.font.SysFont("Verdana", 18)
  font_big = pygame.font.SysFont("Verdana", 22)
except:
  font = pygame.font.Font(None, 24)
  font_big = pygame.font.Font(None, 32)

running = True
while running:
  # 1. События
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      running = False
    elif event.type == pygame.KEYDOWN:
      if event.key == pygame.K_ESCAPE:
        running = False
    elif event.type == pygame.MOUSEBUTTONDOWN:
      if event.button == 1:
        pos = event.pos
        if laptop_rect.collidepoint(pos):
          code_lines += 1
        if cat_click_rect.collidepoint(pos):
          cat_attention = min(100.0, cat_attention + 30.0)

  # 2. Логика
  cat_attention = max(0.0, cat_attention - 0.05)

  # 3. Отрисовка
  screen.fill((45, 52, 54))

  # Стол
  pygame.draw.rect(screen, (108, 92, 231), (100, 380, 600, 190))

  # Ноутбук
  pygame.draw.rect(screen, (223, 230, 233), laptop_rect)
  pygame.draw.rect(screen, (35, 43, 43), (265, 215, 270, 130))

  # Текст на экране ноутбука
  txt_code = font.render(f"code_lines: {code_lines}", True, (0, 184, 148))
  screen.blit(txt_code, (280, 230))

  # --- РИСУЕМ НАСТОЯЩЕГО КОТА ВМЕСТО ПРЯМОУГОЛЬНИКА ---
  cat_base_color = (
      (230, 126, 34) if cat_attention > 20 else (192, 57, 43)
  )  # Рыжий или тревожно-красный

  # Координаты кота
  cx, cy = 140, 390

  # Хвост
  pygame.draw.arc(
      screen,
      (211, 84, 0),
      (cx - 30, cy - 10, 50, 50),
      0,
      3.14,
      5,
  )
  # Тело кота (овал/прямоугольник)
  pygame.draw.rect(screen, cat_base_color, (cx, cy, 70, 45), border_radius=20)
  # Голова кота
  pygame.draw.circle(screen, cat_base_color, (cx + 65, cy + 15), 22)
  # Ушки (треугольники)
  pygame.draw.polygon(
      screen,
      cat_base_color,
      [(cx + 50, cy - 2), (cx + 60, cy - 15), (cx + 68, cy - 2)],
  )
  pygame.draw.polygon(
      screen,
      cat_base_color,
      [(cx + 68, cy - 2), (cx + 76, cy - 15), (cx + 84, cy - 2)],
  )
  # Глаза
  pygame.draw.circle(screen, (255, 255, 255), (cx + 70, cy + 12), 4)
  pygame.draw.circle(screen, (0, 0, 0), (cx + 71, cy + 12), 2)

  # Текстовая подметка состояния
  cat_status_text = "Мурчит" if cat_attention > 20 else "ОРЕТ ЗА ЕДУ!"
  txt_cat = font.render(cat_status_text, True, (255, 255, 255))
  screen.blit(txt_cat, (cx - 10, cy - 40))

  # Верхняя панель с прогрессом
  pygame.draw.rect(screen, (34, 112, 147), (0, 0, WIDTH, 60))
  info_surf = font_big.render(
      f"Строк кода: {code_lines} | Внимание кота: {int(cat_attention)}%",
      True,
      (255, 255, 255),
  )
  screen.blit(info_surf, (20, 18))

  # Обновляем дисплей
  pygame.display.update()
  clock.tick(60)

pygame.quit()
sys.exit()
