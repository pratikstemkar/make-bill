"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Calendar, Pencil, Trash2, Loader2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { UserMenu } from "@/components/UserMenu";
import { getTemplates, deleteTemplate } from "@/lib/api/templates";
import { TemplateThumbnail } from "@/components/TemplateThumbnail";
import { toast } from "sonner";
import type { DbTemplate } from "@/lib/database.types";
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

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<DbTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { initializeAuth } = useSupabaseAuth();

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Fetch templates
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const data = await getTemplates();
                setTemplates(data);
            } catch (error) {
                console.error('Error fetching templates:', error);
                toast.error('Failed to load templates');
            } finally {
                setIsLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteTemplate(deleteId);
            setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
            toast.success('Template deleted successfully');
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleCopyId = async (id: string) => {
        await navigator.clipboard.writeText(id);
        setCopiedId(id);
        toast.success('Template ID copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">make-bill</span>
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="text-lg font-semibold">Templates</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/editor">
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Template
                            </Button>
                        </Link>
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Stats/Info Bar */}
                <div className="mb-8">
                    <p className="text-muted-foreground">
                        {isLoading ? (
                            <Skeleton className="h-5 w-32" />
                        ) : (
                            `${templates.length} ${templates.length === 1 ? "template" : "templates"} created`
                        )}
                    </p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl border border-border overflow-hidden">
                                <Skeleton className="aspect-[3/4]" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : templates.length > 0 ? (
                    /* Templates Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                {/* Preview */}
                                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                    <TemplateThumbnail
                                        elements={template.elements as any[]}
                                        page={template.page as any}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    {/* Actions on hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/editor?template=${template.id}`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full gap-2">
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="gap-2 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteId(template.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold truncate flex-1">{template.name}</h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-2"
                                            onClick={() => handleCopyId(template.id)}
                                            title="Copy Template ID"
                                        >
                                            {copiedId === template.id ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                        {template.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>Modified {formatDate(template.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Create New Card */}
                        <Link href="/editor">
                            <div className="aspect-[3/4] bg-muted/30 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 group">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Plus className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium mb-1">Create New Template</p>
                                    <p className="text-xs text-muted-foreground">Start from scratch</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No templates yet</h2>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Create your first invoice template to get started with automated PDF generation
                        </p>
                        <Link href="/editor">
                            <Button size="lg" className="gap-2">
                                <Plus className="w-5 h-5" />
                                Create Your First Template
                            </Button>
                        </Link>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
