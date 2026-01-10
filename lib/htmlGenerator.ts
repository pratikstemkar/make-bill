/**
 * Server-side HTML generation for PDF rendering
 * Converts elements array to static HTML string with inline styles
 */

import { Element, Page, TextElement, LineElement, TableElement, ImageElement } from './types';

interface HtmlGeneratorOptions {
    elements: Element[];
    page: Page;
    data: Record<string, any>;
}

/**
 * Resolves data binding paths against a data object (server-side version)
 */
function resolveBinding(bindingPath: string, data: Record<string, any>): string {
    if (!bindingPath || !data) {
        return `{{${bindingPath}}}`;
    }

    const parts = bindingPath.split(".");
    let current: any = data;

    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        } else {
            return `{{${bindingPath}}}`;
        }
    }

    if (current === null || current === undefined) {
        return `{{${bindingPath}}}`;
    }

    return String(current);
}

/**
 * Resolves array binding for table elements
 */
function resolveArrayBinding(bindingPath: string | undefined, data: Record<string, any>): any[] {
    if (!bindingPath || !data) {
        return [];
    }

    const parts = bindingPath.split(".");
    let current: any = data;

    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        } else {
            return [];
        }
    }

    return Array.isArray(current) ? current : [];
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Generate HTML for a text element
 */
function renderTextElement(element: TextElement, data: Record<string, any>): string {
    const displayText = element.binding
        ? resolveBinding(element.binding, data)
        : element.content;

    const justifyMap: Record<string, string> = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end',
    };

    return `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            padding: 0 8px;
            color: #0a0a0a;
            overflow: hidden;
            font-size: ${element.fontSize}px;
            font-weight: ${element.fontWeight};
            justify-content: ${justifyMap[element.align]};
        ">
            <span style="
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
                word-break: break-word;
                overflow-wrap: break-word;
            ">${escapeHtml(displayText)}</span>
        </div>
    `;
}

/**
 * Generate HTML for a line element
 */
function renderLineElement(element: LineElement): string {
    return `
        <div style="
            width: 100%;
            height: ${element.thickness}px;
            background-color: #0a0a0a;
        "></div>
    `;
}

/**
 * Generate HTML for a table element
 */
function renderTableElement(element: TableElement, data: Record<string, any>): string {
    const tableData = resolveArrayBinding(element.binding, data);

    const headerCells = element.columns
        .map(col => `<th style="border: 1px solid #e5e7eb; padding: 4px; background-color: #f5f5f5;">${escapeHtml(col)}</th>`)
        .join('');

    let bodyRows = '';
    if (tableData.length > 0) {
        bodyRows = tableData.map(row => {
            const cells = element.columns.map(col => {
                const colKey = col.toLowerCase();
                const value = row[colKey] !== undefined
                    ? row[colKey]
                    : row[col] !== undefined
                        ? row[col]
                        : '—';
                return `<td style="border: 1px solid #e5e7eb; padding: 4px;">${escapeHtml(String(value))}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
    } else {
        bodyRows = `<tr>${element.columns.map(() =>
            `<td style="border: 1px solid #e5e7eb; padding: 4px; color: #737373;">No data</td>`
        ).join('')}</tr>`;
    }

    return `
        <div style="width: 100%; overflow: auto;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <thead>
                    <tr>${headerCells}</tr>
                </thead>
                <tbody>
                    ${bodyRows}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Generate HTML for an image element
 */
function renderImageElement(element: ImageElement): string {
    if (element.src) {
        return `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${escapeHtml(element.src)}" alt="Element" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>
        `;
    }
    return `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <span style="color: #737373; font-size: 12px;">[Image]</span>
        </div>
    `;
}

/**
 * Generate HTML for a single element
 */
function renderElement(element: Element, data: Record<string, any>): string {
    let content = '';

    switch (element.type) {
        case 'text':
            content = renderTextElement(element as TextElement, data);
            break;
        case 'line':
            content = renderLineElement(element as LineElement);
            break;
        case 'table':
            content = renderTableElement(element as TableElement, data);
            break;
        case 'image':
            content = renderImageElement(element as ImageElement);
            break;
    }

    return `
        <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
        ">
            ${content}
        </div>
    `;
}

/**
 * Generate complete HTML document for PDF rendering
 */
export function generateHtml(options: HtmlGeneratorOptions): string {
    const { elements, page, data } = options;

    const elementsHtml = elements.map(el => renderElement(el, data)).join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #ffffff;
        }
        .page {
            position: relative;
            width: ${page.width}px;
            min-height: ${page.height}px;
            background-color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="page">
        ${elementsHtml}
    </div>
</body>
</html>
    `.trim();
}
