"use client";

import { FileText, Key, Code, Terminal, ChevronRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">make-bill</span>
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="text-lg font-semibold">Documentation</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/templates">
                            <Button variant="ghost">Templates</Button>
                        </Link>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="space-y-12">

                    {/* Introduction */}
                    <section>
                        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
                        <p className="text-xl text-muted-foreground">
                            Generate PDF invoices and documents programmatically using our easy-to-use API.
                        </p>
                    </section>

                    {/* Authentication */}
                    <section id="authentication" className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-5 h-5 text-primary" />
                            <h2 className="text-2xl font-semibold">Authentication</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Authenticate your requests by including your API key in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
                        </p>

                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                            <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wider">Example Header</h3>
                            <code className="text-sm font-mono block overflow-x-auto">
                                Authorization: Bearer mk_live_xxxxxxxxxxxxxxxxxxxxxxxx
                            </code>
                        </div>

                        <div className="flex gap-4 items-center mt-4">
                            <Link href="/api-keys">
                                <Button className="gap-2">
                                    <Key className="w-4 h-4" />
                                    Get Your API Key
                                </Button>
                            </Link>
                        </div>
                    </section>

                    {/* Generate PDF Endpoint */}
                    <section id="generate-pdf" className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <Code className="w-5 h-5 text-primary" />
                            <h2 className="text-2xl font-semibold">Generate PDF</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md font-bold text-sm border border-green-200">POST</span>
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">/api/generate-pdf</code>
                        </div>

                        <p className="text-muted-foreground">
                            The primary endpoint to generate PDFs. It supports two modes:
                        </p>

                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Template-based (Recommended):</strong> Use a saved template ID and provide dynamic data.</li>
                            <li><strong>Raw Elements (Advanced):</strong> Provide full layout definitions and elements array.</li>
                        </ul>

                        {/* Method 1: Template Based */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-3">1. Template-Based Generation</h3>
                            <p className="text-muted-foreground mb-4">
                                This is the simplest way. Design your template in the editor, bind data fields (e.g., <code className="text-xs bg-muted px-1 rounded">invoice.total</code>), and simply pass the data JSON.
                            </p>

                            <CodeBlock
                                title="Request Body"
                                language="json"
                                code={`{
  "templateId": "your-template-uuid-here",
  "data": {
    "invoice": {
      "number": "INV-2024-001",
      "date": "2024-03-20",
      "total": "$1,250.00",
      "customer": {
        "name": "Acme Corp",
        "address": "123 Business Rd"
      }
    },
    "items": [
      { "name": "Web Development", "price": "$1,000.00" },
      { "name": "Hosting", "price": "$250.00" }
    ]
  }
}`}
                            />

                            <div className="mt-4">
                                <CodeBlock
                                    title="cURL Example"
                                    language="bash"
                                    code={`curl -X POST https://make-bill.com/api/generate-pdf \\
  -H "Authorization: Bearer mk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "your-template-uuid",
    "data": {
      "invoice": { "total": "$500" }
    }
  }'`}
                                />
                            </div>
                        </div>

                        {/* Method 2: Raw Elements */}
                        <div className="mt-12">
                            <h3 className="text-xl font-semibold mb-3">2. Raw Elements Generation</h3>
                            <p className="text-muted-foreground mb-4">
                                For complete control without saving templates. You define every element's position and style in the request.
                            </p>

                            <CodeBlock
                                title="Request Body"
                                language="json"
                                code={`{
  "page": {
    "width": 794,
    "height": 1123,
    "size": "A4",
    "orientation": "portrait",
    "margin": 20
  },
  "elements": [
    {
      "id": "1",
      "type": "text",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 30,
      "content": "Invoice #001",
      "fontSize": 24,
      "fontWeight": "bold",
      "align": "left"
    }
  ]
}`}
                            />
                        </div>

                        {/* Response */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-3">Response</h3>
                            <p className="text-muted-foreground mb-4">
                                Successful requests return a download URL for the generated PDF.
                            </p>

                            <CodeBlock
                                title="Success Response (200 OK)"
                                language="json"
                                code={`{
  "success": true,
  "url": "https://storage.googleapis.com/.../invoice.pdf",
  "path": "generated/user_id/timestamp.pdf"
}`}
                            />
                        </div>

                    </section>

                </div>
            </main>
        </div>
    );
}

function CodeBlock({ title, code, language }: { title: string, code: string, language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">{title}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
            </div>
            <div className="p-4 bg-[#0d1117] overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}
