"use client";

import { Button } from "@/components/ui/button";
import { FileText, Layers, Zap, ArrowRight, Code2, Palette, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
    const { isAuthenticated, user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg tracking-tight">make-bill</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Templates
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    {user?.name}
                                </span>
                                <Button onClick={logout} variant="ghost" size="sm" className="gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                        )}
                        <Link href="/editor">
                            <Button size="sm">Open Editor</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            < section className="relative pt-32 pb-20 px-6" >
                {/* Gradient background */}
                < div className="absolute inset-0 -z-10 overflow-hidden" >
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-pulse delay-1000" />
                </div >

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium rounded-full border border-border bg-muted/50">
                        <Zap className="w-3 h-3" />
                        <span>API-first invoice generation</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        Design invoices visually.
                        <br />
                        <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent">
                            Generate PDFs via API.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Create pixel-perfect invoice templates with our drag-and-drop editor.
                        Integrate with a single API call. No more HTML-to-PDF headaches.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/editor">
                            <Button size="lg" className="gap-2 text-base px-8">
                                Start Building
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                            <Code2 className="w-4 h-4" />
                            View API Docs
                        </Button>
                    </div>
                </div>
            </section >

            {/* Features Section */}
            < section className="py-20 px-6 border-t border-border/50" >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Built for developers</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            No more wrestling with wkhtmltopdf or puppeteer configs. Design once, generate forever.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <Palette className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Visual Editor</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag-and-drop interface with precise positioning. What you see is exactly what you get in the PDF.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                            <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4 group-hover:bg-chart-2/20 transition-colors">
                                <Layers className="w-6 h-6 text-chart-2" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Template Engine</h3>
                            <p className="text-sm text-muted-foreground">
                                Bind data fields like <code className="px-1 py-0.5 rounded bg-muted text-xs">invoice.total</code>. Templates are versioned and immutable.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                            <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center mb-4 group-hover:bg-chart-1/20 transition-colors">
                                <Code2 className="w-6 h-6 text-chart-1" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">REST API</h3>
                            <p className="text-sm text-muted-foreground">
                                One POST request. Send your template ID and data, receive a pixel-perfect PDF. It's that simple.
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* Code Preview Section */}
            < section className="py-20 px-6 border-t border-border/50 bg-muted/30" >
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Generate PDFs in seconds</h2>
                        <p className="text-muted-foreground">A single API call is all it takes.</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                            <div className="w-3 h-3 rounded-full bg-destructive/70" />
                            <div className="w-3 h-3 rounded-full bg-chart-4/70" />
                            <div className="w-3 h-3 rounded-full bg-chart-2/70" />
                            <span className="ml-4 text-xs text-muted-foreground font-mono">POST /api/pdf/generate</span>
                        </div>
                        <pre className="p-6 text-sm overflow-x-auto">
                            <code className="text-muted-foreground">
                                {`curl -X POST https://api.make-bill.com/api/pdf/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "invoice_v1",
    "data": {
      "invoice": {
        "number": "INV-2024-001",
        "date": "2024-01-15",
        "customer": { "name": "Acme Corp" },
        "items": [
          { "name": "Consulting", "qty": 10, "price": 150 }
        ],
        "total": 1500
      }
    }
  }'`}
                            </code>
                        </pre>
                    </div>
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-24 px-6 border-t border-border/50" >
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to build?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Start designing your first invoice template in minutes.
                    </p>
                    <Link href="/editor">
                        <Button size="lg" className="gap-2 text-base px-10">
                            Open the Editor
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section >

            {/* Footer */}
            < footer className="border-t border-border/50 py-8 px-6" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">make-bill</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Built for developers who hate fighting with PDF libraries.
                    </p>
                </div>
            </footer >
        </div >
    );
}