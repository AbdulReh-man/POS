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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EyeClosedIcon, EyeIcon, UserPlus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { SignupForm } from "../signup-form";

// ✅ Zod Schema
const userSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email format"),
    role: z.enum(["admin", "manager", "cashier"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

// ✅ TypeScript type
type UserFormType = z.infer<typeof userSchema>;
export default function UserForm() {
  const [togglePassword, setTogglePassword] = useState<boolean>(false);
  const form = useForm<UserFormType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "cashier",
      confirmPassword: "",
    },
  });

  function EyeToggle() {
    return setTogglePassword((prev) => !prev);
  }

     // Handle form submission
    
    function onSubmit(data: UserFormType) {
        console.log("Form Data:", data);
        // You can replace the above line with actual submission logic
    }
  
  useEffect(() => {
    const getusersettings = async () => {
      const userData = await window.api.store.getLogin();
      if (userData) {
        console.log(userData);
        
        form.reset({
          name: userData.username || "",
          email: userData.email || "",
          role: (userData.role as "admin" | "manager" | "cashier"),
          password: "",
          confirmPassword: "",
        });
      }
    };
    getusersettings();
  },[form])
  
  return (
    <div className='max-w-7xl mx-auto p-4'>
      <Card className='shadow-md border border-border/60 rounded-2xl bg-card'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl font-semibold'>
              Update User Information
            </CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <UserPlus className='w-5 h-5 text-primary' />
              </AlertDialogTrigger>
              {/* <AlertDialogContent>
                {form.getValues("role") == "admin" ? (
                  <SignupPage />
                ) : (
                  <>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        You Don't Have Permission
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Please contact the administrator to gain access.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </>
                )}
              </AlertDialogContent> */}
              <AlertDialogContent>
                {form.getValues("role") === "admin" ? (
                  <div className='w-full max-w-md'>
                    <AlertDialogHeader>
                      <div className='flex justify-end items-center'>
                        <AlertDialogCancel>
                          <X />
                        </AlertDialogCancel>
                      </div>
                      <SignupForm  />
                    </AlertDialogHeader>
                  </div>
                ) : (
                  <>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        You Don't Have Permission
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Please contact the administrator to gain access.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </>
                )}
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            Update Your details and manage account settings.
          </p>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 p-4'>
            <CardContent className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Name */}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter full name'
                          {...field}
                          className='rounded-xl'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role */}
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className='rounded-xl w-full'>
                            <SelectValue placeholder='Select Role' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='admin'>Admin</SelectItem>
                          <SelectItem value='manager'>Manager</SelectItem>
                          <SelectItem value='cashier'>Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Email */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type='email'
                          placeholder='user@example.com'
                          {...field}
                        />
                        <InputGroupAddon align='inline-end'>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className='rounded-full'
                                size='icon-xs'>
                                <IconInfoCircle />
                              </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              Please use a valid email address.
                            </TooltipContent>
                          </Tooltip>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Password */}
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            placeholder='••••••••'
                            type={togglePassword ? "text" : "password"}
                            {...field}
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupButton
                              variant='ghost'
                              size='icon-xs'
                              onClick={EyeToggle}>
                              {togglePassword ? <EyeIcon /> : <EyeClosedIcon />}
                              <span className='sr-only'>Send</span>
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            placeholder='••••••••'
                            type={togglePassword ? "text" : "password"}
                            {...field}
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupButton
                              variant='ghost'
                              size='icon-xs'
                              onClick={EyeToggle}>
                              {togglePassword ? <EyeIcon /> : <EyeClosedIcon />}
                              <span className='sr-only'>Send</span>
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className='flex justify-end'>
              <Button
                type='submit'
                className='px-6 rounded-xl shadow hover:shadow-lg transition-all'>
                Save User
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}