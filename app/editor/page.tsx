"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Canvas } from "@/components/editor/Canvas";
import { ElementToolbar } from "@/components/editor/ElementToolbar";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import { PageSettingsPanel } from "@/components/editor/PageSettingsPanel";
import { PreviewModal } from "@/components/preview/PreviewModal";
import { SaveTemplateDialog } from "@/components/editor/SaveTemplateDialog";
import { Element, Page, A4_PAGE } from "@/lib/types";
import { FileText, Save, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { UserMenu } from "@/components/UserMenu";
import { createTemplate, updateTemplate, getTemplate } from "@/lib/api/templates";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Default empty state for new templates
const EMPTY_ELEMENTS: Element[] = [];

function EditorContent() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template');

    const [elements, setElements] = useState<Element[]>(EMPTY_ELEMENTS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [page, setPage] = useState<Page>(A4_PAGE);
    const [leftPanelWidth, setLeftPanelWidth] = useState(256);
    const [rightPanelWidth, setRightPanelWidth] = useState(320);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(templateId);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    const { initializeAuth } = useSupabaseAuth();

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Load existing template if templateId is provided
    useEffect(() => {
        async function loadTemplate() {
            if (templateId) {
                setIsLoading(true);
                try {
                    const template = await getTemplate(templateId);
                    if (template) {
                        setElements(template.elements as unknown as Element[]);
                        setPage(template.page as unknown as Page);
                        setTemplateName(template.name);
                        setTemplateDescription(template.description || '');
                        setCurrentTemplateId(template.id);
                    }
                } catch (error) {
                    console.error('Error loading template:', error);
                    toast.error('Failed to load template');
                } finally {
                    setIsLoading(false);
                }
            }
        }
        loadTemplate();
    }, [templateId]);

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
            prev.map((el) => (el.id === id ? ({ ...el, ...updates } as Element) : el))
        );
        setHasUnsavedChanges(true);
    };

    const handleAddElement = (element: Element) => {
        setElements((prev) => [...prev, element]);
        setSelectedId(element.id);
        setHasUnsavedChanges(true);
    };

    const handleDeleteElement = () => {
        if (selectedId) {
            setElements((prev) => prev.filter((el) => el.id !== selectedId));
            setSelectedId(null);
            setHasUnsavedChanges(true);
        }
    };

    const handleUpdatePage = (updates: Partial<Page>) => {
        setPage((prev) => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        setIsSaveDialogOpen(true);
    };

    const handleSaveTemplate = async (name: string, description: string) => {
        try {
            if (currentTemplateId) {
                // Update existing template
                await updateTemplate(currentTemplateId, {
                    name,
                    description,
                    page,
                    elements,
                });
                toast.success('Template updated successfully!');
            } else {
                // Create new template
                const newTemplate = await createTemplate({
                    name,
                    description,
                    page,
                    elements,
                });
                setCurrentTemplateId(newTemplate.id);
                toast.success('Template saved successfully!');
            }
            setTemplateName(name);
            setTemplateDescription(description);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving template:', error);
            throw error; // Re-throw to let dialog handle it
        }
    };

    // Warn user about unsaved changes when leaving page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Handle navigation with unsaved changes check
    const handleNavigation = (href: string) => (e: React.MouseEvent) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            setPendingNavigation(href);
            setShowLeaveDialog(true);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Navbar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/" onClick={handleNavigation('/')} className="flex items-center gap-2 hover:opacity-80">
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
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={handleSave}
                        disabled={currentTemplateId ? !hasUnsavedChanges : false}
                    >
                        <Save className="w-4 h-4" />
                        {currentTemplateId ? 'Update Template' : 'Save Template'}
                    </Button>
                    <UserMenu />
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

            {/* Save Template Dialog */}
            <SaveTemplateDialog
                open={isSaveDialogOpen}
                onOpenChange={setIsSaveDialogOpen}
                onSave={handleSaveTemplate}
                initialName={templateName}
                initialDescription={templateDescription}
                isUpdate={!!currentTemplateId}
            />

            {/* Unsaved Changes Confirmation Dialog */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingNavigation(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setHasUnsavedChanges(false);
                                if (pendingNavigation) {
                                    window.location.href = pendingNavigation;
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
