import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateHtml } from '@/lib/htmlGenerator';
import { uploadPdf } from '@/lib/api/pdfs';
import { createClient } from '@/lib/supabase/server';
import { Element, Page } from '@/lib/types';
import { validateApiKey, logApiUsage } from '@/lib/api/apiKeys';
import { getTemplateById } from '@/lib/api/templatesServer';

// Force Node.js runtime (required for Puppeteer/Chromium)
export const runtime = "nodejs";

// Vercel serverless function config
export const maxDuration = 60; // Allow up to 60 seconds for PDF generation

// New simplified format
interface TemplateBasedRequest {
    templateId: string;
    data: Record<string, any>;
}

// Legacy format (backward compatible)
interface LegacyRequest {
    elements: Element[];
    page: Page;
    data: Record<string, any>;
}

type GeneratePdfRequest = TemplateBasedRequest | LegacyRequest;

interface AuthResult {
    userId: string;
    apiKeyId?: string;
}

// Get browser executable path based on environment
async function getBrowserConfig(pageWidth: number, pageHeight: number) {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        // Local development - use system Chrome/Chromium
        const executablePath = '/usr/bin/chromium-browser';

        return {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
            defaultViewport: { width: pageWidth, height: pageHeight },
            executablePath,
            headless: true,
        };
    } else {
        // Production (Vercel) - use @sparticuz/chromium
        return {
            args: chromium.args,
            defaultViewport: { width: pageWidth, height: pageHeight },
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        };
    }
}

// Authenticate via session or API key
async function authenticate(request: NextRequest): Promise<AuthResult | null> {
    // Check for API key in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer mk_live_')) {
        const apiKey = authHeader.substring(7); // Remove "Bearer "
        const result = await validateApiKey(apiKey);
        if (result.valid && result.userId) {
            return { userId: result.userId, apiKeyId: result.keyId };
        }
        return null;
    }

    // Fall back to session auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        return { userId: user.id };
    }

    return null;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let browser = null;
    let auth: AuthResult | null = null;
    let statusCode = 500;

    try {
        // Authenticate user (session or API key)
        auth = await authenticate(request);

        if (!auth) {
            statusCode = 401;
            return NextResponse.json(
                { error: 'Authentication required. Provide session cookie or API key in Authorization header.' },
                { status: 401 }
            );
        }

        // Parse request body
        const body: GeneratePdfRequest = await request.json();

        let elements: Element[];
        let page: Page;
        let data: Record<string, any>;

        // Check if using new templateId format or legacy format
        if ('templateId' in body && body.templateId) {
            // New format: fetch template from database (verifies ownership)
            const template = await getTemplateById(body.templateId, auth.userId);

            if (!template) {
                statusCode = 404;
                return NextResponse.json(
                    { error: 'Template not found or access denied' },
                    { status: 404 }
                );
            }

            elements = template.elements as Element[];
            page = template.page as Page;
            data = body.data || {};
        } else if ('elements' in body && 'page' in body) {
            // Legacy format: use provided elements and page
            elements = body.elements;
            page = body.page;
            data = body.data || {};
        } else {
            statusCode = 400;
            return NextResponse.json(
                { error: 'Missing required fields. Provide either templateId or elements+page.' },
                { status: 400 }
            );
        }

        // Generate HTML from elements
        console.log('Generating HTML...');
        const html = generateHtml({ elements, page, data });

        // Get browser config based on environment
        console.log('Launching Puppeteer...');
        const browserConfig = await getBrowserConfig(page.width, page.height);
        browser = await puppeteer.launch(browserConfig);

        console.log('Creating new page...');
        const browserPage = await browser.newPage();

        // Set viewport to match page dimensions
        await browserPage.setViewport({
            width: page.width,
            height: page.height,
        });

        // Set content and wait for resources to load
        console.log('Setting content...');
        await browserPage.setContent(html, {
            waitUntil: 'networkidle0',
        });

        // Generate PDF
        console.log('Generating PDF...');
        const pdfBuffer = await browserPage.pdf({
            width: `${page.width}px`,
            height: `${page.height}px`,
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        await browser.close();
        browser = null;

        // Upload PDF to Supabase
        console.log('Uploading to Supabase...');
        const { url, path } = await uploadPdf(Buffer.from(pdfBuffer), auth.userId);

        statusCode = 200;
        console.log('PDF generated successfully:', url);

        // Log usage
        const durationMs = Date.now() - startTime;
        await logApiUsage({
            userId: auth.userId,
            apiKeyId: auth.apiKeyId,
            endpoint: '/api/generate-pdf',
            statusCode: 200,
            durationMs,
            metadata: { pageSize: page.size, elementsCount: elements.length },
        });

        return NextResponse.json({
            success: true,
            url,
            path,
        });
    } catch (error) {
        console.error('PDF generation error:', error);

        // Close browser if still open
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }

        // Log failed usage if authenticated
        if (auth) {
            const durationMs = Date.now() - startTime;
            await logApiUsage({
                userId: auth.userId,
                apiKeyId: auth.apiKeyId,
                endpoint: '/api/generate-pdf',
                statusCode,
                durationMs,
                metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to generate PDF: ${errorMessage}` },
            { status: statusCode }
        );
    }
}




