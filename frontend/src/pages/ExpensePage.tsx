import { DynamicDataTable } from "@/components/data-table";
import {  ExpenseColumns} from "@/components/tableCoumns";
import ExpenseForm from "@/components/forms/expenseForm";
import { useEffect, useState } from "react";
const ExpensePage = () => {
  const [data, setData] = useState<Expense[]>([]);
      const handleEdit = () => {
        console.log("");
      };
  useEffect(() => {
    window.api.expenses.getAll().then((expenses) => {
      console.log("Expense", expenses);
      setData(expenses);
    });
  }, []);
  return (
    <div className='max-h-screen p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-3xl font-bold text-primary'>Expense Tracker</h1>
      </div>
      <div className='container mx-auto py-10'>
        <DynamicDataTable<Expense, undefined>
          columns={ExpenseColumns}
          data={data}
          enumFilters={[
            {
              columnId: "category",
              placeholder: "Select Category",
              label: "Category",
              options: [
                { value: "food", label: "Food" },
                { value: "transport", label: "Transport" },
                { value: "utilities", label: "Utilities" },
                { value: "maintenance", label: "Maintenance" },
                { value: "salary", label: "Salary" },
                { value: "other", label: "Other" },
              ],
            },
          ]}
          dateRangeFilter={{
            columnId: "created_at",
            quickRanges: [
              { value: 1, label: "Last 1 Month" },
              { value: 3, label: "Last 3 Months" },
              { value: 5, label: "Last 5 Months" },
              { value: 12, label: "Last 12 Months" },
            ],
          }}
          exportConfig={{
            filename: "expense_data",
            formats: ["xlsx", "csv"],
          }}
          actions={{
            onView: true,
            onEdit: handleEdit,
          }}
          FormComponent={ExpenseForm}
          showColumnVisibility={true}
          showPagination={true}
          showRowSelection={true}
        />
      </div>
    </div>
  );
}

export default ExpensePage;