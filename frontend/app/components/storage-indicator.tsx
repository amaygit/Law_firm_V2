// frontend/app/components/storage-indicator.tsx - Updated for Google Drive
import React from "react";
import {
  useGoogleDriveStorage,
  useGoogleDriveStatus,
} from "@/hooks/use-google-drive";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Cloud, CloudOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router";

export const StorageIndicator = () => {
  const { data: statusData, isLoading: statusLoading } = useGoogleDriveStatus();
  const { data: storageData, isLoading: storageLoading } =
    useGoogleDriveStorage();

  const isLoading = statusLoading || storageLoading;
  const isConnected = statusData?.connected;
  const usage = storageData?.usage;

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <HardDrive className="w-4 h-4" />
        <span className="hidden md:block ml-2">Loading...</span>
      </Button>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-yellow-600">
            <CloudOff className="w-4 h-4" />
            <span className="hidden md:block ml-2">Connect Drive</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CloudOff className="w-4 h-4" />
              Google Drive Not Connected
            </h3>
            <p className="text-sm text-muted-foreground">
              Connect your Google Drive to upload and manage case files.
            </p>
            <Link to="/user/profile">
              <Button className="w-full" size="sm">
                <Cloud className="mr-2 h-4 w-4" />
                Connect in Settings
              </Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Connected state
  const totalGB = usage?.totalSizeGB || 0;
  const totalFiles = usage?.totalFiles || 0;

  // Google Drive free tier is 15GB
  const limitGB = 15;
  const usagePercentage = (totalGB / limitGB) * 100;
  const isNearLimit = usagePercentage >= 80;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${isNearLimit ? "text-yellow-600" : ""}`}
        >
          <Cloud className="w-4 h-4 text-green-500" />
          {isNearLimit && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          <span className="hidden md:block">{totalGB.toFixed(2)}GB</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4 text-green-500" />
            Google Drive Storage
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used in CaseMaster</span>
              <span>{totalGB.toFixed(2)} GB</span>
            </div>

            <Progress value={Math.min(usagePercentage, 100)} className="h-2" />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalFiles} files</span>
              <span>
                {usagePercentage.toFixed(1)}% of {limitGB}GB
              </span>
            </div>
          </div>

          {isNearLimit && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Storage Getting Full
                </p>
              </div>
              <p className="text-xs text-yellow-700">
                Consider upgrading your Google Drive or cleaning up old files.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Connected: {statusData?.email}</p>
            <p>• Files stored in: CaseMaster/tasks/</p>
            <p>• Google Drive free tier: 15GB</p>
          </div>

          <Link to="/user/profile">
            <Button variant="outline" size="sm" className="w-full">
              Manage Connection
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
