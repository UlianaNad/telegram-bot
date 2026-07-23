import { InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { ChildKeyboardItem } from "./child.types.js";
import { VisitCardStatus } from "../visit/visit.types.js";

export function createChildKeyboard(
    children: ChildKeyboardItem[]
): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    for (const child of children) {
        keyboard
            .text(
                `${child.firstName}   №${String(child.cardNumber).padStart(4, "0")}`,
                `${CALLBACKS.CHILD.CARD}:${child.id}`
            )
            .row();
    }

    keyboard
        .text("➕ Додати дитину", CALLBACKS.CHILD.ADD)
        .row()
        .text("⬅ Назад", CALLBACKS.CHILD.BACK);

    return keyboard;
}

interface ChildCardKeyboardOptions {
    childId: string;
    isEmployee: boolean;
    visitStatus: VisitCardStatus;
    activeVisitId?: string;
}

export function createChildCardKeyboard(options: ChildCardKeyboardOptions): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    if (options.isEmployee) {
        if (options.visitStatus === "ACTIVE" && options.activeVisitId) {
            keyboard.text("🏁 Завершити візит", `${CALLBACKS.VISIT.FINISH}:${options.activeVisitId}`).row();
        }
        keyboard.text("⬅ Назад", CALLBACKS.ADMIN.BACK);
    } else {
        if (options.visitStatus === "NONE") {
            keyboard.text("▶ Почати візит", `${CALLBACKS.VISIT.START}:${options.childId}`).row();
        }
        keyboard.text("👨‍👩‍👧 Батьки", `${CALLBACKS.CHILD.PARENTS}:${options.childId}`).row();
        keyboard.text("⬅ Назад", CALLBACKS.HOME.CHILDREN);
    }

    return keyboard;
}

export function createChildParentsKeyboard(childId: string, isOwner: boolean): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    if (isOwner) {
        keyboard.text("➕ Додати батька/матір", `${CALLBACKS.CHILD.PARENTS_ADD}:${childId}`).row();
    }

    keyboard.text("⬅ Назад", `${CALLBACKS.CHILD.CARD}:${childId}`);

    return keyboard;
}