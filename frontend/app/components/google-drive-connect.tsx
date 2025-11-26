// // frontend/app/components/google-drive-connect.tsx
// import React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Loader2,
//   Cloud,
//   CloudOff,
//   CheckCircle,
//   ExternalLink,
// } from "lucide-react";
// import {
//   useGoogleDriveStatus,
//   useGetGoogleAuthUrl,
//   useDisconnectGoogleDrive,
// } from "@/hooks/use-google-drive";
// import { toast } from "sonner";
// import { formatDistanceToNow } from "date-fns";

// export const GoogleDriveConnect: React.FC = () => {
//   const { data: status, isLoading: statusLoading } = useGoogleDriveStatus();
//   const { mutate: getAuthUrl, isPending: gettingUrl } = useGetGoogleAuthUrl();
//   const { mutate: disconnect, isPending: disconnecting } =
//     useDisconnectGoogleDrive();

//   const handleConnect = () => {
//     getAuthUrl(undefined, {
//       onSuccess: (data: any) => {
//         // Redirect to Google OAuth
//         window.location.href = data.authUrl;
//       },
//       onError: () => {
//         toast.error("Failed to start Google authentication");
//       },
//     });
//   };

//   const handleDisconnect = () => {
//     if (
//       !confirm(
//         "Are you sure you want to disconnect Google Drive? Your uploaded files will remain in your Drive."
//       )
//     ) {
//       return;
//     }

//     disconnect(undefined, {
//       onSuccess: () => {
//         toast.success("Google Drive disconnected");
//       },
//       onError: () => {
//         toast.error("Failed to disconnect");
//       },
//     });
//   };

//   if (statusLoading) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center py-8">
//           <Loader2 className="h-6 w-6 animate-spin" />
//         </CardContent>
//       </Card>
//     );
//   }

//   const isConnected = status?.connected;

//   return (
//     <Card>
//       {/* <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           {isConnected ? (
//             <Cloud className="h-5 w-5 text-green-500" />
//           ) : (
//             <CloudOff className="h-5 w-5 text-muted-foreground" />
//           )}
//           Google Drive Integration
//         </CardTitle>
//       </CardHeader> */}

//       <CardContent className="space-y-4">
//         {isConnected ? (
//           <>
//             <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
//               <CheckCircle className="h-5 w-5 text-green-600" />
//               <div className="flex-1">
//                 <p className="font-medium text-green-800 dark:text-green-200">
//                   Connected
//                 </p>
//                 <p className="text-sm text-green-600 dark:text-green-400">
//                   {status?.email}
//                 </p>
//               </div>
//               <Badge variant="outline" className="text-green-600">
//                 Active
//               </Badge>
//             </div>

//             {status?.connectedAt && (
//               <p className="text-sm text-muted-foreground">
//                 Connected{" "}
//                 {formatDistanceToNow(new Date(status.connectedAt), {
//                   addSuffix: true,
//                 })}
//               </p>
//             )}

//             <Alert>
//               <AlertDescription>
//                 Files you upload to tasks will be stored in your Google Drive
//                 under
//                 <code className="mx-1 px-1 bg-muted rounded">
//                   CaseMaster/tasks/
//                 </code>
//                 folder.
//               </AlertDescription>
//             </Alert>

//             <Button
//               variant="outline"
//               onClick={handleDisconnect}
//               disabled={disconnecting}
//               className="w-full"
//             >
//               {disconnecting ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <CloudOff className="mr-2 h-4 w-4" />
//               )}
//               Disconnect Google Drive
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button
//               onClick={handleConnect}
//               disabled={gettingUrl}
//               className="w-full"
//             >
//               {gettingUrl ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <Cloud className="mr-2 h-4 w-4" />
//               )}
//               Connect Google Drive
//             </Button>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
// frontend/app/components/google-drive-connect.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Cloud, CloudOff, Check } from "lucide-react";
import {
  useGoogleDriveStatus,
  useGetGoogleAuthUrl,
  useDisconnectGoogleDrive,
} from "@/hooks/use-google-drive";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Ensure you have this utility or remove cn usage

export const GoogleDriveConnect: React.FC = () => {
  const { data: status, isLoading: statusLoading } = useGoogleDriveStatus();
  const { mutate: getAuthUrl, isPending: gettingUrl } = useGetGoogleAuthUrl();
  const { mutate: disconnect, isPending: disconnecting } =
    useDisconnectGoogleDrive();

  const handleConnect = () => {
    getAuthUrl(undefined, {
      onSuccess: (data: any) => {
        window.location.href = data.authUrl;
      },
      onError: () => {
        toast.error("Failed to start Google authentication");
      },
    });
  };

  const handleDisconnect = () => {
    if (
      !confirm(
        `Connected as ${status?.email}.\n\nAre you sure you want to disconnect?`
      )
    ) {
      return;
    }

    disconnect(undefined, {
      onSuccess: () => {
        toast.success("Google Drive disconnected");
      },
      onError: () => {
        toast.error("Failed to disconnect");
      },
    });
  };

  if (statusLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const isConnected = status?.connected;

  if (isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        disabled={disconnecting}
        className={cn(
          "border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50 bg-green-50/50",
          "transition-all duration-200"
        )}
        title={`Connected: ${status?.email} (Click to disconnect)`}
      >
        {disconnecting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Drive Connected
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      disabled={gettingUrl}
      className="gap-2"
    >
      {gettingUrl ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Cloud className="h-4 w-4" />
      )}
      Connect Drive
    </Button>
  );
};
