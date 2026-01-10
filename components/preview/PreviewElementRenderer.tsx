"use client";

import {
    Element,
    TextElement,
    LineElement,
    TableElement,
    ImageElement,
    Page,
} from "@/lib/types";
import { resolveBinding, resolveArrayBinding } from "@/lib/bindingResolver";

interface PreviewElementRendererProps {
    element: Element & { actualHeight?: number }; // May have actualHeight from repositioning
    page: Page;
    data: any;
}

export function PreviewElementRenderer({
    element,
    page,
    data,
}: PreviewElementRendererProps) {
    // Use actualHeight if available (from repositioning), otherwise use element.height
    const displayHeight = element.actualHeight || element.height;

    const renderContent = () => {
        switch (element.type) {
            case "text":
                const textEl = element as TextElement;
                // Resolve data binding if present
                const displayText = textEl.binding
                    ? String(resolveBinding(textEl.binding, data) || textEl.content)
                    : textEl.content;

                const justifyMap = {
                    left: "flex-start",
                    center: "center",
                    right: "flex-end",
                };

                return (
                    <div
                        className="w-full h-full flex items-center px-2 text-foreground overflow-hidden"
                        style={{
                            fontSize: `${textEl.fontSize}px`,
                            fontWeight: textEl.fontWeight,
                            justifyContent: justifyMap[textEl.align],
                        }}
                    >
                        <span
                            className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                            style={{
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                            }}
                        >
                            {displayText}
                        </span>
                    </div>
                );

            case "line":
                const lineEl = element as LineElement;
                return (
                    <div
                        className="bg-foreground"
                        style={{
                            width: "100%",
                            height: `${lineEl.thickness}px`,
                        }}
                    />
                );

            case "table":
                const tableEl = element as TableElement;
                const tableData = resolveArrayBinding(tableEl.binding, data);

                return (
                    <div className="w-full overflow-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    {tableEl.columns.map((col, i) => (
                                        <th
                                            key={i}
                                            className="border border-border p-1 bg-muted"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.length > 0 ? (
                                    tableData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {tableEl.columns.map((col, colIndex) => {
                                                // Try to get value from row object by column name (lowercase)
                                                const colKey = col.toLowerCase();
                                                const value =
                                                    row[colKey] !== undefined
                                                        ? row[colKey]
                                                        : row[col] !== undefined
                                                            ? row[col]
                                                            : "—";
                                                return (
                                                    <td
                                                        key={colIndex}
                                                        className="border border-border p-1"
                                                    >
                                                        {String(value)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {tableEl.columns.map((_, i) => (
                                            <td
                                                key={i}
                                                className="border border-border p-1 text-muted-foreground"
                                            >
                                                No data
                                            </td>
                                        ))}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case "image":
                const imgEl = element as ImageElement;
                return (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        {imgEl.src ? (
                            <img
                                src={imgEl.src}
                                alt="Element"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <span className="text-muted-foreground text-xs">[Image]</span>
                        )}
                    </div>
                );
        }
    };

    return (
        <div
            className="absolute select-none"
            style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${displayHeight}px`,
            }}
        >
            {renderContent()}
        </div>
    );
}
