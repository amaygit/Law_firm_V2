// frontend/app/routes/auth/google/callback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader } from "@/components/loader";

export default function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Parse the hash fragment (OAuth2 implicit flow returns token in hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");
    const state = params.get("state");

    if (accessToken && expiresIn) {
      // Store token
      const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
      localStorage.setItem("google_access_token", accessToken);
      localStorage.setItem("google_token_expires_at", expiresAt.toString());

      console.log("✅ OAuth successful, token stored");

      // Get the workspace ID from the previous page
      const workspaceId = sessionStorage.getItem("current_workspace_id");

      // Redirect back to meetings page
      if (workspaceId) {
        navigate(`/meetings?workspaceId=${workspaceId}`);
      } else {
        navigate("/meetings");
      }
    } else {
      console.error("❌ OAuth failed - no access token");
      navigate("/meetings");
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader />
        <p className="text-sm text-muted-foreground">
          Completing Google sign-in...
        </p>
      </div>
    </div>
  );
}
