/**
 * Resolves data binding paths against a data object
 * Example: resolveBinding("invoice.customer.name", data) => "Acme Corp"
 */
export function resolveBinding(bindingPath: string, data: Record<string, any>): string {
    if (!bindingPath || !data) {
        return `{{${bindingPath}}}`;
    }

    const parts = bindingPath.split(".");
    let current: any = data;

    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        } else {
            // Binding path not found in data, return placeholder
            return `{{${bindingPath}}}`;
        }
    }

    // Convert the result to string
    if (current === null || current === undefined) {
        return `{{${bindingPath}}}`;
    }

    return String(current);
}

/**
 * Resolves array binding for table elements
 * Returns the array at the binding path or empty array
 */
export function resolveArrayBinding(
    bindingPath: string | undefined,
    data: Record<string, any>
): any[] {
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
 * Extracts all unique bindings from a template
 */
export function extractBindings(elements: any[]): string[] {
    const bindings = new Set<string>();

    elements.forEach((element) => {
        if (element.binding) {
            bindings.add(element.binding);
        }
    });

    return Array.from(bindings);
}
