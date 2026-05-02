import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface DataListDisplayProps {
  data: any[];
  title?: string;
}

export function DataListDisplay({ data, title }: DataListDisplayProps) {
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
  const formatValue = (val: any) => (typeof val === "number" ? val.toFixed(4) : val);

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
              <TableRow key={rowIndex}>
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
    </div>
  );
}
