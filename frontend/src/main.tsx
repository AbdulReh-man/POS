import { createHashRouter, RouterProvider } from "react-router-dom";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import HomePage from "./pages/HomePage.tsx";
import SalesPage from "./pages/SalesPage.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import BarCodePage from "./pages/BarCodePage.tsx";
import ExpensePage from "./pages/ExpensePage.tsx";
import POSFrontPage from "./pages/POSFrontPage.tsx";
import SettingPage from "./pages/SettingPage.tsx";
import LoginPage, { SignupPage } from "./pages/AuthPage.tsx";

import { Navigate } from "react-router-dom";

// Create a PrivateRoute wrapper component
export const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  const isLoggedIn = !!localStorage.getItem("authToken"); // or your auth check logic
  return !isLoggedIn ? element : <Navigate to='/signup' replace />;
};

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PrivateRoute element={<HomePage />} /> },
      { path: "/product", element: <PrivateRoute element={<ProductPage />} /> },
      { path: "/sales", element: <PrivateRoute element={<SalesPage />} /> },
      { path: "/barcodes", element: <PrivateRoute element={<BarCodePage />} /> },
      { path: "/expenses", element: <PrivateRoute element={<ExpensePage />} /> },
      { path: "/pos", element: <PrivateRoute element={<POSFrontPage />} /> },
      { path: "/settings", element: <PrivateRoute element={<SettingPage />} /> },
      {
        path: "*",
        element: <div>404 Not Found</div>,
      },
    ],
  },
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
]);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <RouterProvider router={router} />
    </ThemeProvider>
  // </StrictMode>
);
