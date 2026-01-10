"use client";

import { Element, TextElement, LineElement, TableElement, ImageElement } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
                    <select
                        value={element.fontWeight}
                        onChange={(e) =>
                            onUpdate({ fontWeight: e.target.value as "normal" | "bold" })
                        }
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                    </select>
                </div>
            </div>

            <div>
                <Label className="text-xs">Alignment</Label>
                <select
                    value={element.align}
                    onChange={(e) =>
                        onUpdate({ align: e.target.value as "left" | "center" | "right" })
                    }
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
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
    const handleImageUrlChange = (url: string) => {
        onUpdate({ src: url });

        // Load image to get natural dimensions
        if (url.trim()) {
            const img = new Image();
            img.onload = () => {
                // Calculate natural aspect ratio
                const naturalAspectRatio = img.naturalWidth / img.naturalHeight;

                // Keep current width, adjust height to match aspect ratio
                const newHeight = element.width / naturalAspectRatio;

                onUpdate({
                    src: url,
                    height: newHeight,
                    naturalAspectRatio: naturalAspectRatio,
                });
            };
            img.onerror = () => {
                // Just update the URL if image fails to load
                console.warn("Failed to load image:", url);
            };
            img.src = url;
        }
    };

    const handleAspectRatioToggle = (checked: boolean) => {
        onUpdate({ maintainAspectRatio: checked });

        // If checking the box and we have a natural aspect ratio, snap to it immediately
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

            <div>
                <Label className="text-xs">Image URL</Label>
                <Input
                    value={element.src}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="h-8 text-xs"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={element.maintainAspectRatio !== false}
                    onChange={(e) => handleAspectRatioToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="maintainAspectRatio" className="text-xs cursor-pointer">
                    Maintain aspect ratio on resize
                </Label>
            </div>
        </div>
    );
}
