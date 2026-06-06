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
import InventarisPage from "@/pages/inventaris";
import KehidupanPage from "@/pages/kehidupan";
import ProkerPage from "@/pages/proker";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tim" component={TimPage} />
        <Route path="/kehidupan" component={KehidupanPage} />
        <Route path="/proker" component={ProkerPage} />
        <Route path="/inventaris" component={InventarisPage} />
        <Route path="/pengumuman" component={PengumumanPage} />
        <Route path="/deadline" component={DeadlinePage} />
        <Route path="/admin" component={AdminPage} />
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
