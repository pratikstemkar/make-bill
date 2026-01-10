"use client";

import { Page, PageSize, PageOrientation, PAGE_SIZES, getPageDimensions } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
                    <Select
                        value={page.size}
                        onValueChange={(value) => handleSizeChange(value as PageSize)}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                            <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                            <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                            <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                            <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orientation */}
                <div>
                    <Label className="text-xs mb-1">Orientation</Label>
                    <ToggleGroup
                        type="single"
                        value={page.orientation}
                        onValueChange={(value) => {
                            if (value) handleOrientationChange(value as PageOrientation);
                        }}
                        className="grid grid-cols-2"
                    >
                        <ToggleGroupItem
                            value="portrait"
                            className="h-9 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            Portrait
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="landscape"
                            className="h-9 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            Landscape
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Margin */}
                <div>
                    <Label className="text-xs mb-1">Margin (px)</Label>
                    <Input
                        type="number"
                        value={page.margin}
                        onChange={(e) => onUpdate({ margin: Number(e.target.value) })}
                        className="h-9 text-sm"
                        min={0}
                        max={50}
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
