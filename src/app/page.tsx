import { currentUser } from "@clerk/nextjs/server";
import { createUser, getUserByClerkId } from "./actions";

export default async function Home() {
    const user = await currentUser();
    let existingUser = await getUserByClerkId(user?.id || "");
    if (!existingUser) {
        existingUser = await createUser({
            clerkId: user?.id || "",
            email: user?.emailAddresses[0].emailAddress || "",
            name: user?.firstName || user?.lastName || "",
        });
    }
    return (
        <div className="px-4 md:px-6 max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Welcome to Webtoon Track</h1>
            <p className="text-lg text-muted-foreground">
                Track your favorite webtoons and get notified when new episodes
                are released.
            </p>
        </div>
    );
}
