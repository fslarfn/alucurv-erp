import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "../context/InventoryContext";
import { OrderProvider } from "../context/OrderContext";
import { MasterDataProvider } from "../context/MasterDataContext";
import { EmployeeProvider } from "../context/EmployeeContext";
import { ExpenseProvider } from "../context/ExpenseContext";
import { ProcurementProvider } from "../context/ProcurementContext";
import { AuthProvider } from "../context/AuthContext"; // Import AuthProvider
import AuthWrapper from "../components/AuthWrapper"; // Import AuthWrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ALUCURV Operational Suite",
  description: "Sistem Manajemen Operasional Alucurv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <InventoryProvider>
            <OrderProvider>
              <MasterDataProvider>
                <EmployeeProvider>
                  <ExpenseProvider>
                    <ProcurementProvider>
                      <AuthWrapper>
                        {children}
                      </AuthWrapper>
                    </ProcurementProvider>
                  </ExpenseProvider>
                </EmployeeProvider>
              </MasterDataProvider>
            </OrderProvider>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
