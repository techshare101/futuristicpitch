import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import { Toaster } from "./components/ui/toaster";

// Add Stripe script
const stripeScript = document.createElement('script');
stripeScript.src = 'https://js.stripe.com/v3/buy-button.js';
stripeScript.async = true;
document.head.appendChild(stripeScript);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/generator" component={Home} />
        <Route path="/sign-up" component={SignUp} />
        <Route>404 Page Not Found</Route>
      </Switch>
      <Toaster />
    </SWRConfig>
  </StrictMode>,
);
