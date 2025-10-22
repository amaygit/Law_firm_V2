import React from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/provider/auth-context";
import Header from "@/components/Header";
import "@/app.css";
import Hero from "@/components/Hero";
import { ReactLenis } from "lenis/react";
import Brand from "@/components/Brand";
import Feature from "@/components/Feature";
import Process from "@/components/Process";
import Overview from "@/components/Overview";
import Review from "@/components/Review";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
const PublicLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    // Redirect logged-in users to dashboard automatically
    return <Navigate to="/dashboard" replace />;
  }

  // For unauthenticated users, show landing with header and children routes
  return (
    <ReactLenis root>
      <div
        style={{
          background: "oklch(0.129 0.042 264.695)", // dark background
          color: "oklch(0.984 0.003 247.858)", // light text
          minHeight: "100vh",
          width: "100%",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
        className="relative isolate overflow-hidden"
      >
        <Header />
        <main>
          <Hero />
          <Brand />
          <div id="features">
            <Feature />
          </div>
          <Process />
          <Overview />
          <div id="cta">
          <Cta/>
          </div>
          <Review />
        </main>
        <Footer />

        {/* <main className="flex-1">
        <Outlet />
      </main> */}
      </div>
    </ReactLenis>
  );
};

export default PublicLayout;
