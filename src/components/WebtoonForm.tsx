import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { DialogFooter, DialogClose } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import UploadFile from "./UploadFile";

interface WebtoonFormProps {
    initialValues: {
        title: string;
        status?: string;
        tags?: string[];
        image?: string | null;
    };
    onSubmit: (values: {
        title: string;
        status: string;
        tags?: string[];
        image?: string | null;
    }) => void;
    loading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const STATUS_OPTIONS = [
    { value: "on-hold", label: "On Hold" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function WebtoonForm({
    initialValues,
    onSubmit,
    loading = false,
    submitLabel = "Save",
    onCancel,
}: WebtoonFormProps) {
    const [title, setTitle] = useState(initialValues.title || "");
    const [status, setStatus] = useState(initialValues.status || "in-progress");
    const [tags, setTags] = useState<string[]>(initialValues.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [image, setImage] = useState<string | null>(
        initialValues.image || null
    );
    const prevLoading = useRef(loading);

    useEffect(() => {
        // If loading went from true to false and this is the Add form, reset
        if (prevLoading.current && !loading && submitLabel === "Add") {
            setTitle(initialValues.title || "");
            setStatus(initialValues.status || "in-progress");
            setTags(initialValues.tags || []);
            setTagInput("");
            setImage(initialValues.image || null);
        }
        prevLoading.current = loading;
    }, [loading, submitLabel, initialValues]);

    const handleImageChange = (newImage: string | null) => {
        setImage(newImage);
    };

    const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // If space is pressed, add tag
        if (value.endsWith(" ")) {
            const tag = value.trim().replace(/\s+/g, "");
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
            }
            setTagInput("");
        } else {
            setTagInput(value.replace(/\s/g, "")); // Remove spaces in input
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, status, tags, image });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
            />
            <select
                className="border rounded p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Image Upload Section */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                    Cover Image (Optional)
                </label>
                <UploadFile
                    onImageChange={handleImageChange}
                    initialImage={image}
                    maxSizeMB={0.1} // 100KB
                    accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <Input
                    value={tagInput}
                    onChange={handleTagInput}
                    placeholder="Add tag and press space"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const tag = tagInput.trim().replace(/\s+/g, "");
                            if (tag && !tags.includes(tag)) {
                                setTags([...tags, tag]);
                            }
                            setTagInput("");
                        }
                    }}
                />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : submitLabel}
                </Button>
                {onCancel && (
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                )}
            </DialogFooter>
        </form>
    );
}
