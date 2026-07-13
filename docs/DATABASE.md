# DATABASE.md

> Структура бази даних PlayRoom CRM

---

# Загальна схема

```text
                User
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
    ChildAccess       AuditLog
          │
          ▼
        Child
          │
          ▼
        Visit

       Settings
```

---

# User

Будь-який користувач системи.

## Типи

- PARENT
- EMPLOYEE

## UserType

```text
PARENT
EMPLOYEE
```

---

## EmployeeRole

```text
ADMIN
SUPER_ADMIN
```

### ADMIN

Може:

- знаходити картки;
- починати відвідування;
- завершувати відвідування;
- переглядати статистику за день.

---

### SUPER_ADMIN

Успадковує всі права ADMIN.

Додатково може:

- переглядати всіх клієнтів;
- переглядати всі картки;
- переглядати доходи;
- керувати адміністраторами;
- змінювати налаштування системи.
---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Унікальний ідентифікатор користувача |
| telegramId | BigInt | — | Telegram ID користувача |
| phone | String | — | Номер телефону |
| firstName | String | — | Ім'я |
| lastName | String? | null | Прізвище |
| userType | Enum | — | Тип користувача: PARENT або EMPLOYEE |
| employeeRole | Enum? | null | Роль працівника (ADMIN або SUPER_ADMIN). Для PARENT завжди null |
| createdAt | DateTime | now() | Дата створення |
| updatedAt | DateTime | auto | Дата останнього оновлення |

---

## Зв'язки

```text
User
 │
 ├───< ChildAccess
 └───< AuditLog
```

---

# Child

Картка дитини.

---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Унікальний ідентифікатор картки |
| cardNumber | String | — | Унікальний номер віртуальної картки (FP-1001) |
| firstName | String | — | Ім'я дитини |
| lastName | String? | null | Прізвище дитини |
| birthday | Date | — | Дата народження |
| totalVisits | Int | 0 | Загальна кількість завершених відвідувань (платних і безкоштовних) |
| loyaltyVisits | Int | 0 | Лічильник платних відвідувань у поточному циклі програми лояльності |
| freeVisitBalance | Int | 0 | Кількість доступних безкоштовних годин |
| freeVisitsUsed | Int | 0 | Загальна кількість використаних безкоштовних годин |
| isArchived | Boolean | false | Ознака архівної картки |
| createdAt | DateTime | now() | Дата створення картки |
| updatedAt | DateTime | auto | Дата останнього оновлення |

---

## cardNumber

Приклад

```text
FP-1001
FP-1002
FP-1003
```

---

## Зв'язки

```text
Child
 │
 ├───< Visit
 └───< ChildAccess
```

---

# ChildAccess

Зв'язує дитину та її батьків.

---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Унікальний ідентифікатор зв'язку |
| childId | String | — | Посилання на дитину |
| userId | String | — | Посилання на користувача |
| role | Enum | OWNER | Роль користувача для цієї дитини |
| createdAt | DateTime | now() | Дата створення зв'язку |

---

## Role

```text
OWNER
SECOND_PARENT
```

---

# Visit

Відвідування дитини.

---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Унікальний ідентифікатор відвідування |
| childId | String | — | Посилання на картку дитини |
| status | Enum | WAITING_ADMIN | Поточний статус відвідування |
| startTime | DateTime? | null | Час початку відвідування |
| endTime | DateTime? | null | Час завершення відвідування |
| duration | Int | 0 | Тривалість відвідування у хвилинах |
| totalPrice | Decimal | 0 | Підсумкова вартість |
| isFreeVisit | Boolean | false | Чи використано безкоштовну годину |
| requestedByUserId | String | — | Користувач, який натиснув «Почати візит» |
| startedByAdminId | String? | null | Адміністратор, який підтвердив початок |
| finishedByAdminId | String? | null | Адміністратор, який завершив відвідування |
| createdAt | DateTime | now() | Дата створення |
| updatedAt | DateTime | auto | Дата останнього оновлення |

---

## VisitStatus

```text
WAITING_ADMIN

ACTIVE

FINISHED

PAID
```

---

## Життєвий цикл

```text
WAITING_ADMIN
      │
      ▼
ACTIVE
      │
      ▼
FINISHED
      │
      ▼
PAID
```

---

# Settings

Налаштування всієї ігрової кімнати.

У базі існує лише один запис.

---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Ідентифікатор |
| roomName | String | — | Назва ігрової кімнати |
| address | String | — | Адреса |
| phone | String | — | Контактний телефон |
| first30MinutesPrice | Decimal | 100 | Вартість перших 30 хвилин |
| next10MinutesPrice | Decimal | 35 | Вартість кожних наступних 10 хвилин |
| freeVisitEvery | Int | 10 | Кількість платних відвідувань до бонусу |
| freeVisitMinutes | Int | 60 | Тривалість безкоштовної години |
| workStart | String | 09:00 | Початок роботи |
| workEnd | String | 20:00 | Закінчення роботи |
| createdAt | DateTime | now() | Дата створення |
| updatedAt | DateTime | auto | Дата останнього оновлення |

---

# AuditLog

Журнал усіх змін у системі.

---

## Поля

| Поле | Тип | Default | Опис |
|------|-----|---------|------|
| id | String | UUID | Ідентифікатор запису |
| userId | String | — | Хто виконав дію |
| action | String | — | Назва дії |
| entity | String | — | Над якою сутністю виконано дію |
| entityId | String | — | ID сутності |
| createdAt | DateTime | now() | Дата виконання |

---

# Бізнес-правила


## User

- кожен користувач має один UserType;
- якщо userType = PARENT, то employeeRole = null;
- якщо userType = EMPLOYEE, то employeeRole обов'язковий;
- employeeRole визначає права працівника.

---

## Child

- одна дитина має одну віртуальну картку;
- номер картки унікальний;
- картка не видаляється фізично;
- використовується `isArchived`.

---

## ChildAccess

- один PARENT може мати багато дітей;
- одна дитина може мати кількох PARENT;
- OWNER може редагувати картку;
- SECOND_PARENT має ті самі права, окрім видалення зв'язку (за потреби це правило можна змінити).

---

## Visit

- одночасно може існувати лише один ACTIVE-візит для однієї дитини;
- новий візит створюється зі статусом WAITING_ADMIN;
- адміністратор переводить його в ACTIVE;
- після завершення статус змінюється на FINISHED;
- після оплати — PAID.

---

## Програма лояльності

### Платний візит

Після завершення платного візиту:

- totalVisits += 1;
- loyaltyVisits += 1.

Якщо:

```text
loyaltyVisits == freeVisitEvery
```

то:

- freeVisitBalance += 1;
- loyaltyVisits = 0.

### Безкоштовний візит

Якщо `freeVisitBalance > 0`:

- перші 60 хвилин безкоштовні;
- після завершення:
  - totalVisits += 1;
  - freeVisitBalance -= 1;
  - freeVisitsUsed += 1.

---

# Індекси

## User

- telegramId (Unique)
- phone

## Child

- cardNumber (Unique)
- firstName

## Visit

- childId
- status

## ChildAccess

- childId
- userId

## AuditLog

- userId