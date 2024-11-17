import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Link } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import GetStarted from "./pages/GetStarted";
import PaymentPage from "./pages/PaymentPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { Button } from "@/components/ui/button";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/getting-started">
          <ProtectedRoute>
            <GetStarted />
          </ProtectedRoute>
        </Route>
        <Route path="/generator">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>
        <Route path="/projects">
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        </Route>
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="mb-4">Page Not Found</p>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster />
    </SWRConfig>
  </StrictMode>
);
