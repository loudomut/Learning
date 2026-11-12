from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# ==========================================
# 1. НАСТРОЙКА И ЗАПУСК БРАУЗЕРА
# ==========================================
options = Options()
# Прячем флаг автоматизации, чтобы сайты не воспринимали скрипт как бота
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

# Инициализируем драйвер Chrome с нашими настройками
driver = webdriver.Chrome(options=options)
# Разворачиваем окно на весь экран, чтобы элементы меню не прятались в мобильную версию ("бургер")
driver.maximize_window()

# Создаем объект ожидания: скрипт будет ждать появления элементов максимум 15 секунд
wait = WebDriverWait(driver, 15)

try:
    # ==========================================
    # 2. ОТКРЫТИЕ ГЛАВНОЙ СТРАНИЦЫ
    # ==========================================
    home_url = "https://nigeria.gov.ng/"
    print(f"Шаг 1: Открываем главную страницу {home_url}")
    driver.get(home_url)

    # Ждем, пока страница загрузится (проверяем, что в DOM появилось тело страницы <body>)
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    # ПРОВЕРКА 1: Убеждаемся, что мы попали именно на нужный домен и страница не пустая
    assert "nigeria.gov.ng" in driver.current_url, f"Ошибка: открылся неверный URL {driver.current_url}"
    assert driver.title != "", "Ошибка: заголовок страницы (title) пустой!"
    print(f"Успех! Главная загрузилась. Заголовок вкладки: '{driver.title}'")

    # ==========================================
    # 3. ПЕРЕХОД НА СТРАНИЦУ "ABOUT NIGERIA"
    # ==========================================
    print("Шаг 2: Ищем ссылку на раздел 'about-nigeria' и кликаем по ней...")

    # Ищем любую ссылку <a>, у которой в адресе (href) содержится текст 'about-nigeria'
    # Используем element_to_be_clickable — Selenium дождется, пока ссылка станет видимой и доступной для клика
    about_link = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href*='about-nigeria']"))
    )

    # Кликаем по найденной ссылке (как это сделал бы обычный пользователь)
    about_link.click()

    # Ждем, пока в адресной строке браузера появится 'about-nigeria'
    wait.until(EC.url_contains("about-nigeria"))

    # ПРОВЕРКА 2: Убеждаемся, что переход реально произошел
    assert "about-nigeria" in driver.current_url, "Ошибка: не удалось перейти на страницу About Nigeria!"
    print(f"Успех! Перешли на страницу: {driver.current_url}")

    # Небольшая пауза, чтобы ты глазами успел увидеть открытую страницу
    time.sleep(2)

    # ==========================================
    # 4. ВОЗВРАТ НА ГЛАВНУЮ СТРАНИЦУ
    # ==========================================
    print("Шаг 3: Возвращаемся обратно на главную через кнопку 'Назад' в браузере...")

    # Имитируем нажатие стрелки "Назад" в левом верхнем углу браузера
    driver.back()

    # Ждем, пока URL снова станет равен главной странице (пропадет 'about-nigeria')
    wait.until(EC.url_to_be(home_url))

    # ПРОВЕРКА 3: Убеждаемся, что мы действительно вернулись на главную
    assert driver.current_url == home_url, f"Ошибка: после возврата открыт {driver.current_url} вместо {home_url}"
    print("Тест полностью пройден! Навигация туда и обратно работает корректно.")

finally:
    # ==========================================
    # 5. ЗАВЕРШЕНИЕ РАБОТЫ
    # ==========================================
    # Блок finally выполнится в любом случае, даже если тест упадет с ошибкой посередине
    time.sleep(2)
    driver.quit()  # Корректно закрываем браузер и освобождаем памятьй