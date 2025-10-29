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
      Time: new Date(entry.capturedAt).toLocaleTimeString(),
      Name: entry.name,
      Source: entry.source,
      Servings: entry.servings,
      "Serving Size": entry.servingSize || "",
      "Price (USD)": entry.price_usd || "",
      Calories: entry.calories || "",
      "Protein (g)": entry.protein_g || "",
      "Carbs (g)": entry.carbs_g || "",
      "Fat (g)": entry.fat_g || "",
      "Saturated Fat (g)": entry.saturated_fat_g || "",
      "Cholesterol (mg)": entry.cholesterol_mg || "",
      "Dietary Fiber (g)": entry.fiber_g || "",
      "Added Sugars (g)": entry.sugar_g || "",
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
      Time: new Date(entry.capturedAt).toLocaleTimeString(),
      Name: entry.name,
      Source: entry.source,
      Servings: entry.servings,
      "Serving Size": entry.servingSize || "",
      "Price (USD)": entry.price_usd || "",
      Calories: entry.calories || "",
      "Protein (g)": entry.protein_g || "",
      "Carbs (g)": entry.carbs_g || "",
      "Fat (g)": entry.fat_g || "",
      "Saturated Fat (g)": entry.saturated_fat_g || "",
      "Cholesterol (mg)": entry.cholesterol_mg || "",
      "Dietary Fiber (g)": entry.fiber_g || "",
      "Added Sugars (g)": entry.sugar_g || "",
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

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleCellClick = (rowId: string, columnId: string, value: any) => {
    setEditingCell({ rowId, columnId });
    setEditValue(String(value || ""));
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const entry = data.find((e) => e.id === editingCell.rowId);
    if (!entry) return;

    const columnId = editingCell.columnId;
    let newValue: any = editValue;

    // Parse number fields
    if (
      [
        "servings",
        "price_usd",
        "calories",
        "protein_g",
        "carbs_g",
        "fat_g",
        "saturated_fat_g",
        "cholesterol_mg",
        "fiber_g",
        "sugar_g",
        "sodium_mg",
        "potassium_mg",
        "calcium_mg",
        "iron_mg",
      ].includes(columnId)
    ) {
      newValue = parseFloat(editValue) || 0;
    }

    // Update entry
    try {
      await updateEntry(entry.id, { [columnId]: newValue });
      setData(
        data.map((e) =>
          e.id === entry.id ? { ...e, [columnId]: newValue } : e
        )
      );
      toast({
        title: "Updated",
        description: "Entry updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update entry.",
        variant: "destructive",
      });
    }

    setEditingCell(null);
  };

  const columns: ColumnDef<FoodEntry>[] = [
    {
      accessorKey: "capturedAt",
      header: "Date & Time",
      cell: ({ row }) => {
        const date = new Date(row.original.capturedAt);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{date.toLocaleDateString()}</span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "name";
        return isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8"
          />
        ) : (
          <div
            onClick={() => handleCellClick(row.original.id, "name", row.original.name)}
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "servings",
      header: "Servings",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "servings";
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-20"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "servings",
                row.original.servings
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            {formatNumber(row.original.servings, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "calories",
      header: "Calories",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "calories";
        const totalValue = (row.original.calories || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "calories",
                row.original.calories || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 0)}
          </div>
        );
      },
    },
    {
      accessorKey: "protein_g",
      header: "Protein (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "protein_g";
        const totalValue = (row.original.protein_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "protein_g",
                row.original.protein_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "carbs_g",
      header: "Carbs (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "carbs_g";
        const totalValue = (row.original.carbs_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "carbs_g",
                row.original.carbs_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "fat_g",
      header: "Fat (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "fat_g";
        const totalValue = (row.original.fat_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "fat_g",
                row.original.fat_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "saturated_fat_g",
      header: "Sat. Fat (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "saturated_fat_g";
        const totalValue = (row.original.saturated_fat_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "saturated_fat_g",
                row.original.saturated_fat_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "cholesterol_mg",
      header: "Cholesterol (mg)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "cholesterol_mg";
        const totalValue = (row.original.cholesterol_mg || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "cholesterol_mg",
                row.original.cholesterol_mg || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 0)}
          </div>
        );
      },
    },
    {
      accessorKey: "fiber_g",
      header: "Dietary Fiber (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "fiber_g";
        const totalValue = (row.original.fiber_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "fiber_g",
                row.original.fiber_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "sugar_g",
      header: "Added Sugars (g)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "sugar_g";
        const totalValue = (row.original.sugar_g || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "sugar_g",
                row.original.sugar_g || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 1)}
          </div>
        );
      },
    },
    {
      accessorKey: "sodium_mg",
      header: "Sodium (mg)",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "sodium_mg";
        const totalValue = (row.original.sodium_mg || 0) * row.original.servings;
        return isEditing ? (
          <Input
            type="number"
            step="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "sodium_mg",
                row.original.sodium_mg || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
            title="Click to edit per-serving value"
          >
            {formatNumber(totalValue, 0)}
          </div>
        );
      },
    },
    {
      accessorKey: "price_usd",
      header: "Price",
      cell: ({ row }) => {
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.columnId === "price_usd";
        return isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
            autoFocus
            className="h-8 w-24"
          />
        ) : (
          <div
            onClick={() =>
              handleCellClick(
                row.original.id,
                "price_usd",
                row.original.price_usd || 0
              )
            }
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            {formatCurrency(
              (row.original.price_usd || 0) * row.original.servings
            )}
          </div>
        );
      },
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

