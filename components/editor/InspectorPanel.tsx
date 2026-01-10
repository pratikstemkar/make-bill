"use client";

import { useState, useRef } from "react";
import { Element, TextElement, LineElement, TableElement, ImageElement } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api/images";
import { toast } from "sonner";

interface InspectorPanelProps {
    element: Element | null;
    onUpdate: (updates: Partial<Element>) => void;
    onDelete: () => void;
}

export function InspectorPanel({
    element,
    onUpdate,
    onDelete,
}: InspectorPanelProps) {
    if (!element) {
        return (
            <div className="h-full border-l border-border bg-card p-4">
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    Select an element to edit
                </div>
            </div>
        );
    }

    return (
        <div className="h-full border-l border-border bg-card p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Properties
                </h2>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    Delete
                </Button>
            </div>

            <div className="space-y-4">
                {/* Position and Size */}
                <div>
                    <h3 className="text-xs font-semibold mb-2">Position & Size</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">X</Label>
                            <Input
                                type="number"
                                value={Math.round(element.x)}
                                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Y</Label>
                            <Input
                                type="number"
                                value={Math.round(element.y)}
                                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Width</Label>
                            <Input
                                type="number"
                                value={Math.round(element.width)}
                                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Height</Label>
                            <Input
                                type="number"
                                value={Math.round(element.height)}
                                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Type-specific properties */}
                {element.type === "text" && (
                    <TextProperties element={element as TextElement} onUpdate={onUpdate} />
                )}

                {element.type === "line" && (
                    <LineProperties element={element as LineElement} onUpdate={onUpdate} />
                )}

                {element.type === "table" && (
                    <TableProperties element={element as TableElement} onUpdate={onUpdate} />
                )}

                {element.type === "image" && (
                    <ImageProperties element={element as ImageElement} onUpdate={onUpdate} />
                )}
            </div>
        </div>
    );
}

function TextProperties({
    element,
    onUpdate,
}: {
    element: TextElement;
    onUpdate: (updates: Partial<Element>) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold">Text Properties</h3>

            <div>
                <Label className="text-xs">Content</Label>
                <Input
                    value={element.content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    className="h-8 text-xs"
                />
            </div>

            <div>
                <Label className="text-xs">Binding (optional)</Label>
                <Input
                    value={element.binding || ""}
                    onChange={(e) => onUpdate({ binding: e.target.value })}
                    placeholder="e.g. invoice.total"
                    className="h-8 text-xs font-mono"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input
                        type="number"
                        value={element.fontSize}
                        onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                        className="h-8 text-xs"
                    />
                </div>
                <div>
                    <Label className="text-xs">Weight</Label>
                    <Select
                        value={element.fontWeight}
                        onValueChange={(value) =>
                            onUpdate({ fontWeight: value as "normal" | "bold" })
                        }
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="text-xs">Alignment</Label>
                <Select
                    value={element.align}
                    onValueChange={(value) =>
                        onUpdate({ align: value as "left" | "center" | "right" })
                    }
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function LineProperties({
    element,
    onUpdate,
}: {
    element: LineElement;
    onUpdate: (updates: Partial<Element>) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold">Line Properties</h3>
            <div>
                <Label className="text-xs">Thickness</Label>
                <Input
                    type="number"
                    value={element.thickness}
                    onChange={(e) => onUpdate({ thickness: Number(e.target.value) })}
                    className="h-8 text-xs"
                />
            </div>
        </div>
    );
}

function TableProperties({
    element,
    onUpdate,
}: {
    element: TableElement;
    onUpdate: (updates: Partial<Element>) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold">Table Properties</h3>

            <div>
                <Label className="text-xs">Columns (comma-separated)</Label>
                <Input
                    value={element.columns.join(", ")}
                    onChange={(e) =>
                        onUpdate({
                            columns: e.target.value.split(",").map((s) => s.trim()),
                        })
                    }
                    className="h-8 text-xs"
                />
            </div>

            <div>
                <Label className="text-xs">Data Binding</Label>
                <Input
                    value={element.binding || ""}
                    onChange={(e) => onUpdate({ binding: e.target.value })}
                    placeholder="e.g. invoice.items"
                    className="h-8 text-xs font-mono"
                />
            </div>
        </div>
    );
}

function ImageProperties({
    element,
    onUpdate,
}: {
    element: ImageElement;
    onUpdate: (updates: Partial<Element>) => void;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // Simulate progress while uploading
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const result = await uploadImage(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Load image to get dimensions
            const img = new window.Image();
            img.onload = () => {
                const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
                const newHeight = element.width / naturalAspectRatio;

                onUpdate({
                    src: result.url,
                    height: newHeight,
                    naturalAspectRatio: naturalAspectRatio,
                });
            };
            img.onerror = () => {
                onUpdate({ src: result.url });
            };
            img.src = result.url;

            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleRemoveImage = () => {
        onUpdate({ src: '' });
    };

    const handleAspectRatioToggle = (checked: boolean) => {
        onUpdate({ maintainAspectRatio: checked });

        if (checked && element.naturalAspectRatio) {
            const newHeight = element.width / element.naturalAspectRatio;
            onUpdate({
                maintainAspectRatio: checked,
                height: newHeight,
            });
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold">Image Properties</h3>

            {/* Upload Area */}
            <div>
                <Label className="text-xs mb-2 block">Image</Label>

                {element.src ? (
                    /* Image Preview */
                    <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
                        <img
                            src={element.src}
                            alt="Uploaded"
                            className="w-full h-24 object-contain"
                        />
                        {/* Upload Progress Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                                <Progress value={uploadProgress} className="h-1 w-3/4" />
                            </div>
                        )}
                        {/* Hover Actions */}
                        {!isUploading && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Replace
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Upload Drop Zone */
                    <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                            transition-colors
                            ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                            ${isUploading ? 'pointer-events-none opacity-50' : ''}
                        `}
                    >
                        {isUploading ? (
                            <div className="space-y-2">
                                <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                                <Progress value={uploadProgress} className="h-1" />
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">
                                    Click or drag image here
                                </p>
                            </>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="maintainAspectRatio"
                    checked={element.maintainAspectRatio !== false}
                    onCheckedChange={(checked) => handleAspectRatioToggle(checked === true)}
                />
                <Label htmlFor="maintainAspectRatio" className="text-xs cursor-pointer">
                    Maintain aspect ratio on resize
                </Label>
            </div>
        </div>
    );
}
