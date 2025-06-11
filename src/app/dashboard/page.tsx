import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, getWebtoons } from "../actions";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const user = await currentUser();
    if (!user) redirect("/");
    const existingUser = await getUserByClerkId(user.id);
    if (!existingUser) redirect("/");
    const initialWebtoons = await getWebtoons(existingUser.id);

    return (
        <DashboardClient
            initialWebtoons={initialWebtoons}
            authorId={existingUser.id}
        />
    );
}
