// // /* eslint-disable @typescript-eslint/no-explicit-any */
// import { categoryDefaultValues, categorySchema } from "@/Schema/ProdutSchema";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { FolderPlus, Save } from "lucide-react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import type z from "zod";

// export const CategoryForm = () => {
//   // ✅ Form Initialization
//   const form = useForm<z.infer<typeof categorySchema>>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: categoryDefaultValues,
//   });

//   // ✅ Form Submission
//   function onSubmit(values: z.infer<typeof categorySchema>) {
//     window.api.categories
//       .create(values as typeof categoryDefaultValues)
//       .then((res) => {
//         toast.success("Category submitted", {
//           description: (
//             <pre>
//               <code>{JSON.stringify(res, null, 2)}</code>
//             </pre>
//           ),
//           className: "!bg-green-600 !text-white overflow-x-hidden",
//         });
//       })
//       .catch((err) => {
//         toast.error("Error creating category", {
//           description: err.message,
//           className: "!bg-red-600 !text-white overflow-x-hidden",
//         });
//       });
//     form.reset();
//   }

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button>Add Category</Button>
//       </DialogTrigger>

//       <DialogContent className='overflow-y-auto max-h-screen min-w-2xl'>
//         <DialogHeader>
//           <DialogTitle>
//             <h1 className='text-3xl font-bold text-primary flex items-center gap-3'>
//               <FolderPlus className='h-8 w-8' />
//               Add New Category
//             </h1>
//           </DialogTitle>
//           <DialogDescription>
//             Create a new category to organize your products
//           </DialogDescription>
//         </DialogHeader>

//         {/* Category Form */}
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
//             <Card>
//               <CardHeader>
//                 <CardTitle className='flex items-center gap-2'>
//                   Category Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className='space-y-4'>
//                 {/* Category Name */}
//                 <FormField
//                   control={form.control}
//                   name='name'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Category Name *</FormLabel>
//                       <FormControl>
//                         <Input placeholder='Enter category name' {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Category Description */}
//                 <FormField
//                   control={form.control}
//                   name='description'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder='Describe this category...'
//                           rows={10}
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </CardContent>
//             </Card>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button variant='outline'>Cancel</Button>
//               </DialogClose>
//               {/* Action Buttons */}
//                 <Button type='submit' className='flex items-center gap-2'>
//                   <Save className='h-4 w-4' />
//                   Save Category
//                 </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };


import { categoryDefaultValues, categorySchema } from "@/Schema/ProdutSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderPlus, Save, Edit } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { useEffect, useState } from "react";

interface CategoryFormProps {
  mode?: "create" | "edit";
  category?: Category;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CategoryForm = ({
  mode = "create",
  category,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CategoryFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const isEditMode = mode === "edit";

  // Form Initialization
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: isEditMode && category ? category : categoryDefaultValues,
  });

  // Update form values when category changes (for edit mode)
  useEffect(() => {
    if (isEditMode && category) {
      form.reset(category);
    }
  }, [category, isEditMode, form]);

  // Form Submission
  function onSubmit(values: z.infer<typeof categorySchema>) {
    if (isEditMode && category?.id) {
      // Update existing category
      window.api.categories
        .update(category.id, values as typeof categoryDefaultValues)
        .then((res) => {
          toast.success("Category updated successfully", {
            description: (
              <pre>
                <code>{JSON.stringify(res, null, 2)}</code>
              </pre>
            ),
            className: "!bg-green-600 !text-white overflow-x-hidden",
          });
          setIsOpen(false);
          form.reset();
          onSuccess?.();
        })
        .catch((err) => {
          toast.error("Error updating category", {
            description: err.message,
            className: "!bg-red-600 !text-white overflow-x-hidden",
          });
        });
    } else {
      // Create new category
      window.api.categories
        .create(values as typeof categoryDefaultValues)
        .then((res) => {
          toast.success("Category created successfully", {
            description: (
              <pre>
                <code>{JSON.stringify(res, null, 2)}</code>
              </pre>
            ),
            className: "!bg-green-600 !text-white overflow-x-hidden",
          });
          setIsOpen(false);
          form.reset();
          onSuccess?.();
        })
        .catch((err) => {
          toast.error("Error creating category", {
            description: err.message,
            className: "!bg-red-600 !text-white overflow-x-hidden",
          });
        });
    }
  }

  // Default trigger buttons
  const defaultTrigger = isEditMode ? (
    <Button variant='ghost' size='sm'>
      <Edit className='h-4 w-4' />
    </Button>
  ) : (
    <Button>
      <FolderPlus className='h-4 w-4 mr-2' />
      Add Category
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className='overflow-y-auto max-h-screen min-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            <h1 className='text-3xl font-bold text-primary flex items-center gap-3'>
              {isEditMode ? (
                <>
                  <Edit className='h-8 w-8' />
                  Edit Category
                </>
              ) : (
                <>
                  <FolderPlus className='h-8 w-8' />
                  Add New Category
                </>
              )}
            </h1>
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update category information"
              : "Create a new category to organize your products"}
          </DialogDescription>
        </DialogHeader>

        {/* Category Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Category Name */}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter category name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Description */}
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe this category...'
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline' type='button'>
                  Cancel
                </Button>
              </DialogClose>
              {/* Action Buttons */}
              <Button type='submit' className='flex items-center gap-2'>
                <Save className='h-4 w-4' />
                {isEditMode ? "Update Category" : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};