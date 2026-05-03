import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { calculateEstimatedDCCost } from "@/app/profile/dashboard/actions";
import { getLatestCurrency } from "@/lib/evds";
interface DataListDisplayProps {
  data: any[];
  title?: string;
  isDC?: boolean; // true if datacenters, false if greenhouses
  currency?: any; // Optional currency rate for cost calculations
}

export function DataListDisplay({ data, title , isDC, currency}: DataListDisplayProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

  const [costs, setCosts] = useState<Record<number, string>>({});

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No data available.
      </div>
    );
  }

  // Extract headers from the first object keys
  // Filter out internal database noise to make room for metrics
  const excludedFields = ["id", "createdAt", "updatedAt"];
  let headers = Object.keys(data[0]).filter(
    (key) => !excludedFields.includes(key)
  );

  // Prioritize "Name" and "Carbon" metrics at the front
  const priority = ["name", "carbonFootprintMt", "carbonOffsetMt"];
  headers.sort((a, b) => {
    const indexA = priority.indexOf(a);
    const indexB = priority.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  // Helper to format values (especially numbers)
  const formatValue = (val: any) => {
    if (typeof val !== "number") return val;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(val);
  };

  return (
    <div className="space-y-4 w-full">
      {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="capitalize">
                  {header.replace(/([A-Z])/g, " $1").trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onMouseEnter={async () => {
                  if (isDC && !costs[rowIndex]) {
                    try {
                      const res = await calculateEstimatedDCCost(row, currency ? currency.buying : 45.14);
                      setCosts((prev) => ({
                        ...prev,
                        [rowIndex]: `${formatValue(res.annualCostTRY)} TRY`,
                      }));
                    } catch (err) {
                      console.error("Failed to calculate cost:", err);
                    }
                  }
                }}
                onMouseMove={(e) => {
                  const val = row[headers[0]];
                  let text =
                    val instanceof Date
                      ? val.toLocaleDateString()
                      : typeof val === "object"
                      ? JSON.stringify(val)
                      : String(formatValue(val) ?? "");

                  if (isDC && costs[rowIndex]) {
                    text += ` — Est. Annual Cost: ${costs[rowIndex]}`;
                  }

                  setTooltip({
                    text,
                    x: e.clientX,
                    y: e.clientY,
                    visible: true,
                  });
                }}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                className="cursor-default"
              >
                {headers.map((header) => {
                  const value = row[header];
                  return (
                    <TableCell key={`${rowIndex}-${header}`}>
                      {value instanceof Date
                        ? value.toLocaleDateString()
                        : typeof value === "object"
                        ? JSON.stringify(value)
                        : String(formatValue(value) ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 bg-background/90 backdrop-blur-md border border-border/50 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-[10px] font-bold uppercase tracking-wider text-foreground animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
