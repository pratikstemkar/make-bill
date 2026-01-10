// Helper to calculate actual element heights based on content
export function calculateElementHeight(
    element: any,
    data?: any
): number {
    // For tables, calculate based on number of rows
    if (element.type === 'table' && element.binding && data) {
        const items = resolveBinding(element.binding, data);
        if (Array.isArray(items) && items.length > 0) {
            const ROW_HEIGHT = 32; // Height per table row
            const HEADER_HEIGHT = 40; // Height of table header
            const calculatedHeight = HEADER_HEIGHT + (items.length * ROW_HEIGHT);
            return Math.max(element.minHeight || element.height, calculatedHeight);
        }
    }

    // For other elements, use their set height
    return element.height;
}

// Helper to resolve data binding paths
function resolveBinding(path: string, data: any): any {
    if (!path || !data) return undefined;

    const keys = path.split('.');
    let current = data;

    for (const key of keys) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}

// Helper to reposition elements based on dynamic heights
export function repositionElements(
    elements: any[],
    data?: any
): any[] {
    if (elements.length === 0) return [];

    // Sort elements by Y position to maintain vertical order
    const sorted = [...elements].sort((a, b) => a.y - b.y);

    // Group elements by their Y position (same row)
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let lastY = -1;

    sorted.forEach(element => {
        if (lastY === -1 || Math.abs(element.y - lastY) < 5) {
            // Same row (within 5px tolerance)
            currentRow.push(element);
            lastY = element.y;
        } else {
            // New row
            if (currentRow.length > 0) {
                rows.push(currentRow);
            }
            currentRow = [element];
            lastY = element.y;
        }
    });

    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    // Calculate positions with dynamic heights
    // Start from the topmost element's original Y position
    const firstRow = rows[0];
    let currentY = firstRow[0].y; // Preserve original Y of topmost element

    const repositioned: any[] = [];

    rows.forEach((row, rowIndex) => {
        // Find the maximum height in this row
        const maxHeight = Math.max(...row.map(el => calculateElementHeight(el, data)));

        // Position all elements in this row
        row.forEach(element => {
            const actualHeight = calculateElementHeight(element, data);
            repositioned.push({
                ...element,
                y: currentY,
                actualHeight: actualHeight // Store for rendering
            });
        });

        // Move to next row position
        currentY += maxHeight + 10; // 10px gap between rows
    });

    return repositioned;
}
