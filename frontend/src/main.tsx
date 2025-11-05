import { createHashRouter, RouterProvider } from "react-router-dom";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import HomePage from "@/pages/HomePage.tsx";
import SalesPage from "@/pages/SalesPage.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import ProductPage from "@/pages/ProductPage.tsx";
import BarCodePage from "@/pages/BarCodePage.tsx";
import ExpensePage from "@/pages/ExpensePage.tsx";
import POSFrontPage from "@/pages/POSFrontPage.tsx";
import SettingPage from "@/pages/SettingPage.tsx";
import LoginPage, { SignupPage } from "./pages/AuthPage.tsx";
import { Toaster } from "@/components/ui/sonner";
import { Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "./components/ui/spinner.tsx";
import { toast } from "sonner";

export const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<{
    email: string;
    role: string;
    username: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShown = useRef(false); // 👈 flag to prevent duplicates

  useEffect(() => {
    window.api.store.getLogin().then((data) => {
      setIsLoggedIn(data);
      setTimeout(() => setIsLoading(false), 2000);
    });
  }, []);

  useEffect(() => {
    if (!isLoading && isLoggedIn && !toastShown.current) {
      toastShown.current = true; // ✅ ensures this block runs once
      const userRole = isLoggedIn.role;
      if (!userRole) {
        toast.error("User role is undefined");
        return;
      }
      if (userRole === "admin") {
        toast.message("Admin user logged in");
        setTimeout(() => {
          toast.message("Welcome to the admin dashboard");
        }, 1000);
        return;
      }
      toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
        success: (
          <>
            <p>Welcome to the application!</p>
            <p>{userRole.toUpperCase()} access granted.</p>
          </>
        ),
        error: "Error verifying user",
      });
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading) {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Verifying user...",
      success: "User verified",
      error: "Error verifying user",
    });
    return (
      <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50'>
        <Spinner />
      </div>
    );
  }

  const userRole = isLoggedIn ? isLoggedIn.role : null;
  return userRole ? element : <Navigate to='/login' replace />;
};

const router = createHashRouter([
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <PrivateRoute element={<App />} />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/product", element: <ProductPage /> },
      { path: "/sales", element: <SalesPage /> },
      { path: "/barcodes", element: <BarCodePage /> },
      { path: "/expenses", element: <ExpensePage /> },
      { path: "/pos", element: <POSFrontPage /> },
      { path: "/settings", element: <SettingPage /> },
      {
        path: "*",
        element: <div>404 Not Found</div>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
    <Toaster position='top-center' richColors visibleToasts={5} />
    <RouterProvider router={router} />
  </ThemeProvider>
  // </StrictMode>
);
