"use client";

import { Element, TextElement, LineElement, TableElement, ImageElement, Page } from "@/lib/types";
import { useState, useRef, useEffect } from "react";

interface ElementRendererProps {
    element: Element;
    isSelected: boolean;
    page: Page;
    onSelect: () => void;
    onUpdate: (updates: Partial<Element>) => void;
}

export function ElementRenderer({
    element,
    isSelected,
    page,
    onSelect,
    onUpdate,
}: ElementRendererProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains("resize-handle")) {
            setIsResizing(true);
        } else {
            setIsDragging(true);
        }
        setDragStart({ x: e.clientX, y: e.clientY });
        onSelect();
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;
                const newX = element.x + dx;
                const newY = element.y + dy;

                // Constrain to page boundaries
                onUpdate({
                    x: Math.max(0, Math.min(newX, page.width - element.width)),
                    y: Math.max(0, Math.min(newY, page.height - element.height)),
                });
                setDragStart({ x: e.clientX, y: e.clientY });
            } else if (isResizing) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                // Check if we need to maintain aspect ratio for images
                const isImage = element.type === "image";
                const imageEl = isImage ? element as ImageElement : null;
                const shouldMaintainAspect = imageEl?.maintainAspectRatio !== false;

                if (isImage && shouldMaintainAspect && imageEl?.naturalAspectRatio) {
                    // Use the image's natural aspect ratio, not current element dimensions
                    const aspectRatio = imageEl.naturalAspectRatio;
                    let newWidth = element.width + dx;
                    let newHeight = newWidth / aspectRatio;

                    // If height change is larger, use that instead
                    const heightBasedWidth = (element.height + dy) * aspectRatio;
                    if (Math.abs(dy) > Math.abs(dx)) {
                        newHeight = element.height + dy;
                        newWidth = heightBasedWidth;
                    }

                    // Constrain to page boundaries
                    onUpdate({
                        width: Math.max(50, Math.min(newWidth, page.width - element.x)),
                        height: Math.max(20, Math.min(newHeight, page.height - element.y)),
                    });
                } else {
                    // Normal resize (or image without natural aspect ratio stored)
                    const newWidth = element.width + dx;
                    const newHeight = element.height + dy;

                    onUpdate({
                        width: Math.max(50, Math.min(newWidth, page.width - element.x)),
                        height: Math.max(20, Math.min(newHeight, page.height - element.y)),
                    });
                }
                setDragStart({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragStart, element, onUpdate]);

    const renderContent = () => {
        switch (element.type) {
            case "text":
                const textEl = element as TextElement;
                const justifyMap = {
                    left: "flex-start",
                    center: "center",
                    right: "flex-end",
                };
                return (
                    <div
                        className="w-full h-full flex items-center px-2 text-foreground overflow-hidden"
                        style={{
                            fontSize: `${textEl.fontSize}px`,
                            fontWeight: textEl.fontWeight,
                            justifyContent: justifyMap[textEl.align],
                        }}
                    >
                        <span
                            className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                            style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                            }}
                        >
                            {textEl.binding ? `{{${textEl.binding}}}` : textEl.content}
                        </span>
                    </div>
                );

            case "line":
                const lineEl = element as LineElement;
                return (
                    <div
                        className="bg-foreground"
                        style={{
                            width: "100%",
                            height: `${lineEl.thickness}px`,
                        }}
                    />
                );

            case "table":
                const tableEl = element as TableElement;
                return (
                    <div className="w-full h-full overflow-hidden">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    {tableEl.columns.map((col, i) => (
                                        <th key={i} className="border border-border p-1 bg-muted">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {tableEl.columns.map((_, i) => (
                                        <td key={i} className="border border-border p-1">
                                            {tableEl.binding ? `{{${tableEl.binding}[i]}}` : "..."}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case "image":
                const imageEl = element as ImageElement;
                return (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        {imageEl.src ? (
                            <img
                                src={imageEl.src}
                                alt="Element"
                                className="max-w-full max-h-full object-contain"
                                draggable={false}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                                <span className="text-muted-foreground text-xs">[Image]</span>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={elementRef}
            className={`absolute cursor-move select-none ${isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                }`}
            style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            {renderContent()}

            {/* Dimension label */}
            {isSelected && (
                <div className="absolute -top-6 left-0 text-xs bg-primary text-primary-foreground px-1 rounded">
                    {Math.round(element.width)} × {Math.round(element.height)}
                </div>
            )}

            {/* Resize handle */}
            {isSelected && (
                <div className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize" />
            )}
        </div>
    );
}
