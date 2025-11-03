import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ✅ Zod Schema
const expenseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .refine((val) => !isNaN(val), { message: "Amount must be a number" }),
  category: z.enum(
    ["food", "transport", "utilities", "maintenance", "salary"	, "other"],
    {
      error: "Category is required",
    }
  ),
});

// ✅ TypeScript type
type Expense = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
  const form = useForm<Expense>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "utilities",
    },
  });


  // Handle form submission

	function onSubmit(data: Expense) {
    try {
			window.api.expenses.create(data).then(() => {
				console.log("Form Data:", data);
				form.reset();
			});
			
			window.api.expenses.getAll().then((expenses) => {
				console.log("All Expenses:", expenses);
			});
    } catch (error) {
      console.error("Error creating expense:", error);
    }

    // You can replace the above line with actual submission logic
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Expenditure</Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Expenditure</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new expenditure.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 p-4'>
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter title'
                      {...field}
                      className='rounded-xl'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Category */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='rounded-xl w-full'>
                          <SelectValue placeholder='Select Category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='food'>Food</SelectItem>
                        <SelectItem value='transport'>Transport</SelectItem>
                        <SelectItem value='utilities'>Utilities</SelectItem>
                        <SelectItem value='maintenance'>Maintenance</SelectItem>
                        <SelectItem value='salary'>Salary</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Amount'
                        {...field}
                        className='rounded-xl'
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

