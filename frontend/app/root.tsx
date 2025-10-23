import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import React from "react";
import ReactQueryProvider from "./provider/react-query-provider";

// 🟣 1️⃣ Import Sentry and its React Router v7 integration
import * as Sentry from "@sentry/react";
import { reactRouterV7BrowserTracingIntegration } from "@sentry/react";

// 🟣 2️⃣ Initialize Sentry globally (runs once on client)
Sentry.init({
  dsn: "https://47a1555a236b3933334e485cc2b1f57b@o4507227586166784.ingest.de.sentry.io/4510240077447248",
  integrations: [
    reactRouterV7BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  environment: import.meta.env.MODE,
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// 🟣 3️⃣ Keep your layout as-is
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 🟣 4️⃣ Your main app logic (unchanged)
export default function App() {
  return (
    <ReactQueryProvider>
      <Outlet />
    </ReactQueryProvider>
  );
}

// 🟣 5️⃣ Wrap your error boundary in Sentry.ErrorBoundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <main className="pt-16 p-4 container mx-auto">
          <h1>Oops!</h1>
          <p>Something went wrong.</p>
        </main>
      }
    >
      <ErrorView error={error} />
    </Sentry.ErrorBoundary>
  );
}

// 🟣 6️⃣ Extracted view logic (same as before)
function ErrorView({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
