import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CRTToggle } from "@/components/ui/crt-effect";
import Dashboard from "@/pages/dashboard";
import StudySession from "@/pages/study-session";
import Confidence from "@/pages/confidence";
import Schedule from "@/pages/schedule";
import References from "@/pages/references";
import NotFound from "@/pages/not-found";
import { Menu } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/study" component={StudySession} />
      <Route path="/confidence" component={Confidence} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/references" component={References} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <CRTToggle />
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b-2 border-foreground">
                <SidebarTrigger data-testid="button-sidebar-toggle">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
              </header>
              <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-background/95 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='%23000000'/%3E%3Crect x='10' width='10' height='10' fill='%23ffffff'/%3E%3Crect y='10' width='10' height='10' fill='%23ffffff'/%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="relative z-10">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
