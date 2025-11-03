import { columns, type Payment } from "@/components/BarCode/columns";
import { DynamicDataTable } from "@/components/data-table";

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    total: 100,
    status: "pending",
    email: "d@example.com",
    barcode: "123456789012",
  },
  {
    id: "728ed523",
    amount: 100,
    total: 100,
    status: "pending",
    email: "er@example.com",
    barcode: "123456789012",
  },
  {
    id: "728ed525",
    amount: 100,
    total: 100,
    status: "pending",
    email: "t@example.com",
    barcode: "123456789012",
  },
  {
    id: "76543",
    amount: 100,
    total: 100,
    status: "pending",
    email: "h@example.com",
    barcode: "123456789012",
  },
  {
    id: "t6543",
    amount: 100,
    total: 100,
    status: "pending",
    email: "u@example.com",
    barcode: "123456789012",
  },
  {
    id: "65443",
    amount: 100,
    total: 100,
    status: "pending",
    email: "w@example.com",
    barcode: "123456789012",
  },
  {
    id: "7654",
    amount: 100,
    total: 100,
    status: "pending",
    email: "r@example.com",
    barcode: "123456789012",
  },
  {
    id: "34567",
    amount: 100,
    total: 100,
    status: "pending",
    email: "e@example.com",
    barcode: "123456789012",
  },
  {
    id: "ty56rge",
    amount: 100,
    total: 100,
    status: "pending",
    email: "q@example.com",
    barcode: "123456789012",
  },
  {
    id: "43rfc",
    amount: 100,
    total: 100,
    status: "pending",
    email: "u@example.com",
    barcode: "123456789012",
  },
  {
    id: "43tyg54v",
    amount: 100,
    total: 100,
    status: "pending",
    email: "k@example.com",
    barcode: "123456789012",
  },
  {
    id: "ty46utrh",
    amount: 100,
    total: 100,
    status: "pending",
    email: "a@example.com",
    barcode: "123456789012",
  },
  {
    id: "r34435",
    amount: 100,
    total: 100,
    status: "pending",
    email: "b@example.com",
    barcode: "123456789012",
  },
  {
    id: "4r3t5er",
    amount: 100,
    total: 100,
    status: "pending",
    email: "c@example.com",
    barcode: "123456789012",
  },
  {
    id: "r4wfvrf",
    amount: 100,
    total: 100,
    status: "pending",
    email: "f@example.com",
    barcode: "123456789012",
  },
  {
    id: "t3fe4wges",
    amount: 100,
    total: 100,
    status: "pending",
    email: "g@example.com",
    barcode: "123456789012",
  },
  {
    id: "ferfewe",
    amount: 100,
    total: 100,
    status: "pending",
    email: "h@example.com",
    barcode: "123456789012",
  },
];

const BarCodePage = () => {
  return (
    <div className='max-h-screen p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-3xl font-bold text-primary'>Bar Code Prints</h1>
      </div>
      <div className='container mx-auto py-10'>
        <DynamicDataTable
          columns={columns}
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
          }}
        />
      </div>
    </div>
  );
}

export default BarCodePage