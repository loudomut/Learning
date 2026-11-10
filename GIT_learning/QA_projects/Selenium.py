from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# 1. Настраиваем опции для обхода детектирования роботов
options = Options()
options.add_argument("--disable-blink-features=AutomationControlled")  # Убирает флаг automation
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

# Запускаем браузер с настройками
driver = webdriver.Chrome(options=options)

try:
    driver.get("https://www.google.com")

    search_box = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "q"))
    )

    search_box.send_keys("Selenium Python automation")
    search_box.send_keys(Keys.RETURN)

    WebDriverWait(driver, 10).until(
        EC.title_contains("Selenium Python automation")
    )

    assert "Selenium Python automation" in driver.title, "Заголовок страницы не совпадает!"
    print("Тест успешно пройден: поиск отработал, нужная страница открылась.")

finally:
    time.sleep(3)
    driver.quit()