import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  printDataSchema,
  receiptDefaultValues,
  type PrintDataForm,
} from "@/Schema/recieptSchema";
import { IconUpload } from "../fileUpload";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import CustomLoading from "@/components/customLoading";
import { toast } from "sonner";

// Main Form Component
export default function ReceiptStaticForm({role}: {role?: string}) {
  const form = useForm<PrintDataForm>({
    resolver: zodResolver(printDataSchema),
    defaultValues: receiptDefaultValues,
    mode: "onChange",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  // Get already selected platforms
  const selectedPlatforms = fields.map((_, index) =>
    form.watch(`socials.${index}.name`)
  );

  // Available platforms that haven't been added yet
  const availablePlatforms = ["Facebook", "WhatsApp", "Instagram"].filter(
    (platform) => !selectedPlatforms.includes(platform)
  );

  const onSubmit = async () => {
    const result = printDataSchema.safeParse(form.getValues());

    if (!result.success) {
      alert("Validation failed: " + JSON.stringify(result.error.format()));
      return;
    }

    // Pass only the validated data
    await window.api.store.settingsUpdate(result.data).then(() => {
      setLoading(false);
      toast.success("Receipt static data saved successfully!");
      window.api.electron.reloadWindow();
    }).catch(() => {
      toast.error("Failed to save receipt settings.");
    });
  };


  useEffect(() => {
    const get = async () => {
      setLoading(true);
      const settings = await window.api.store.settingsGet();
      if (settings) {
        form.reset(settings);
        setLoading(false);
      }
    };
    get();
  }, []);

  if (loading) {
    return <CustomLoading/>
  } 

  return (
    <Item
      asChild
      variant={"outline"}
      className='max-w-7xl mx-auto shadow-md border rounded-2xl backdrop-blur p-6 bg-card '>
      <div className='mb-6'>
        <ItemContent>
          <ItemTitle className='text-2xl font-semibold'>
            Receipt Settings
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button
            disabled
            variant={"outline"}
            size='sm'>{`View Profile`}</Button>
        </ItemActions>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 px-4'>
            {/* Store Information Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Store Information</h3>
              <div className='grid grid-cols-3 gap-4'>
                {/* Owner Name */}
                <FormField
                  control={form.control}
                  name='owner'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter owner name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='storeName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter store name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name='phone_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='+92 300 1234567' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Website */}
                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Store Address */}
                <FormField
                  control={form.control}
                  name='storeAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Address</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder='Enter store address'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Logo Path */}
                <FormField
                  control={form.control}
                  name='logoPath'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Logo</FormLabel>
                      <FormControl>
                        <IconUpload
                          value={field.value}
                          onChange={field.onChange}
                          platformName='logo'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Settings Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Financial Settings</h3>

              <div className='grid grid-cols-3 gap-4'>
                {/* Discount */}
                <FormField
                  control={form.control}
                  name='discount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax Rate */}
                <FormField
                  control={form.control}
                  name='taxRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business day cutoff */}
                <FormField
                  control={form.control}
                  name='dayStartHour'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Day Ends At</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value ?? 0)}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select closing time' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='0'>Midnight (12:00 AM)</SelectItem>
                          {[1, 2, 3, 4, 5, 6].map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {h}:00 AM (next day)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Social Links Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>Social Links</h3>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ name: "", link: "", iconPath: "" })}
                  disabled={fields.length >= 3}>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Social Link
                </Button>
              </div>

              {fields.length === 0 && (
                <div className='text-center p-8 border-2 border-dashed rounded-lg'>
                  <p className='text-sm text-muted-foreground'>
                    No social links added yet. Click "Add Social Link" to add
                    Facebook, WhatsApp, or Instagram.
                  </p>
                </div>
              )}

              {fields.length >= 3 && availablePlatforms.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  All social platforms added (Facebook, WhatsApp, Instagram).
                </p>
              )}
              <div className='space-y-4'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-xl bg-muted/50 shadow-sm relative'>
                    {/* Left side: Platform + URL */}
                    <div className='flex-1 flex flex-col md:flex-row gap-3 w-full md:w-auto'>
                      {/* Platform Select */}
                      <FormField
                        control={form.control}
                        name={`socials.${index}.name`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormLabel>Platform</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue(
                                    `socials.${index}.iconPath`,
                                    "",
                                  );
                                }}
                                defaultValue={field.value}>
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.value && (
                                    <SelectItem value={field.value}>
                                      {field.value}
                                    </SelectItem>
                                  )}
                                  {availablePlatforms.map((platform) => (
                                    <SelectItem key={platform} value={platform}>
                                      {platform}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* URL Input */}
                      <FormField
                        control={form.control}
                        name={`socials.${index}.link`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder='https://...' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right side: Icon Upload + Remove Button */}
                    <div className='flex items-center gap-4'>
                      {/* Icon Upload */}
                      <FormField
                        control={form.control}
                        name={`socials.${index}.iconPath`}
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <IconUpload
                                value={field.value}
                                onChange={field.onChange}
                                platformName={form.watch(
                                  `socials.${index}.name`,
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Remove Row Button */}
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        onClick={() => remove(index)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Appearance & Other Settings */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Appearance & Other</h3>

              <div
                className={`grid ${
                  role === "admin" ? "grid-cols-3" : "grid-cols-2"
                } gap-4`}>
                {/* Theme */}
                <FormField
                  control={form.control}
                  name='theme'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select a theme' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='light'>Light</SelectItem>
                          <SelectItem value='dark'>Dark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {role === "admin" && (
                  <FormField
                    control={form.control}
                    name='storetype'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select currency' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='general'>General</SelectItem>
                            <SelectItem value='clothing'>Clothing</SelectItem>
                            <SelectItem value='food'>Food</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Currency */}
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PKR'>
                            PKR - Pakistani Rupee
                          </SelectItem>
                          <SelectItem value='USD'>USD - US Dollar</SelectItem>
                          <SelectItem value='EUR'>EUR - Euro</SelectItem>
                          <SelectItem value='GBP'>
                            GBP - British Pound
                          </SelectItem>
                          <SelectItem value='INR'>
                            INR - Indian Rupee
                          </SelectItem>
                          <SelectItem value='AED'>AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer Note */}
              <FormField
                control={form.control}
                name='footerNote'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Footer Note</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Thank you for shopping with us!'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Submit Button */}
            <Button type='submit' className='w-full' size='lg'>
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </Item>
  );
}
