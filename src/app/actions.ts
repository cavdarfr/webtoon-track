"use server";
import prisma from "../lib/prisma";

// USER CRUD
export async function createUser({
    clerkId,
    email,
    name,
}: {
    clerkId: string;
    email: string;
    name?: string;
}) {
    return prisma.user.create({
        data: { clerkId, email, name },
    });
}

export async function getUsers() {
    return prisma.user.findMany({ include: { webtoons: true } });
}

export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } });
}

export async function updateUser(
    id: string,
    data: { name?: string; email?: string }
) {
    return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
    // Delete webtoons first due to required relation
    await prisma.webtoon.deleteMany({ where: { authorId: id } });
    return prisma.user.delete({ where: { id } });
}

// WEBTOON CRUD
export async function createWebtoon({
    title,
    url,
    status,
    authorId,
    tags,
    image,
}: {
    title: string;
    url?: string;
    status?: string;
    authorId: string;
    tags?: string[];
    image?: string;
}) {
    return prisma.webtoon.create({
        data: {
            title,
            url,
            status,
            authorId,
            image,
            ...(tags ? { tags: { set: tags } } : {}),
        },
    });
}

export async function getWebtoons(authorId: string) {
    return prisma.webtoon.findMany({
        where: { authorId },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateWebtoon(
    id: string,
    data: {
        title?: string;
        url?: string;
        status?: string;
        tags?: string[];
        image?: string;
    }
) {
    const { tags, ...rest } = data;
    return prisma.webtoon.update({
        where: { id },
        data: {
            ...rest,
            ...(tags ? { tags: { set: tags } } : {}),
        },
    });
}

export async function deleteWebtoon(id: string) {
    return prisma.webtoon.delete({ where: { id } });
}
