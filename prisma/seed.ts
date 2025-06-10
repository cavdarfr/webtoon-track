import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    // Seed users with webtoons
    const users = [
        {
            clerkId: "clerk_123",
            email: "user1@example.com",
            name: "Demo User 1",
            webtoons: [
                {
                    title: "Tower of God",
                    url: "https://www.webtoons.com/en/fantasy/tower-of-god/list?title_no=95",
                    status: "reading",
                    createdAt: new Date("2023-01-01T10:00:00Z"),
                },
                {
                    title: "Lore Olympus",
                    url: "https://www.webtoons.com/en/romance/lore-olympus/list?title_no=1320",
                    status: "completed",
                    createdAt: new Date("2023-02-01T12:00:00Z"),
                },
            ],
        },
        {
            clerkId: "clerk_456",
            email: "user2@example.com",
            name: "Demo User 2",
            webtoons: [
                {
                    title: "Unordinary",
                    url: "https://www.webtoons.com/en/action/unordinary/list?title_no=679",
                    status: "reading",
                    createdAt: new Date("2023-03-01T15:00:00Z"),
                },
                {
                    title: "Let's Play",
                    url: "https://www.webtoons.com/en/romance/letsplay/list?title_no=1218",
                    status: "on-hold",
                    createdAt: new Date("2023-04-01T18:00:00Z"),
                },
            ],
        },
    ];

    for (const userData of users) {
        await prisma.user.create({
            data: {
                clerkId: userData.clerkId,
                email: userData.email,
                name: userData.name,
                webtoons: {
                    create: userData.webtoons,
                },
            },
        });
    }

    console.log("Seeded users with webtoons");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
