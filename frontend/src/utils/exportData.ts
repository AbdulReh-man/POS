import { utils, writeFile } from "xlsx";

/**
 * Export TanStack Table data to Excel or CSV
 * @param table TanStack table instance
 * @param format "xlsx" | "csv"
 * @param fileName name of the exported file
 */
export const exportTableData = (
  table: any,
  format: "xlsx" | "csv" = "xlsx",
  fileName = "export"
) => {
  // ✅ Get selected rows if any, else filtered rows
  const selectedRows = table.getSelectedRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows;

  const rowsToExport = (
    selectedRows.length > 0 ? selectedRows : filteredRows
  ).map((row: any) => row.original);

  if (rowsToExport.length === 0) {
    alert("⚠ No data available to export!");
    return;
  }

  const worksheet = utils.json_to_sheet(rowsToExport);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Data");

  if (format === "csv") {
    writeFile(workbook, `${fileName}.csv`, { bookType: "csv" });
  } else {
    writeFile(workbook, `${fileName}.xlsx`);
  }
};
