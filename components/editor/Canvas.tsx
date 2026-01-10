"use client";

import { Element, Page } from "@/lib/types";
import { ElementRenderer } from "./ElementRenderer";

interface CanvasProps {
    elements: Element[];
    selectedId: string | null;
    page: Page;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<Element>) => void;
    onAddElement: (element: Element) => void;
}

export function Canvas({
    elements,
    selectedId,
    page,
    onSelectElement,
    onUpdateElement,
    onAddElement,
}: CanvasProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const elementType = e.dataTransfer.getData("elementType");

        if (!elementType) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create new element based on type
        const baseElement = {
            id: `element-${Date.now()}`,
            x: Math.max(0, x - 50),
            y: Math.max(0, y - 25),
            width: 200,
            height: 40,
        };

        let newElement: Element;

        switch (elementType) {
            case "text":
                newElement = {
                    ...baseElement,
                    type: "text",
                    content: "Sample Text",
                    fontSize: 14,
                    fontWeight: "normal",
                    align: "left",
                };
                break;
            case "image":
                newElement = {
                    ...baseElement,
                    type: "image",
                    src: "",
                    maintainAspectRatio: true,
                };
                break;
            case "line":
                newElement = {
                    ...baseElement,
                    type: "line",
                    height: 2,
                    thickness: 1,
                };
                break;
            case "table":
                newElement = {
                    ...baseElement,
                    type: "table",
                    height: 100, // Default height for table
                    columns: ["Item", "Quantity", "Price"],
                };
                break;
            default:
                return;
        }

        onAddElement(newElement);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-full h-full p-8 bg-muted/30 overflow-auto">
            <div
                className="inline-block relative bg-background shadow-2xl border border-border select-none"
                style={{
                    width: `${page.width}px`,
                    height: `${page.height}px`,
                    minWidth: `${page.width}px`,
                    minHeight: `${page.height}px`,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => onSelectElement(null)}
            >
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern
                                id="grid"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 20 0 L 0 0 0 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Margin guides */}
                <div
                    className="absolute border border-dashed border-primary/30 pointer-events-none"
                    style={{
                        left: `${page.margin}px`,
                        top: `${page.margin}px`,
                        right: `${page.margin}px`,
                        bottom: `${page.margin}px`,
                    }}
                />

                {/* Elements */}
                {elements.map((element) => (
                    <ElementRenderer
                        key={element.id}
                        element={element}
                        isSelected={element.id === selectedId}
                        page={page}
                        onSelect={() => onSelectElement(element.id)}
                        onUpdate={(updates: Partial<Element>) => onUpdateElement(element.id, updates)}
                    />
                ))}
            </div>
        </div>
    );
}
