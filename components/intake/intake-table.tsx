"use client";

import { useState } from "react";
import { FoodEntry } from "@prisma/client";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteEntry, updateEntry } from "@/app/actions/entries";
import { Download, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatNumber, formatCurrency } from "@/lib/utils";
import * as XLSX from "xlsx";

interface IntakeTableProps {
  initialEntries: FoodEntry[];
}

export function IntakeTable({ initialEntries }: IntakeTableProps) {
  const [data, setData] = useState<FoodEntry[]>(initialEntries);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      setData(data.filter((entry) => entry.id !== id));
      toast({
        title: "Entry deleted",
        description: "Food entry has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csvData = data.map((entry) => ({
      Date: new Date(entry.capturedAt).toLocaleDateString(),
      Name: entry.name,
      Source: entry.source,
      Servings: entry.servings,
      "Serving Size": entry.servingSize || "",
      "Price (USD)": entry.price_usd || "",
      Calories: entry.calories || "",
      "Protein (g)": entry.protein_g || "",
      "Carbs (g)": entry.carbs_g || "",
      "Fat (g)": entry.fat_g || "",
      "Fiber (g)": entry.fiber_g || "",
      "Sugar (g)": entry.sugar_g || "",
      "Sodium (mg)": entry.sodium_mg || "",
      "Potassium (mg)": entry.potassium_mg || "",
      "Calcium (mg)": entry.calcium_mg || "",
      "Iron (mg)": entry.iron_mg || "",
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Intake");
    XLSX.writeFile(wb, `nutriscan-intake-${Date.now()}.csv`, {
      bookType: "csv",
    });

    toast({
      title: "Export successful",
      description: "Your data has been exported to CSV.",
    });
  };

  const handleExportXLSX = () => {
    const xlsxData = data.map((entry) => ({
      Date: new Date(entry.capturedAt).toLocaleDateString(),
      Name: entry.name,
      Source: entry.source,
      Servings: entry.servings,
      "Serving Size": entry.servingSize || "",
      "Price (USD)": entry.price_usd || "",
      Calories: entry.calories || "",
      "Protein (g)": entry.protein_g || "",
      "Carbs (g)": entry.carbs_g || "",
      "Fat (g)": entry.fat_g || "",
      "Fiber (g)": entry.fiber_g || "",
      "Sugar (g)": entry.sugar_g || "",
      "Sodium (mg)": entry.sodium_mg || "",
      "Potassium (mg)": entry.potassium_mg || "",
      "Calcium (mg)": entry.calcium_mg || "",
      "Iron (mg)": entry.iron_mg || "",
    }));

    const ws = XLSX.utils.json_to_sheet(xlsxData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Intake");
    XLSX.writeFile(wb, `nutriscan-intake-${Date.now()}.xlsx`);

    toast({
      title: "Export successful",
      description: "Your data has been exported to XLSX.",
    });
  };

  const columns: ColumnDef<FoodEntry>[] = [
    {
      accessorKey: "capturedAt",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.capturedAt).toLocaleDateString(),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "servings",
      header: "Servings",
      cell: ({ row }) => formatNumber(row.original.servings, 1),
    },
    {
      accessorKey: "calories",
      header: "Calories",
      cell: ({ row }) =>
        formatNumber((row.original.calories || 0) * row.original.servings, 0),
    },
    {
      accessorKey: "protein_g",
      header: "Protein (g)",
      cell: ({ row }) =>
        formatNumber((row.original.protein_g || 0) * row.original.servings, 1),
    },
    {
      accessorKey: "carbs_g",
      header: "Carbs (g)",
      cell: ({ row }) =>
        formatNumber((row.original.carbs_g || 0) * row.original.servings, 1),
    },
    {
      accessorKey: "fat_g",
      header: "Fat (g)",
      cell: ({ row }) =>
        formatNumber((row.original.fat_g || 0) * row.original.servings, 1),
    },
    {
      accessorKey: "fiber_g",
      header: "Fiber (g)",
      cell: ({ row }) =>
        formatNumber((row.original.fiber_g || 0) * row.original.servings, 1),
    },
    {
      accessorKey: "sodium_mg",
      header: "Sodium (mg)",
      cell: ({ row }) =>
        formatNumber((row.original.sodium_mg || 0) * row.original.servings, 0),
    },
    {
      accessorKey: "price_usd",
      header: "Price",
      cell: ({ row }) =>
        formatCurrency((row.original.price_usd || 0) * row.original.servings),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Food Entries</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportXLSX}>
              <Download className="mr-2 h-4 w-4" />
              Export XLSX
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-muted/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No entries found. Start by scanning a label or adding
                      food.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

