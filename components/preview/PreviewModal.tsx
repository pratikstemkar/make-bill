"use client";

import { useState } from "react";
import { Element, Page } from "@/lib/types";
import { PreviewCanvas } from "./PreviewCanvas";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateSampleData } from "@/lib/sampleData";
import { toast } from "sonner";
import { FileText, Loader2, ExternalLink } from "lucide-react";

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Add scrollbar width (typically 15-17px) to prevent horizontal scrollbar
    const SCROLLBAR_WIDTH = 17;
    const modalWidth = page.width + SCROLLBAR_WIDTH;

    const handleDownloadPdf = async () => {
        setIsGenerating(true);
        setPdfUrl(null);

        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    elements,
                    page,
                    data: sampleData,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate PDF');
            }

            const result = await response.json();
            setPdfUrl(result.url);
            toast.success('PDF generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate PDF');
        } finally {
            setIsGenerating(false);
        }
    };

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
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                Template Preview
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Viewing template with sample data
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mr-8">
                            {pdfUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open PDF
                                    </a>
                                </Button>
                            )}
                            <Button
                                onClick={handleDownloadPdf}
                                disabled={isGenerating}
                                size="sm"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
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

