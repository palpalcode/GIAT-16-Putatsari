import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import AdminPage from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import TimPage from "@/pages/tim";
import PengumumanPage from "@/pages/pengumuman";
import DeadlinePage from "@/pages/deadline";
import OurLifePage from "@/pages/our-life";
import OurWorkPage from "@/pages/our-work";
import MasalahPage from "@/pages/masalah";
import KasPage from "@/pages/kas";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tim" component={TimPage} />
        <Route path="/our-life" component={OurLifePage} />
        <Route path="/our-work" component={OurWorkPage} />
        <Route path="/pengumuman" component={PengumumanPage} />
        <Route path="/deadline" component={DeadlinePage} />
        <Route path="/masalah" component={MasalahPage} />
        <Route path="/kas" component={KasPage} />
        <Route path="/admin" component={AdminPage} />
        {/* legacy redirects */}
        <Route path="/kehidupan" component={OurLifePage} />
        <Route path="/proker" component={OurWorkPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
