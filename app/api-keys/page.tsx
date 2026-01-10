"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Copy, Trash2, Key, Check, ArrowLeft, BarChart, BarChart3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { UserMenu } from "@/components/UserMenu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    usage_count: number;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);

    const { initializeAuth } = useSupabaseAuth();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const fetchKeys = useCallback(async () => {
        try {
            const res = await fetch("/api/keys");
            if (!res.ok) throw new Error("Failed to fetch keys");
            const data = await res.json();
            setKeys(data.keys || []);
        } catch (error) {
            console.error("Error fetching keys:", error);
            toast.error("Failed to load API keys");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for the API key");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create key");
            }

            setNewlyCreatedKey(data.key);
            setNewKeyName("");
            fetchKeys();
            toast.success("API key created successfully!");
        } catch (error) {
            console.error("Error creating key:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create API key");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyKey = async () => {
        if (newlyCreatedKey) {
            await navigator.clipboard.writeText(newlyCreatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("API key copied to clipboard");
        }
    };

    const handleDeleteKey = async () => {
        if (!deleteKeyId) return;

        try {
            const res = await fetch(`/api/keys?id=${deleteKeyId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to revoke key");

            fetchKeys();
            toast.success("API key revoked successfully");
        } catch (error) {
            console.error("Error revoking key:", error);
            toast.error("Failed to revoke API key");
        } finally {
            setDeleteKeyId(null);
        }
    };

    const closeCreateDialog = () => {
        setIsCreateOpen(false);
        setNewlyCreatedKey(null);
        setNewKeyName("");
        setCopied(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-bold">make-bill</span>
                    </Link>
                    <span className="text-sm text-muted-foreground">/ API Keys</span>
                </div>
                <UserMenu />
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">API Keys</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage API keys for programmatic access
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/usage">
                            <Button variant="outline" className="gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Usage
                            </Button>
                        </Link>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Key
                        </Button>
                    </div>
                </div>

                {/* API Keys List */}
                <div className="border border-border rounded-lg bg-card">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="p-8 text-center">
                            <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground mb-4">
                                No API keys yet. Create one to get started.
                            </p>
                            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                                Create your first API key
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {keys.map((key) => (
                                <div
                                    key={key.id}
                                    className={`p-4 flex items-center justify-between ${!key.is_active ? "opacity-50" : ""}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{key.name}</span>
                                            {!key.is_active && (
                                                <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                                                    Revoked
                                                </span>
                                            )}
                                        </div>
                                        <code className="text-sm text-muted-foreground font-mono">
                                            {key.key_prefix}...
                                        </code>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Created: {formatDate(key.created_at)}</span>
                                            <span>Last used: {formatDate(key.last_used_at)}</span>
                                            <span>Usage: {key.usage_count || 0}</span>
                                        </div>
                                    </div>
                                    {key.is_active && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteKeyId(key.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </div>

            {/* Create Key Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={closeCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {newlyCreatedKey ? "API Key Created" : "Create API Key"}
                        </DialogTitle>
                    </DialogHeader>

                    {newlyCreatedKey ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Copy your API key now. You won&apos;t be able to see it again!
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={newlyCreatedKey}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button onClick={handleCopyKey} variant="outline">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <DialogFooter>
                                <Button onClick={closeCreateDialog}>Done</Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyName">Key Name</Label>
                                <Input
                                    id="keyName"
                                    placeholder="e.g., Production Server"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={closeCreateDialog}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateKey} disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create Key"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will immediately revoke the API key. Any applications using this key will no longer be able to authenticate.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteKey}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Revoke Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
