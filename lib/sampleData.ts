import { Element } from "./types";

/**
 * Generate sample data based on bindings found in template elements
 */
export function generateSampleData(elements: Element[]): Record<string, any> {
    const sampleData: Record<string, any> = {
        invoice: {
            number: "INV-2024-001",
            date: "2024-01-15",
            dueDate: "2024-02-15",
            customer: {
                name: "Acme Corporation",
                email: "billing@acme.com",
                address: "123 Business St, Suite 100",
                city: "San Francisco",
                state: "CA",
                zip: "94102",
            },
            items: [
                {
                    item: "Web Design Services",
                    name: "Web Design Services",
                    description: "Homepage and landing page design",
                    quantity: 1,
                    price: 2500,
                    total: 2500,
                },
                {
                    item: "Development Hours",
                    name: "Development Hours",
                    description: "Frontend development",
                    quantity: 40,
                    price: 150,
                    total: 6000,
                },
                {
                    item: "Hosting Setup",
                    name: "Hosting Setup",
                    description: "Annual hosting and domain",
                    quantity: 1,
                    price: 500,
                    total: 500,
                },
            ],
            subtotal: 9000,
            tax: 720,
            total: 9720,
            notes: "Payment due within 30 days. Thank you for your business!",
        },
        company: {
            name: "Your Company Name",
            email: "hello@yourcompany.com",
            phone: "(555) 123-4567",
            address: "456 Company Blvd",
            city: "New York",
            state: "NY",
            zip: "10001",
            website: "www.yourcompany.com",
        },
    };

    return sampleData;
}

/**
 * Get field value from sample data for preview
 */
export function getSampleValue(binding: string | undefined): string {
    if (!binding) return "";

    const sampleData = generateSampleData([]);
    const parts = binding.split(".");
    let current: any = sampleData;

    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        } else {
            return `{{${binding}}}`;
        }
    }

    if (current === null || current === undefined) {
        return `{{${binding}}}`;
    }

    return String(current);
}
