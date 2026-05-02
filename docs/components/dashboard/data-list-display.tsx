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
  const headers = Object.keys(data[0]);

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
                        : String(value ?? "")}
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
