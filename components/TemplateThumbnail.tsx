"use client";

import { Element, TextElement, LineElement, TableElement, ImageElement, Page } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface TemplateThumbnailProps {
    elements: Element[];
    page: Page;
}

export function TemplateThumbnail({ elements, page }: TemplateThumbnailProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState({ scale: 1, x: 0, y: 0 });

    useEffect(() => {
        const updateLayout = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current;

            const parentWidth = parent.clientWidth;
            const parentHeight = parent.clientHeight;

            if (parentWidth === 0 || parentHeight === 0) return;

            // Calculate scale to fit
            const scaleX = parentWidth / page.width;
            const scaleY = parentHeight / page.height;
            const scale = Math.min(scaleX, scaleY);

            // Calculate centering offsets
            const x = (parentWidth - page.width * scale) / 2;
            const y = (parentHeight - page.height * scale) / 2;

            setLayout({ scale, x, y });
        };

        updateLayout();

        const observer = new ResizeObserver(updateLayout);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [page.width, page.height]);

    const renderElement = (element: Element) => {
        // [Existing render logic remains same, but we can reuse it if we didn't touch it]
        // Since replace_file_content needs strict matching, I will include the switch case if I replace the whole function
        // Or I can target specific blocks. 
        // Given I'm changing state, effect, and render return, replacing the whole function body structure is safest.

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
                        key={element.id}
                        className="absolute flex items-center px-1 text-foreground overflow-hidden"
                        style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            fontSize: `${textEl.fontSize}px`,
                            fontWeight: textEl.fontWeight,
                            justifyContent: justifyMap[textEl.align],
                        }}
                    >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-full">
                            {textEl.binding ? `{{${textEl.binding}}}` : textEl.content}
                        </span>
                    </div>
                );

            case "line":
                const lineEl = element as LineElement;
                return (
                    <div
                        key={element.id}
                        className="absolute bg-foreground"
                        style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${lineEl.thickness}px`,
                        }}
                    />
                );

            case "table":
                const tableEl = element as TableElement;
                return (
                    <div
                        key={element.id}
                        className="absolute overflow-hidden bg-background"
                        style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                        }}
                    >
                        <table className="w-full text-[10px] border-collapse">
                            <thead>
                                <tr>
                                    {tableEl.columns.map((col, i) => (
                                        <th key={i} className="border border-border p-0.5 bg-muted">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2].map((row) => (
                                    <tr key={row}>
                                        {tableEl.columns.map((_, i) => (
                                            <td key={i} className="border border-border p-0.5">
                                                —
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "image":
                const imageEl = element as ImageElement;
                return (
                    <div
                        key={element.id}
                        className="absolute flex items-center justify-center overflow-hidden"
                        style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                        }}
                    >
                        {imageEl.src ? (
                            <img
                                src={imageEl.src}
                                alt=""
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full border border-dashed border-muted-foreground/30 bg-muted/20" />
                        )}
                    </div>
                );
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-white overflow-hidden"
        >
            <div
                style={{
                    width: page.width,
                    height: page.height,
                    transform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
                    transformOrigin: "0 0",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "white",
                    // padding: '1px', // obscure border scaling artifacts?
                }}
            >
                {elements.map(renderElement)}
            </div>
        </div>
    );
}
