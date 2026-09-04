import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PageViewTracker from "./components/PageViewTracker.tsx";

const queryClient = new QueryClient();

const StaticPageRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <p className="mx-auto max-w-xl text-sm text-muted-foreground">
        Opening the static Folio CV page.
      </p>
    </main>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Index initialScreen="dashboard" />} />
          <Route path="/dashboard/simulator" element={<Index initialScreen="editor" />} />
          <Route path="/dashboard/matcher" element={<Index initialScreen="matcher" />} />
          <Route path="/dashboard/tracker" element={<Index initialScreen="tracker" />} />
          <Route path="/dashboard/writer" element={<Index initialScreen="writer" />} />
          <Route path="/pricing" element={<StaticPageRedirect to="/pricing/" />} />
          <Route path="/how-it-works" element={<StaticPageRedirect to="/how-it-works/" />} />
          <Route path="/features" element={<StaticPageRedirect to="/features/" />} />
          <Route path="/faq" element={<StaticPageRedirect to="/faq/" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PageViewTracker />
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
