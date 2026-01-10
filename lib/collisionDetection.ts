// Helper to check if two elements would overlap
export function elementsOverlap(
    el1: { x: number; y: number; width: number; height: number },
    el2: { x: number; y: number; width: number; height: number }
): boolean {
    return !(
        el1.x + el1.width <= el2.x ||  // el1 is to the left of el2
        el1.x >= el2.x + el2.width ||  // el1 is to the right of el2
        el1.y + el1.height <= el2.y || // el1 is above el2
        el1.y >= el2.y + el2.height    // el1 is below el2
    );
}

// Find the nearest non-overlapping position for an element
export function findNonOverlappingPosition(
    element: { id: string; x: number; y: number; width: number; height: number },
    allElements: { id: string; x: number; y: number; width: number; height: number }[],
    pageWidth: number,
    pageHeight: number
): { x: number; y: number } {
    const otherElements = allElements.filter(el => el.id !== element.id);

    // If no other elements, return original position
    if (otherElements.length === 0) {
        return { x: element.x, y: element.y };
    }

    // Check if current position is valid
    const hasOverlap = otherElements.some(other =>
        elementsOverlap(element, other)
    );

    if (!hasOverlap) {
        return { x: element.x, y: element.y };
    }

    // Try to find a valid position by pushing down
    let testY = element.y;
    const STEP = 10; // Move in 10px increments
    const MAX_ATTEMPTS = 100;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const testElement = { ...element, y: testY };
        const stillOverlaps = otherElements.some(other =>
            elementsOverlap(testElement, other)
        );

        if (!stillOverlaps && testY + element.height <= pageHeight) {
            return { x: element.x, y: testY };
        }

        testY += STEP;
    }

    // If we couldn't find a position, return original
    return { x: element.x, y: element.y };
}

// Adjust all elements to prevent overlaps, maintaining vertical order
export function adjustElementsToPreventOverlap(
    elements: { id: string; x: number; y: number; width: number; height: number }[],
    pageWidth: number,
    pageHeight: number
): { id: string; x: number; y: number }[] {
    // Sort by Y position to maintain vertical order
    const sorted = [...elements].sort((a, b) => a.y - b.y);

    const adjusted: Array<{ id: string; x: number; y: number }> = [];
    let currentY = 0;
    const GAP = 10; // Gap between elements

    // Group elements by row (elements at similar Y positions)
    const rows: typeof sorted[] = [];
    let currentRow: typeof sorted = [];
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

    // Position each row
    rows.forEach((row, rowIndex) => {
        // Find max height in this row
        const maxHeight = Math.max(...row.map(el => el.height));

        // Position elements in this row
        row.forEach(element => {
            adjusted.push({
                id: element.id,
                x: element.x,
                y: rowIndex === 0 ? element.y : currentY, // Preserve first row Y
            });
        });

        // Move to next row
        if (rowIndex === 0) {
            currentY = row[0].y + maxHeight + GAP;
        } else {
            currentY += maxHeight + GAP;
        }
    });

    return adjusted;
}
