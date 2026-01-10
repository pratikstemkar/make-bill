"use client";

import { Type, Image, Minus, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

const ELEMENT_TYPES = [
    { type: "text", icon: Type, label: "Text" },
    { type: "table", icon: Table, label: "Table" },
    { type: "image", icon: Image, label: "Image" },
    { type: "line", icon: Minus, label: "Line" },
];

export function ElementToolbar() {
    const handleDragStart = (e: React.DragEvent, type: string) => {
        e.dataTransfer.setData("elementType", type);
    };

    return (
        <div className="h-full bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Elements
            </h2>
            <div className="space-y-2">
                <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, "text")}
                    className="w-full flex items-center gap-2 p-3 border border-border rounded-md cursor-move hover:bg-muted transition"
                >
                    <Type className="w-4 h-4" />
                    <span className="text-sm">Text</span>
                </button>
                <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, "table")}
                    className="w-full flex items-center gap-2 p-3 border border-border rounded-md cursor-move hover:bg-muted transition"
                >
                    <Table className="w-4 h-4" />
                    <span className="text-sm">Table</span>
                </button>
                <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, "image")}
                    className="w-full flex items-center gap-2 p-3 border border-border rounded-md cursor-move hover:bg-muted transition"
                >
                    <Image className="w-4 h-4" />
                    <span className="text-sm">Image</span>
                </button>
                <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, "line")}
                    className="w-full flex items-center gap-2 p-3 border border-border rounded-md cursor-move hover:bg-muted transition"
                >
                    <Minus className="w-4 h-4" />
                    <span className="text-sm">Line</span>
                </button>
            </div>
        </div>
    );
}
