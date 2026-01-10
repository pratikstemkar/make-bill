// Core types for the template engine

export type ElementType = "text" | "image" | "line" | "table";

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    minHeight?: number; // Minimum height, actual height may be larger based on content
}

export interface TextElement extends BaseElement {
    type: "text";
    content: string;
    fontSize: number;
    fontWeight: "normal" | "bold";
    align: "left" | "center" | "right";
    binding?: string; // e.g. "invoice.total"
}

export interface ImageElement extends BaseElement {
    type: "image";
    src: string;
    maintainAspectRatio?: boolean;
    naturalAspectRatio?: number; // width / height of the actual image
}


export interface LineElement extends BaseElement {
    type: "line";
    thickness: number;
}

export interface TableElement extends BaseElement {
    type: "table";
    columns: string[];
    binding?: string; // e.g. "invoice.items"
}

export type Element = TextElement | ImageElement | LineElement | TableElement;

export type PageOrientation = "portrait" | "landscape";

export type PageSize = "A4" | "Letter" | "Legal" | "A3" | "A5";

export interface Page {
    width: number;
    height: number;
    margin: number;
    size: PageSize;
    orientation: PageOrientation;
}

export interface Template {
    id: string;
    name: string;
    version: number;
    page: Page;
    elements: Element[];
}

// Page size presets (in pixels at 96 DPI)
export const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
    A4: { width: 794, height: 1123 },
    Letter: { width: 816, height: 1056 },
    Legal: { width: 816, height: 1344 },
    A3: { width: 1123, height: 1587 },
    A5: { width: 559, height: 794 },
};

// Helper to get page dimensions with orientation
export function getPageDimensions(size: PageSize, orientation: PageOrientation) {
    const base = PAGE_SIZES[size];
    if (orientation === "landscape") {
        return { width: base.height, height: base.width };
    }
    return base;
}

// A4 page constants (default)
export const A4_PAGE: Page = {
    width: 794,
    height: 1123,
    margin: 20,
    size: "A4",
    orientation: "portrait",
};
