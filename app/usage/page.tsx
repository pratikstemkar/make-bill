"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, BarChart3, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { UserMenu } from "@/components/UserMenu";

interface UsageSummary {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    successRate: number;
    avgDurationMs: number;
}

interface DailyData {
    date: string;
    total: number;
    success: number;
    error: number;
}

export default function UsagePage() {
    const [summary, setSummary] = useState<UsageSummary | null>(null);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { initializeAuth } = useSupabaseAuth();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const fetchUsage = useCallback(async () => {
        try {
            // Get last 30 days
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const res = await fetch(`/api/usage?startDate=${startDate}&endDate=${endDate}`);
            if (!res.ok) throw new Error("Failed to fetch usage");
            const data = await res.json();
            setSummary(data.summary);
            setDailyData(data.dailyData || []);
        } catch (error) {
            console.error("Error fetching usage:", error);
            toast.error("Failed to load usage data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const maxRequests = Math.max(...dailyData.map(d => d.total), 1);

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-bold">make-bill</span>
                    </Link>
                    <span className="text-sm text-muted-foreground">/ Usage</span>
                </div>
                <UserMenu />
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/api-keys">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">API Usage</h1>
                        <p className="text-sm text-muted-foreground">
                            Last 30 days of API activity
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Total Requests</span>
                                </div>
                                <p className="text-2xl font-bold">{summary?.totalRequests || 0}</p>
                            </div>
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">Success</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">
                                    {summary?.successRequests || 0}
                                </p>
                            </div>
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="w-4 h-4 text-destructive" />
                                    <span className="text-sm text-muted-foreground">Errors</span>
                                </div>
                                <p className="text-2xl font-bold text-destructive">
                                    {summary?.errorRequests || 0}
                                </p>
                            </div>
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Avg Duration</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {summary?.avgDurationMs ? `${(summary.avgDurationMs / 1000).toFixed(1)}s` : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="border border-border rounded-lg p-4 bg-card mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Success Rate</span>
                                <span className="font-bold">{summary?.successRate || 0}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${summary?.successRate || 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="border border-border rounded-lg p-4 bg-card">
                            <h3 className="text-sm font-medium mb-4">Daily Requests</h3>
                            {dailyData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No usage data yet
                                </div>
                            ) : (
                                <div className="flex items-end gap-1 h-32">
                                    {dailyData.map((day) => (
                                        <div
                                            key={day.date}
                                            className="flex-1 flex flex-col items-center group relative"
                                        >
                                            <div
                                                className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                                                style={{ height: `${(day.total / maxRequests) * 100}%`, minHeight: day.total > 0 ? "4px" : "0" }}
                                            />
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                                                <div className="font-medium">{day.date}</div>
                                                <div>Total: {day.total}</div>
                                                <div className="text-green-500">Success: {day.success}</div>
                                                <div className="text-destructive">Errors: {day.error}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
