const DEFAULT_COUNTRY_CODE = "380"; // Україна

/**
 * Приводить номер до єдиного формату: лише цифри, з кодом країни,
 * без "+" і без місцевого "0" на початку.
 * "0991234567"    -> "380991234567"
 * "+380991234567" -> "380991234567"
 * "380991234567"  -> "380991234567" (без змін — так віддає Telegram-контакт)
 */
export function normalizePhone(raw: string): string {
    const trimmed = raw.trim();
    let digits = trimmed.replace(/\D/g, "");

    if (digits.startsWith("0")) {
        digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
    }

    return digits;
}