// import { useAuth } from "@/provider/auth-context";
// import type { Workspace } from "@/types";
// import { Button } from "../ui/button";
// import { Bell, PlusCircle } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuItem,
//   DropdownMenuGroup,
// } from "../ui/dropdown-menu";
// import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
// import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
// import { WorkspaceAvatar } from "../workspace/workspace-avatar";
// import { StorageIndicator } from "../storage-indicator";

// interface HeaderProps {
//   onWorkspaceSelected: (workspace: Workspace) => void;
//   selectedWorkspace: Workspace | null;
//   onCreateWorkspace: () => void;
// }

// export const Header = ({
//   onWorkspaceSelected,
//   selectedWorkspace,
//   onCreateWorkspace,
// }: HeaderProps) => {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();
//   const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
//   const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

//   const handleOnClick = (workspace: Workspace) => {
//     onWorkspaceSelected(workspace);
//     const location = window.location;

//     if (isOnWorkspacePage) {
//       navigate(`/workspaces/${workspace._id}`);
//     } else {
//       const basePath = location.pathname;
//       navigate(`${basePath}?workspaceId=${workspace._id}`);
//     }
//   };

//   return (
//     <div className="bg-background sticky top-0 z-40 border-b">
//       <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant={"outline"}>
//               {selectedWorkspace ? (
//                 <>
//                   {selectedWorkspace.color && (
//                     <WorkspaceAvatar
//                       color={selectedWorkspace.color}
//                       name={selectedWorkspace.name}
//                     />
//                   )}
//                   <span className="font-medium">{selectedWorkspace?.name}</span>
//                 </>
//               ) : (
//                 <span className="font-medium">Select Workspace</span>
//               )}
//             </Button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent>
//             <DropdownMenuLabel>Workspace</DropdownMenuLabel>
//             <DropdownMenuSeparator />

//             <DropdownMenuGroup>
//               {workspaces.map((ws) => (
//                 <DropdownMenuItem
//                   key={ws._id}
//                   onClick={() => handleOnClick(ws)}
//                 >
//                   {ws.color && (
//                     <WorkspaceAvatar color={ws.color} name={ws.name} />
//                   )}
//                   <span className="ml-2">{ws.name}</span>
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuGroup>

//             <DropdownMenuGroup>
//               <DropdownMenuItem onClick={onCreateWorkspace}>
//                 <PlusCircle className="w-4 h-4 mr-2" />
//                 Create Workspace
//               </DropdownMenuItem>
//             </DropdownMenuGroup>
//           </DropdownMenuContent>
//         </DropdownMenu>

//         <div className="flex items-center gap-2">
//           <StorageIndicator />
//           <Button variant="ghost" size="icon">
//             <Bell />
//           </Button>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="rounded-full border p-1 w-8 h-8">
//                 <Avatar className="w-8 h-8">
//                   {user?.profilePicture ? (
//                     <AvatarImage src={user.profilePicture} alt={user.name} />
//                   ) : null}
//                   <AvatarFallback className="bg-primary text-primary-foreground">
//                     {user?.name?.charAt(0).toUpperCase() || "U"}
//                   </AvatarFallback>
//                 </Avatar>
//               </button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>My Account</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>
//                 <Link to="/user/profile">Profile</Link>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </div>
//   );
// };

import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { StorageIndicator } from "../storage-indicator";
import { toast } from "sonner";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
  const location = useLocation();
  const isOnWorkspacePage = location.pathname.includes("/workspace");

  // ✅ Check if we're on the dashboard page
  const isOnDashboard =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard/") ||
    location.pathname === "/members" ||
    location.pathname.startsWith("/members/");

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    const currentLocation = window.location;

    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      const basePath = currentLocation.pathname;
      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  // ✅ Handle Vakalatnama download
  const handleVakalatnamaDownload = (language: "english" | "hindi") => {
    const urls = {
      english:
        "https://ecourts.gov.in/ecourts_home/forms/Vakalatnama%20form.pdf",
      hindi:
        "https://cdnbbsr.s3waas.gov.in/s3ec0196629f1aac6ddb7a7cfa82574b67/uploads/2023/02/2023022137.pdf",
    };

    const url = urls[language];
    const fileName =
      language === "english"
        ? "Vakalatnama_Form_English.pdf"
        : "Vakalatnama_Form_Hindi.pdf";

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Downloading Vakalatnama form in ${
          language === "english" ? "English" : "Hindi"
        }`
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again.");
    }
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* ✅ Only show workspace dropdown on dashboard */}
        {isOnDashboard ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                {selectedWorkspace ? (
                  <>
                    {selectedWorkspace.color && (
                      <WorkspaceAvatar
                        color={selectedWorkspace.color}
                        name={selectedWorkspace.name}
                      />
                    )}
                    <span className="font-medium">
                      {selectedWorkspace?.name}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">Select Workspace</span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws._id}
                    onClick={() => handleOnClick(ws)}
                  >
                    {ws.color && (
                      <WorkspaceAvatar color={ws.color} name={ws.name} />
                    )}
                    <span className="ml-2">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onCreateWorkspace}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Workspace
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // ✅ Empty div to maintain layout spacing when not on dashboard
          <div />
        )}

        {/* ✅ Right section */}
        <div className="flex items-center gap-2">
          {/* ✅ Desktop: show StorageIndicator & Vakalatnama inline */}
          <StorageIndicator />
          <div className="hidden sm:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download Vakalatnama</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleVakalatnamaDownload("english")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleVakalatnamaDownload("hindi")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Hindi (हिंदी)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ✅ Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-1 w-8 h-8">
                <Avatar className="w-8 h-8">
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* ✅ Mobile: show StorageIndicator & Vakalatnama in dropdown */}
              <div className="sm:hidden">
                <DropdownMenuSeparator />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                      <Download className="w-4 h-4" />
                      Vakalatnama
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="left">
                    <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleVakalatnamaDownload("english")}
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleVakalatnamaDownload("hindi")}
                    >
                      Hindi (हिंदी)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
