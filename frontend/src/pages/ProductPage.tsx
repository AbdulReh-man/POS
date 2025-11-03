// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { DynamicDataTable } from "@/components/data-table";
import { ProductForm } from "@/components/forms/productForm";
import { CategoryForm } from "@/components/forms/categoryForm";
import { CategoryColumns, ProductColumns } from "@/components/tableCoumns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Product = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [openForm, setOpenForm] = useState(false);

  const fetchProducts = async () => {
    const res = await window.api.products.getAll();
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
    setOpenForm(true);
  };

  console.log("Getting Single product:", products);

  return (
    <>
      <DynamicDataTable<Product, undefined>
        columns={ProductColumns}
        data={products}
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
          onDelete: async (product) => {
            await window.api.products.delete(product.id);
            fetchProducts();
          },
          viewDrawerConfig: {
            title: (product) => product.name,
            imageField: "image_url",
          },
        }}
        FormComponent={() => <Button onClick={handleAdd}>Add Product</Button>}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />

      {/* ✅ Controlled Dialog Form */}
      <ProductForm
        mode={formMode}
        product={selectedProduct || undefined}
        open={openForm}
        onOpenChange={setOpenForm}
        onSuccess={() => {
          setOpenForm(false);
          fetchProducts();
        }}
      />
    </>
  );
};

export const Category = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchCategories = async () => {
    const cats = await window.api.categories.getAll();
    setCategories(cats);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`Delete category "${category.name}"?`)) {
      try {
        await window.api.categories.delete(category.id);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleSuccess = () => {
    // Refresh your category data
    console.log("Refreshing categories...");
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, [isEditOpen]);

  return (
    <>
      <DynamicDataTable<Category, undefined>
        columns={CategoryColumns}
        data={categories}
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
          onDelete: handleDelete,
          viewDrawerConfig: {
            title: (product) => product.name,
            imageField: "image_url",
            excludeFields: ["created_at", "updated_at"],
          },
        }}
        FormComponent={() => (
          <CategoryForm mode='create' onSuccess={handleSuccess} />
        )}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />

      {/* Edit Form (appears when edit is clicked) */}
      {selectedCategory && (
        <CategoryForm
          mode='edit'
          category={selectedCategory}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={() => {
            handleSuccess();
            setIsEditOpen(false);
          }}
        />
      )}
    </>
  );
};
export default function ProductPage() {
  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <Tabs defaultValue='products' className='w-full'>
          <TabsList className=' w-full grid grid-cols-2 h-12 sticky top-4 z-10 mb-5'>
            <TabsTrigger value='products'>Products</TabsTrigger>
            <TabsTrigger value='categories'>Categories</TabsTrigger>
          </TabsList>
          <TabsContent value='products'>
            <Product />
          </TabsContent>
          <TabsContent value='categories'>
            <Category />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
