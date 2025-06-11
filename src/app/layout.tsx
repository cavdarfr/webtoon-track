import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Webtoon Track",
    description: "Suivez vos webtoons préférés",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="fr">
                <body className={`${inter.className} antialiased`}>
                    <Header />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
