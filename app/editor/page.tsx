"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Canvas } from "@/components/editor/Canvas";
import { ElementToolbar } from "@/components/editor/ElementToolbar";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import { PageSettingsPanel } from "@/components/editor/PageSettingsPanel";
import { PreviewModal } from "@/components/preview/PreviewModal";
import { Element, Page, A4_PAGE } from "@/lib/types";
import { FileText, Save, Eye } from "lucide-react";
import Link from "next/link";

// Dummy initial data
const INITIAL_ELEMENTS: Element[] = [
    {
        id: "demo-1",
        type: "text",
        x: 50,
        y: 50,
        width: 300,
        height: 40,
        content: "Invoice",
        fontSize: 28,
        fontWeight: "bold",
        align: "left",
    },
    {
        id: "demo-2",
        type: "text",
        x: 50,
        y: 100,
        width: 200,
        height: 30,
        content: "Customer Name",
        fontSize: 14,
        fontWeight: "normal",
        align: "left",
        binding: "invoice.customer.name",
    },
    {
        id: "demo-3",
        type: "line",
        x: 50,
        y: 150,
        width: 694,
        height: 2,
        thickness: 2,
    },
    {
        id: "demo-4",
        type: "table",
        x: 50,
        y: 180,
        width: 694,
        height: 150,
        columns: ["Item", "Quantity", "Price", "Total"],
        binding: "invoice.items",
    },
];

export default function EditorPage() {
    const [elements, setElements] = useState<Element[]>(INITIAL_ELEMENTS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [page, setPage] = useState<Page>(A4_PAGE);
    const [leftPanelWidth, setLeftPanelWidth] = useState(256); // 16rem = 256px
    const [rightPanelWidth, setRightPanelWidth] = useState(320); // 20rem = 320px
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const selectedElement = elements.find((el) => el.id === selectedId) || null;

    // Handle mouse move for resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingLeft) {
                const newWidth = Math.max(240, Math.min(500, e.clientX));
                setLeftPanelWidth(newWidth);
            } else if (isResizingRight) {
                const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
                setRightPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizingLeft(false);
            setIsResizingRight(false);
        };

        if (isResizingLeft || isResizingRight) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isResizingLeft, isResizingRight]);

    const handleUpdateElement = (id: string, updates: Partial<Element>) => {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
        );
    };

    const handleAddElement = (element: Element) => {
        setElements((prev) => [...prev, element]);
        setSelectedId(element.id);
    };

    const handleDeleteElement = () => {
        if (selectedId) {
            setElements((prev) => prev.filter((el) => el.id !== selectedId));
            setSelectedId(null);
        }
    };

    const handleUpdatePage = (updates: Partial<Page>) => {
        setPage((prev) => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        const template = {
            id: "template-1",
            name: "Invoice Template",
            version: 1,
            page,
            elements,
        };
        console.log("Template saved:", template);
        // TODO: Implement save to backend
        alert("Template saved! (Check console for JSON)");
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Navbar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-bold">make-bill</span>
                    </Link>
                    <span className="text-sm text-muted-foreground">/ Editor</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsPreviewOpen(true)}
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>
                    <Button size="sm" className="gap-2" onClick={handleSave}>
                        <Save className="w-4 h-4" />
                        Save Template
                    </Button>
                </div>
            </nav>

            {/* Main Editor Layout */}
            <div className={`flex-1 flex overflow-hidden ${(isResizingLeft || isResizingRight) ? 'select-none' : ''}`}>
                {/* Left: Element Toolbar + Page Settings */}
                <div
                    className="border-r border-border bg-card flex flex-col relative"
                    style={{ width: `${leftPanelWidth}px` }}
                >
                    <PageSettingsPanel page={page} onUpdate={handleUpdatePage} />
                    <div className="flex-1 overflow-auto">
                        <ElementToolbar />
                    </div>

                    {/* Left Resize Handle */}
                    <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors"
                        onMouseDown={() => setIsResizingLeft(true)}
                        style={{ cursor: isResizingLeft ? 'col-resize' : 'col-resize' }}
                    />
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 overflow-auto">
                    <Canvas
                        elements={elements}
                        selectedId={selectedId}
                        page={page}
                        onSelectElement={setSelectedId}
                        onUpdateElement={handleUpdateElement}
                        onAddElement={handleAddElement}
                    />
                </div>

                {/* Right: Inspector */}
                <div
                    className="border-l border-border relative"
                    style={{ width: `${rightPanelWidth}px` }}
                >
                    {/* Right Resize Handle */}
                    <div
                        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-10"
                        onMouseDown={() => setIsResizingRight(true)}
                        style={{ cursor: isResizingRight ? 'col-resize' : 'col-resize' }}
                    />

                    <InspectorPanel
                        element={selectedElement}
                        onUpdate={(updates) =>
                            selectedId && handleUpdateElement(selectedId, updates)
                        }
                        onDelete={handleDeleteElement}
                    />
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                elements={elements}
                page={page}
            />
        </div>
    );
}
