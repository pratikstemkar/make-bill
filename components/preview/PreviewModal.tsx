"use client";

import { Element, Page } from "@/lib/types";
import { PreviewCanvas } from "./PreviewCanvas";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { generateSampleData } from "@/lib/sampleData";

interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elements: Element[];
    page: Page;
}

export function PreviewModal({
    open,
    onOpenChange,
    elements,
    page,
}: PreviewModalProps) {
    const sampleData = generateSampleData(elements);

    // Add scrollbar width (typically 15-17px) to prevent horizontal scrollbar
    const SCROLLBAR_WIDTH = 17;
    const modalWidth = page.width + SCROLLBAR_WIDTH;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="h-[92vh] p-0 gap-0 flex flex-col"
                style={{
                    width: `${modalWidth}px`,
                    maxWidth: `${modalWidth}px`,
                }}
            >
                <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
                    <DialogTitle className="text-lg font-semibold">
                        Template Preview
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Viewing template with sample data
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-0">
                    <PreviewCanvas
                        elements={elements}
                        page={page}
                        data={sampleData}
                    />
                </div>

                <div className="px-6 py-4 border-t border-border shrink-0">
                    <p className="text-xs text-muted-foreground text-center">
                        Preview with sample data • Actual output may vary based on your data
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
