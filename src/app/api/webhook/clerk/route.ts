import { createUser, getUserByClerkId } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { event } = await request.json();

    console.log(event, "event from clerk webhook");
    if (event.type === "user.created") {
        const user = event.data;
        const existingUser = await getUserByClerkId(user.id);
        if (!existingUser) {
            await createUser({
                clerkId: user.id,
                email: user.email_addresses[0].email_address,
                name: user.first_name || user.full_name || "Unknown",
            });
        }
    }
    return NextResponse.json({ message: "Webhook received" });
}
