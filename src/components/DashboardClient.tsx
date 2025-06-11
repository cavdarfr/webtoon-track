"use client";
import WebtoonCard from "@/components/WebtoonCard";
import { createWebtoon, deleteWebtoon, updateWebtoon } from "@/app/actions";
import { useState, Suspense } from "react";
import { PlusIcon, Search } from "lucide-react";
import { Button } from "./ui/button";
import WebtoonForm from "./WebtoonForm";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface Webtoon {
    id: string;
    title: string;
    status: string | null;
    authorId: string;
    createdAt: Date;
    tags?: string[];
    image: string | null;
}

// Type for the edit data
interface WebtoonData {
    title: string;
    status?: string;
    url?: string;
    authorId?: string;
    tags?: string[];
    image?: string | null;
}

interface DashboardClientProps {
    initialWebtoons: Webtoon[];
    authorId: string;
}

export default function DashboardClient({
    initialWebtoons,
    authorId,
}: DashboardClientProps) {
    const [webtoons, setWebtoons] = useState<Webtoon[]>(initialWebtoons);
    const [addOpen, setAddOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (id: string) => {
        await deleteWebtoon(id);
        setWebtoons((prev: Webtoon[]) => prev.filter((w) => w.id !== id));
    };

    const handleEdit = async (id: string, data: WebtoonData) => {
        // Convert null to undefined for the action
        const actionData = {
            ...data,
            image: data.image === null ? undefined : data.image,
        };
        await updateWebtoon(id, actionData);
        setWebtoons((prev: Webtoon[]) =>
            prev.map((w) => (w.id === id ? { ...w, ...data } : w))
        );
    };

    const handleAdd = async (data: {
        title: string;
        status: string;
        tags?: string[];
        image?: string | null;
    }) => {
        setIsAdding(true);
        // Convert null to undefined for the action
        const actionData = {
            ...data,
            image: data.image === null ? undefined : data.image,
        };
        const newWebtoon = await createWebtoon({ ...actionData, authorId });
        setWebtoons((prev: Webtoon[]) => [...prev, newWebtoon]);
        setIsAdding(false);
        setAddOpen(false);
        setSearchTerm(""); // Clear search after adding
    };

    const handleAddWithSearch = () => {
        setAddOpen(true);
    };

    // Filter webtoons based on search term
    const filteredWebtoons = webtoons.filter((webtoon) =>
        webtoon.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasSearchResults = searchTerm && filteredWebtoons.length > 0;
    const showAddSuggestion = searchTerm && filteredWebtoons.length === 0;

    // Calculate stats from all webtoons (not filtered)
    const totalWebtoons = webtoons.length;
    const statusCounts = webtoons.reduce((acc, webtoon) => {
        const status = webtoon.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto flex-1 flex flex-col">
            <div className="w-full mb-8 flex flex-col items-start justify-start">
                <div className="flex items-center justify-between w-full mb-6">
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add Webtoon
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Webtoon</DialogTitle>
                            </DialogHeader>
                            <WebtoonForm
                                initialValues={{
                                    title: searchTerm,
                                    status: "in-progress",
                                    tags: [],
                                }}
                                onSubmit={handleAdd}
                                loading={isAdding}
                                submitLabel="Add"
                                onCancel={() => setAddOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Webtoons
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">
                                {totalWebtoons}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600">
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold text-blue-600">
                                {statusCounts["in-progress"] || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold text-green-600">
                                {statusCounts["completed"] || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-600">
                                On Hold
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold text-yellow-600">
                                {statusCounts["on-hold"] || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search webtoons or add new..."
                        className="pl-10"
                    />
                </div>

                {/* Search Results Info */}
                {hasSearchResults && (
                    <div className="mb-4 text-sm text-gray-600">
                        Found {filteredWebtoons.length} webtoon(s) matching "
                        {searchTerm}"
                    </div>
                )}

                {/* Add Suggestion */}
                {showAddSuggestion && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                            No webtoons found for "{searchTerm}"
                        </p>
                        <Button
                            onClick={handleAddWithSearch}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-100"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add "{searchTerm}" as new webtoon
                        </Button>
                    </div>
                )}
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {(searchTerm ? filteredWebtoons : webtoons).map(
                        (webtoon) => (
                            <WebtoonCard
                                key={webtoon.id}
                                webtoons={webtoon}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        )
                    )}
                </div>
            </Suspense>
        </div>
    );
}
