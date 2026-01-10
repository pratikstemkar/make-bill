"use client";

import { Page, PageSize, PageOrientation, PAGE_SIZES, getPageDimensions } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface PageSettingsPanelProps {
    page: Page;
    onUpdate: (updates: Partial<Page>) => void;
}

export function PageSettingsPanel({ page, onUpdate }: PageSettingsPanelProps) {
    const handleSizeChange = (size: PageSize) => {
        const dims = getPageDimensions(size, page.orientation);
        onUpdate({
            size,
            width: dims.width,
            height: dims.height,
        });
    };

    const handleOrientationChange = (orientation: PageOrientation) => {
        const dims = getPageDimensions(page.size, orientation);
        onUpdate({
            orientation,
            width: dims.width,
            height: dims.height,
        });
    };

    return (
        <div className="border-b border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Page Settings
                </h3>
            </div>

            <div className="space-y-3">
                {/* Page Size */}
                <div>
                    <Label className="text-xs mb-1">Page Size</Label>
                    <select
                        value={page.size}
                        onChange={(e) => handleSizeChange(e.target.value as PageSize)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="Letter">Letter (8.5 × 11 in)</option>
                        <option value="Legal">Legal (8.5 × 14 in)</option>
                        <option value="A3">A3 (297 × 420 mm)</option>
                        <option value="A5">A5 (148 × 210 mm)</option>
                    </select>
                </div>

                {/* Orientation */}
                <div>
                    <Label className="text-xs mb-1">Orientation</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleOrientationChange("portrait")}
                            className={`cursor-pointer h-9 px-3 text-sm border rounded-md transition-colors ${page.orientation === "portrait"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-muted"
                                }`}
                        >
                            Portrait
                        </button>
                        <button
                            onClick={() => handleOrientationChange("landscape")}
                            className={`cursor-pointer h-9 px-3 text-sm border rounded-md transition-colors ${page.orientation === "landscape"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-muted"
                                }`}
                        >
                            Landscape
                        </button>
                    </div>
                </div>

                {/* Margin */}
                <div>
                    <Label className="text-xs mb-1">Margin (px)</Label>
                    <input
                        type="number"
                        value={page.margin}
                        onChange={(e) => onUpdate({ margin: Number(e.target.value) })}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        min="0"
                        max="50"
                    />
                </div>

                {/* Dimensions Display */}
                <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Canvas:</span>
                            <span className="font-mono">{page.width} × {page.height} px</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
