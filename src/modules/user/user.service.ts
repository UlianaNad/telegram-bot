import { 
    findUserByTelegramId,
    createUser
} from "./user.repository.js";

import { User } from "grammy/types";

export async function findOrCreateUser(telegramUser: User) {
    const telegramId = BigInt(telegramUser.id);

    const existingUser = await findUserByTelegramId(telegramId);

    if (existingUser) {
        return existingUser;
    }

    return createUser({
        telegramId,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
    });
}