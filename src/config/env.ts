import "dotenv/config";

function getEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} is not defined.`);
    }

    return value;
}

export const env = {
    botToken: getEnv("BOT_TOKEN"),
};