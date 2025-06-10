import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Webtoon Track</h1>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
            </div>
        </header>
    );
}
