import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Home() {
    // Read all users and their webtoons
    const users = await prisma.user.findMany({
        include: { webtoons: true },
    });

    // Server actions for CRUD
    async function createUser() {
        "use server";
        await prisma.user.create({
            data: {
                clerkId: `clerk_${Date.now()}`,
                email: `user${Date.now()}@example.com`,
                name: `User ${Date.now()}`,
            },
        });
        revalidatePath("/");
    }

    async function deleteFirstUser() {
        "use server";
        const first = await prisma.user.findFirst();
        if (first) {
            // Delete all webtoons for this user first
            await prisma.webtoon.deleteMany({ where: { authorId: first.id } });
            // Now delete the user
            await prisma.user.delete({ where: { id: first.id } });
            revalidatePath("/");
        }
    }

    async function updateFirstUser() {
        "use server";
        const first = await prisma.user.findFirst();
        if (first) {
            await prisma.user.update({
                where: { id: first.id },
                data: { name: `Updated ${Date.now()}` },
            });
            revalidatePath("/");
        }
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Prisma CRUD Test</h1>
            <form action={createUser}>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Create User
                </button>
            </form>
            <form action={updateFirstUser}>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Update First User
                </button>
            </form>
            <form action={deleteFirstUser}>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Delete First User
                </button>
            </form>
            <div>
                <h2 className="text-xl font-semibold mb-2">Users & Webtoons</h2>
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.id} className="border p-2 rounded">
                            <div>
                                <b>{user.name}</b> ({user.email})
                            </div>
                            <div className="ml-4 text-sm text-gray-600">
                                Webtoons:
                                <ul className="list-disc ml-6">
                                    {user.webtoons.map((w) => (
                                        <li key={w.id}>
                                            {w.title} ({w.status})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
