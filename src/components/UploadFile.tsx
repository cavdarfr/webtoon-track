"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

interface UploadFileProps {
    onImageChange?: (image: string | null) => void;
    initialImage?: string | null;
    maxSizeMB?: number;
    accept?: string;
    className?: string;
}

export default function UploadFile({
    onImageChange,
    initialImage,
    maxSizeMB = 0.1, // 100KB default
    accept = "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp",
    className = "",
}: UploadFileProps) {
    const maxSize = maxSizeMB * 1024 * 1024;

    const [
        { files, isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
        },
    ] = useFileUpload({
        accept,
        maxSize,
        onUpload: (uploadedFiles) => {
            if (uploadedFiles.length > 0 && onImageChange) {
                onImageChange(uploadedFiles[0].preview);
            }
        },
    });

    // Use either uploaded file or initial image
    const previewUrl = files[0]?.preview || initialImage || null;
    const fileName = files[0]?.file.name || null;

    const handleRemove = () => {
        if (files[0]) {
            removeFile(files[0].id);
        }
        if (onImageChange) {
            onImageChange(null);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="relative">
                {/* Drop area */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                >
                    <input
                        {...getInputProps()}
                        className="sr-only"
                        aria-label="Upload image file"
                    />
                    {previewUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <img
                                src={previewUrl}
                                alt={fileName || "Uploaded image"}
                                className="mx-auto max-h-full rounded object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                            <div
                                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                aria-hidden="true"
                            >
                                <ImageIcon className="size-4 opacity-60" />
                            </div>
                            <p className="mb-1.5 text-sm font-medium">
                                Drop your image here
                            </p>
                            <p className="text-muted-foreground text-xs mb-2">
                                Or drag from a website, or drag an image URL
                            </p>
                            <p className="text-muted-foreground text-xs">
                                SVG, PNG, JPG, GIF, WebP (max.{" "}
                                {maxSizeMB === 0.1 ? "100KB" : `${maxSizeMB}MB`}
                                )
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4"
                                onClick={openFileDialog}
                            >
                                <UploadIcon
                                    className="-ms-1 size-4 opacity-60"
                                    aria-hidden="true"
                                />
                                Select image
                            </Button>
                        </div>
                    )}
                </div>

                {previewUrl && (
                    <div className="absolute top-2 right-2">
                        <button
                            type="button"
                            className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                            onClick={handleRemove}
                            aria-label="Remove image"
                        >
                            <XIcon className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            {errors.length > 0 && (
                <div
                    className="text-destructive flex items-center gap-1 text-xs"
                    role="alert"
                >
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{errors[0]}</span>
                </div>
            )}
        </div>
    );
}
