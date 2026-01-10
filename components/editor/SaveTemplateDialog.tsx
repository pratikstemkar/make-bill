'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface SaveTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, description: string) => Promise<void>;
    initialName?: string;
    initialDescription?: string;
    isUpdate?: boolean;
}

export function SaveTemplateDialog({
    open,
    onOpenChange,
    onSave,
    initialName = '',
    initialDescription = '',
    isUpdate = false,
}: SaveTemplateDialogProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync state with props when dialog opens
    useEffect(() => {
        if (open) {
            setName(initialName);
            setDescription(initialDescription);
            setError(null);
        }
    }, [open, initialName, initialDescription]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Template name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onSave(name.trim(), description.trim());
            onOpenChange(false);
            // Reset form
            if (!isUpdate) {
                setName('');
                setDescription('');
            }
        } catch (err) {
            setError('Failed to save template. Please try again.');
            console.error('Save error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isUpdate ? 'Update Template' : 'Save Template'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name *</Label>
                        <Input
                            id="template-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Invoice Template"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="template-description">Description (optional)</Label>
                        <Textarea
                            id="template-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this template..."
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isUpdate ? 'Update' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
