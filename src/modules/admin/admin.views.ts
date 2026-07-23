import { ChildKeyboardItem } from "../child/child.types.js";

export function createAdminHomeText(): string {
    return `
🏠 <b>Панель адміністратора</b>

Оберіть дію.
`;
}

export function createSearchResultsText(results: ChildKeyboardItem[]): string {
    if (results.length === 0) {
        return `
🔍 <b>Результати пошуку</b>

Нічого не знайдено.
`;
    }

    return `
🔍 <b>Результати пошуку</b>

Знайдено: ${results.length}
`;
}

function formatCents(cents: number, currency: string): string {
    return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function createTodayStatsText(stats: {
    totalVisits: number;
    paidVisits: number;
    freeVisits: number;
    revenueCents: number;
    activeCount: number;
    currency: string;
}): string {
    return `
📊 <b>Сьогодні</b>

Завершено візитів: ${stats.totalVisits}
 - платних: ${stats.paidVisits}
 - безкоштовних: ${stats.freeVisits}

Дохід: ${formatCents(stats.revenueCents, stats.currency)}

Зараз активно: ${stats.activeCount}
`;
}