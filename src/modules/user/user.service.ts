import { 
    findUserByTelegramId,
    createUser
} from "./user.repository.js";


type CreateUserData = {
    telegramId: bigint;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
};

export async function findOrCreateUser(data: CreateUserData) {
      const existingUser = await findUserByTelegramId(data.telegramId);

    if (existingUser) {
        return existingUser;
    }

    return createUser(data);
}