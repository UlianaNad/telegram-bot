import {
    findChildrenByUserId,
    createChildWithOwner,
} from "./child.repository.js";
import { ChildKeyboardItem } from "./child.types.js";

/**
 * Повертає дітей для відображення у клавіатурі.
 */
export async function getUserChildren(userId: string): Promise<ChildKeyboardItem[]> {
    const children = await findChildrenByUserId(userId);
    return children.map((child) => ({
        id: child.id,
        firstName: child.firstName,
        cardNumber: child.cardNumber,
    }));
}

/**
 * Створює нову дитину і одразу видає власнику (userId) доступ ролі OWNER.
 * Замінює стару createNewChild(): та не була атомарною (окремі
 * getLastCardNumber() + createChild()) і взагалі не створювала ChildAccess,
 * тож додана дитина була нікому не видима в "Мої діти".
 */
export async function addChild(
    userId: string,
    data: { firstName: string; birthDate: Date }
) {
    return createChildWithOwner({
        userId,
        firstName: data.firstName,
        birthDate: data.birthDate,
    });
}