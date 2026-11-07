def calculator():
    print("Простой калькулятор на Python")
    print("Доступные операции: +, -, *, /")
    print("Для выхода из программы введите 'q'")

    while True:
        # Ввод первого числа
        num1_str = input("\nВведите первое число: ")
        if num1_str.lower() == 'q':
            print("До свидания!")
            break

        # Ввод оператора
        operator = input("Введите оператор (+, -, *, /): ")
        if operator.lower() == 'q':
            print("До свидания!")
            break

        # Ввод второго числа
        num2_str = input("Введите второе число: ")
        if num2_str.lower() == 'q':
            print("До свидания!")
            break

        # Проверка, что введены именно числа, а не буквы
        try:
            num1 = float(num1_str)
            num2 = float(num2_str)
        except ValueError:
            print("Ошибка: пожалуйста, вводите только числа!")
            continue

        # Вычисления в зависимости от оператора
        if operator == '+':
            result = num1 + num2
            print(f"Результат: {num1} + {num2} = {result}")
        elif operator == '-':
            result = num1 - num2
            print(f"Результат: {num1} - {num2} = {result}")
        elif operator == '*':
            result = num1 * num2
            print(f"Результат: {num1} * {num2} = {result}")
        elif operator == '/':
            if num2 == 0:
                print("Ошибка: деление на ноль невозможно!")
            else:
                result = num1 / num2
                print(f"Результат: {num1} / {num2} = {result}")
        else:
            print("Ошибка: неверный оператор! Используйте +, -, *, /")


# Запуск калькулятора
if __name__ == "__main__":
    calculator()