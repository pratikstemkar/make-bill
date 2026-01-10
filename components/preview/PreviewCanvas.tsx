"use client";

import { Element, Page } from "@/lib/types";
import { PreviewElementRenderer } from "./PreviewElementRenderer";
import { repositionElements } from "@/lib/elementLayout";

interface PreviewCanvasProps {
    elements: Element[];
    page: Page;
    data: any;
}

export function PreviewCanvas({ elements, page, data }: PreviewCanvasProps) {
    // Reposition elements based on their dynamic heights to prevent overlaps
    const repositionedElements = repositionElements(elements, data);

    return (
        <div>
            <div
                className="inline-block relative bg-background select-none"
                style={{
                    width: `${page.width}px`,
                    minHeight: `${page.height}px`,
                }}
            >
                {/* Margin guides */}
                <div
                    className="absolute border-2 border-dashed border-muted-foreground/20 pointer-events-none"
                    style={{
                        top: page.margin,
                        left: page.margin,
                        right: page.margin,
                        bottom: page.margin,
                        width: `${page.width - page.margin * 2}px`,
                        height: `${page.height - page.margin * 2}px`,
                    }}
                />

                {repositionedElements.map((element) => (
                    <PreviewElementRenderer
                        key={element.id}
                        element={element}
                        page={page}
                        data={data}
                    />
                ))}
            </div>
        </div>
    );
}
