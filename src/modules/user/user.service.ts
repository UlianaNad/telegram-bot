import { 
    findUserByTelegramId,
    createUser
} from "./user.repository.js";

//import { User } from "grammy/types";

type CreateUserData = {
    telegramId: bigint;
    firstName?: string;
    lastName?: string;
    username?: string;
};

export async function findOrCreateUser(data: CreateUserData) {
      const existingUser = await findUserByTelegramId(data.telegramId);

    if (existingUser) {
        return existingUser;
    }

    return createUser(data);
}