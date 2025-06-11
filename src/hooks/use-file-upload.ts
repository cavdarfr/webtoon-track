import { useCallback, useState } from "react";

interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
}

interface UseFileUploadOptions {
    accept?: string;
    maxSize?: number;
    onUpload?: (files: FileWithPreview[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const { accept, maxSize = 100 * 1024, onUpload } = options; // Default 100KB

    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file type
            if (accept) {
                const acceptedTypes = accept
                    .split(",")
                    .map((type) => type.trim());
                const isValidType = acceptedTypes.some((type) => {
                    if (type.startsWith(".")) {
                        return file.name.toLowerCase().endsWith(type);
                    }
                    return file.type === type;
                });

                if (!isValidType) {
                    return "File type not supported. Please use PNG, WebP, JPG, JPEG, GIF, or SVG";
                }
            }

            // Check file size
            if (file.size > maxSize) {
                const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
                return `File size must be less than ${maxSizeMB}MB`;
            }

            return null;
        },
        [accept, maxSize]
    );

    const processFiles = useCallback(
        async (fileList: FileList | File[]) => {
            const newFiles: FileWithPreview[] = [];
            const newErrors: string[] = [];

            for (const file of Array.from(fileList)) {
                const error = validateFile(file);
                if (error) {
                    newErrors.push(error);
                    continue;
                }

                try {
                    const preview = await new Promise<string>(
                        (resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                                resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        }
                    );

                    newFiles.push({
                        id: Math.random().toString(36).substring(2),
                        file,
                        preview,
                    });
                } catch {
                    newErrors.push(`Failed to process ${file.name}`);
                }
            }

            setFiles([newFiles[0]]); // Only keep the first file (single file upload)
            setErrors(newErrors);

            if (newFiles.length > 0 && onUpload) {
                onUpload([newFiles[0]]);
            }
        },
        [validateFile, onUpload]
    );

    // Handle drag and drop from websites (URLs)
    const processImageUrl = useCallback(
        async (url: string) => {
            try {
                // Try to fetch with CORS proxy for external images
                let response;
                try {
                    response = await fetch(url, { mode: "cors" });
                } catch {
                    // If CORS fails, try with a proxy (you can add your own proxy service here)
                    console.warn("CORS blocked, using direct URL as fallback");
                    // For now, we'll use the URL directly as base64 won't work with CORS
                    setErrors([
                        "Could not load image: CORS restrictions. Try downloading the image first.",
                    ]);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();

                // Validate the blob is an image
                if (!blob.type.startsWith("image/")) {
                    setErrors(["Invalid file type. Please use an image file."]);
                    return;
                }

                // Create a File object from the blob
                const fileName = url.split("/").pop()?.split("?")[0] || "image";
                const file = new File([blob], fileName, { type: blob.type });

                await processFiles([file]);
            } catch (err) {
                console.error("Error loading image from URL:", err);
                setErrors([
                    "Failed to load image from URL. Try downloading the image first.",
                ]);
            }
        },
        [processFiles]
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            setErrors([]);

            // Check for image URLs from drag data (various formats)
            const imageUrl =
                e.dataTransfer.getData("text/uri-list") ||
                e.dataTransfer.getData("URL") ||
                e.dataTransfer.getData("text/plain");

            if (imageUrl) {
                // Clean the URL and validate
                const cleanUrl = imageUrl.trim().split("\n")[0]; // Take first line if multiple URLs
                if (
                    cleanUrl &&
                    (cleanUrl.startsWith("http") ||
                        cleanUrl.startsWith("https"))
                ) {
                    // Additional check: see if it looks like an image URL
                    const isLikelyImageUrl =
                        /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(
                            cleanUrl
                        ) ||
                        cleanUrl.includes("image") ||
                        cleanUrl.includes("photo") ||
                        cleanUrl.includes("img") ||
                        cleanUrl.includes("pic");

                    if (
                        isLikelyImageUrl ||
                        // Always try if it's a direct drag from uri-list or URL (not just text)
                        e.dataTransfer.getData("text/uri-list") ||
                        e.dataTransfer.getData("URL")
                    ) {
                        await processImageUrl(cleanUrl);
                        return;
                    }
                }
            }

            // Check for HTML content (when dragging images from web pages)
            const htmlData = e.dataTransfer.getData("text/html");
            if (htmlData) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlData, "text/html");
                const img = doc.querySelector("img");
                if (img && img.src) {
                    await processImageUrl(img.src);
                    return;
                }
            }

            // Handle file drops
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
                await processFiles(droppedFiles);
                return;
            }

            // If we reach here and had a URL that didn't look like an image, show helpful message
            if (
                imageUrl &&
                (imageUrl.startsWith("http") || imageUrl.startsWith("https"))
            ) {
                setErrors([
                    "URL does not appear to be an image. Please use a direct image link.",
                ]);
            }
        },
        [processFiles, processImageUrl]
    );

    const openFileDialog = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept || "";
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                processFiles(target.files);
            }
        };
        input.click();
    }, [accept, processFiles]);

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setErrors([]);
    }, []);

    const getInputProps = useCallback(
        () => ({
            type: "file" as const,
            accept: accept || "",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                    processFiles(e.target.files);
                }
            },
        }),
        [accept, processFiles]
    );

    return [
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
    ] as const;
}
