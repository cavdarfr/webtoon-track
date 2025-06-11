"use client";

import { Pencil, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { useState, useTransition } from "react";
import WebtoonForm from "@/components/WebtoonForm";
import { Badge } from "./ui/badge";

interface Webtoon {
    id: string;
    title: string;
    status: string | null;
    authorId: string;
    createdAt: Date;
    image: string | null;
    author?: {
        id: string;
        clerkId: string;
        email: string;
        name: string | null;
    };
    tags?: string[];
}

const STATUS_OPTIONS = [
    { value: "on-hold", label: "On Hold" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
    "on-hold": "bg-yellow-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
};

export default function WebtoonCard({
    webtoons,
    onDelete,
    onEdit,
}: {
    webtoons: Webtoon;
    onDelete: (id: string) => void;
    onEdit: (id: string, data: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(webtoons.title);
    const [status, setStatus] = useState(webtoons.status || "in-progress");
    const [isPending, startTransition] = useTransition();

    const handleEdit = (data: {
        title: string;
        status: string;
        tags?: string[];
        image?: string | null;
    }) => {
        startTransition(async () => {
            setOpen(false);
            onEdit(webtoons.id, data);
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this webtoon?")) {
            startTransition(async () => {
                onDelete(webtoons.id);
            });
        }
    };

    return (
        <div className="w-full h-fit bg-gray-100 p-4 rounded-lg shadow-md flex gap-4">
            {/* Image Section */}
            {webtoons.image && (
                <div className="flex justify-center items-center">
                    <div className="w-32 h-48 rounded-lg overflow-hidden border">
                        <img
                            src={webtoons.image}
                            alt={`${webtoons.title} cover`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 w-full">
                <h1 className="font-medium">{webtoons.title}</h1>
                <span
                    className={`${
                        STATUS_COLORS[
                            webtoons.status as keyof typeof STATUS_COLORS
                        ]
                    } rounded-full px-2 py-1 text-xs uppercase w-fit font-bold whitespace-nowrap`}
                >
                    {webtoons.status}
                </span>

                {/* Actions Buttons */}
                <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="secondary"
                                className="bg-gray-200 cursor-pointer hover:bg-gray-400"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Webtoon</DialogTitle>
                            </DialogHeader>
                            <WebtoonForm
                                initialValues={{
                                    title,
                                    status,
                                    tags: webtoons.tags || [],
                                    image: webtoons.image,
                                }}
                                onSubmit={handleEdit}
                                loading={isPending}
                                submitLabel="Save"
                                onCancel={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="destructive"
                        className="bg-red-500 cursor-pointer hover:bg-red-700"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            {webtoons.tags && (
                <div className="flex gap-2 mt-4 flex-wrap">
                    {webtoons.tags?.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
