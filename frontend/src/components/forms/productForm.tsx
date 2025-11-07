/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  formSchema,
  getProductDefaultValues,
  type ProductFormValues,
} from "@/Schema/ProdutSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, Save, Package, Upload, Info } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import CustomLoading from "@/components/customLoading";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";


type ProductFormProps = {
  mode?: "create" | "edit" | "view";
  product?: Partial<Product & { food?: { kitchen_required?: boolean } }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

export const ProductForm = ({
  mode = "create",
  product,
  open,
  onOpenChange,
  onSuccess,
}: ProductFormProps) => {
  // ✅ Local State for Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  // --------------------------------
  // Init with "general"
  // --------------------------------
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getProductDefaultValues("general"),
    mode: "onChange",
  });

  // Reinitialize defaults when product_type changes
  useEffect(() => {
    window.api.store.settingsGet().then((settings) => {
      if (settings?.storetype && mode === "create") {
        form.reset(getProductDefaultValues(settings.storetype));
      }
    });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const getProductType = await window.api.store.settingsGet();
        if (getProductType?.storetype) {
          form.setValue("product_type", getProductType?.storetype);
        }
        const cats = await window.api.categories.getAll();
        setCategories(cats);
      } catch {
        toast.error("Error fetching categories", {
          className: "!bg-red-600 !text-white overflow-x-hidden",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (product && (mode === "edit" || mode === "view")) {
      console.log(product);

      const normalizedProduct = {
        ...product,
        // Convert numbers to strings for select fields
        category_id: product.category_id ? String(product.category_id) : "",
        product_status: product.product_status ?? "active",
        price: product.price ?? 0,
        cost_price: product.cost_price ?? 0,
        stock: product.stock ?? 0,
        // Map flattened food fields into a nested 'food' object
        food:
          product.product_type === "food"
            ? {
                recipe: product.food_recipe ?? "",
                ingredients: product.food_ingredients ?? [],
                kitchen_required:
                  product.food_kitchen_required ? "true" : "false",
              }
            : undefined,
      };

      form.reset(normalizedProduct as ProductFormValues);
    } else if (mode === "create") {
      form.reset(getProductDefaultValues("general"));
    }
  }, [mode, product, form]);

  
  // ✅ Local State for Tags (Food Ingredients)
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (field: any) => {
    if (newTag.trim() && !field.value?.includes(newTag.trim())) {
      field.onChange([...(field.value || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string, field: any) => {
    field.onChange(
      (field.value || []).filter((tag: string) => tag !== tagToRemove)
    );
  };

  // Submit handler (generic for create/edit)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      values.image_url = values.image_url || undefined;

      const res =
        mode === "edit" && product?.id
          ? await window.api.products.update(product.id, values)
          : await window.api.products.create(values);

      toast.success(mode === "edit" ? "Product updated" : "Product created", {
        description: (
          <pre>
            <code>{JSON.stringify(res, null, 2)}</code>
          </pre>
        ),
        className: "!bg-green-600 !text-white overflow-x-hidden",
      });

      form.reset(getProductDefaultValues(values.product_type));
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        mode === "edit" ? "Error updating product" : "Error creating product",
        {
          description: err.message,
          className: "!bg-red-600 !text-white overflow-x-hidden",
        }
      );
    }
  }

  if (loading) return <CustomLoading />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-y-auto max-h-screen min-w-5xl'>
        <DialogHeader>
          <DialogTitle>
            <div className='text-3xl font-bold text-primary flex items-center gap-3'>
              <Package className='h-8 w-8 ' />
              {mode === "edit" ? "Edit Product" : "Add New Product"}
            </div>
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the product details"
              : "Create a new product for your store inventory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 w-full'>
            {/* Product Type */}
            <Item
              asChild
              variant={"outline"}
              className='shadow-md border rounded-2xl backdrop-blur px-6 bg-card '>
              <div>
                <ItemContent>
                  <ItemTitle className='text-lg font-semibold'>
                    Product Type
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Badge className='px-6 py-2'>
                    {form.watch("product_type").toUpperCase()}
                  </Badge>
                </ItemActions>
              </div>
            </Item>
            {/* Basic Info (common fields) */}
            {/* ... keep your existing Basic Info, Pricing, Inventory, Image, Status cards here ... */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Info className='h-5 w-5 text-blue-600' />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-3 lg:grid-cols-4 gap-4'>
                  {/* Product Name */}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter product name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Status */}
                  <FormField
                    control={form.control}
                    name='product_status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue='active'
                          value={field.value}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select a status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Statuses</SelectLabel>
                              <SelectItem value='active'>Active</SelectItem>
                              <SelectItem value='draft'>Draft</SelectItem>
                              <SelectItem value='archived'>Archived</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name='category_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={String(field.value)}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Categories</SelectLabel>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Price && Cost Price && Stock */}
                  {["price", "cost_price", "stock"].map((fieldName, idx) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName as "price" | "cost_price" | "stock"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {idx === 0
                              ? "Price *"
                              : idx === 1
                              ? "Compare at Price"
                              : "Quantity"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='1'
                              placeholder='0'
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {
                    form.watch("product_type") === "clothing" && 
                    <>
                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Product SKU'
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Barcode */}
                  <FormField
                    control={form.control}
                    name='barcode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Product barcode'
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                      />
                    </>
                  }
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe your product...'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Image */}
                  <FormField
                    control={form.control}
                    name='image_url'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <div className='space-y-4 h-auto w-40'>
                            {!field.value ? (
                              <div className='border-2 border-dashed border-gray-300 rounded-lg p-2 text-center'>
                                <Input
                                  id='picture'
                                  type='file'
                                  accept='.png,.jpg,.jpeg'
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        if (e.target?.result) {
                                          field.onChange(
                                            e.target.result as string
                                          );
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className='hidden'
                                />
                                <label
                                  htmlFor='picture'
                                  className='cursor-pointer flex flex-col items-center'>
                                  <Upload className='h-6 w-6 text-gray-400 mb-2' />
                                  <span className='text-sm text-gray-600'>
                                    Click to upload an image or drag and drop
                                  </span>
                                  <span className='text-xs text-gray-500 mt-1'>
                                    PNG, JPG, WEBP up to 10MB
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <div className='relative group w-fit'>
                                <img
                                  src={field.value}
                                  alt='Product'
                                  loading='lazy'
                                  className='w-40 h-auto aspect-square object-cover rounded-lg border'
                                />
                                <Button
                                  onClick={() => field.onChange(null)}
                                  variant='destructive'
                                  size={"icon"}
                                  className='absolute -top-2 -right-2 opacity-100 transition-opacity size-6'>
                                  <X />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Clothing Fields */}
            {form.watch("product_type") === "clothing" && (
              <Card>
                <CardHeader>
                  <CardTitle>Clothing Details</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {["brand", "material", "size", "color"].map((attr) => (
                    <FormField
                      key={attr}
                      control={form.control}
                      name={`clothing.${attr}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {attr.charAt(0).toUpperCase() + attr.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Enter ${attr}`}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Food Fields */}
            {form.watch("product_type") === "food" && (
              <Card>
                <CardHeader>
                  <CardTitle>Food Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-4'>
                      {/* Kitchen Required */}
                      <FormField
                        control={form.control}
                        name='food.kitchen_required'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kitchen Required</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(val) => field.onChange(val)}>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='true'>Yes</SelectItem>
                                <SelectItem value='false'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      {/* Ingredients */}
                      <FormField
                        control={form.control}
                        name='food.ingredients'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingredients</FormLabel>
                            <div className='flex gap-2'>
                              <Input
                                placeholder='Add ingredient'
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag(field);
                                  }
                                }}
                              />
                              <Button
                                size='icon'
                                type='button'
                                onClick={() => handleAddTag(field)}>
                                <Plus />
                              </Button>
                            </div>
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {field.value?.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant='secondary'
                                  className='flex items-center gap-1'>
                                  {tag}
                                  <Button
                                    size='icon'
                                    type='button'
                                    className='h-4 w-4'
                                    onClick={() => handleRemoveTag(tag, field)}>
                                    <X />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Recipe */}
                    <FormField
                      control={form.control}
                      name='food.recipe'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe</FormLabel>
                          <Textarea {...field} />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              {/* Action Buttons */}
              <div className='flex gap-4 justify-end'>
                <Button
                  type='button'
                  variant='secondary'
                  disabled={form.watch("product_status") === "active"}>
                  Save as Draft
                </Button>
                <Button
                  type='submit'
                  className='flex items-center gap-2'
                  >
                  <Save className='h-4 w-4' />
                  {mode === "edit" ? "Update Product" : "Save Product"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};