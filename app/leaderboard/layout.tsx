import AppShell from "@/components/AppShell";
import { Toaster } from "@/components/Toaster";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell><Toaster />{children}</AppShell>;
}
