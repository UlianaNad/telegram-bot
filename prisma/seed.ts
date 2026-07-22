import { prisma } from "../src/database/prisma.js";

async function main() {
    await prisma.settings.upsert({
        where: { id: "global" },
        update: {},
        create: {
            id: "global",
            priceFirst30MinutesCents: 10000, 
            priceNext10MinutesCents: 5000,  
            freeVisitEvery: 10,             // кожен 10-й візит безкоштовний — заміни на реальне значення
            currency: "UAH",
        },
    });

    console.log("Settings seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });