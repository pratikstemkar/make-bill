"use client";

import { Button } from "@/components/ui/button";
import { FileText, Plus, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock templates data
const MOCK_TEMPLATES = [
    {
        id: "template-1",
        name: "Invoice Template",
        description: "Standard invoice template with itemized billing",
        lastModified: "2024-01-15",
        preview: "/api/placeholder/300/400",
    },
    {
        id: "template-2",
        name: "Receipt Template",
        description: "Simple receipt format for quick transactions",
        lastModified: "2024-01-12",
        preview: "/api/placeholder/300/400",
    },
    {
        id: "template-3",
        name: "Quote Template",
        description: "Professional quote template with terms",
        lastModified: "2024-01-10",
        preview: "/api/placeholder/300/400",
    },
];

export default function TemplatesPage() {
    const [templates] = useState(MOCK_TEMPLATES);

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
                    <Link href="/editor">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create New Template
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Stats/Info Bar */}
                <div className="mb-8">
                    <p className="text-muted-foreground">
                        {templates.length} {templates.length === 1 ? "template" : "templates"} created
                    </p>
                </div>

                {/* Templates Grid */}
                {templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                {/* Preview */}
                                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-muted-foreground/20" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Actions on hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/editor?template=${template.id}`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full gap-2">
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <MoreVertical className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold mb-1 truncate">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>Modified {template.lastModified}</span>
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
        </div>
    );
}
