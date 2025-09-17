import React from "react";
import { useStorageUsage } from "@/hooks/use-storage";
import { Progress } from "../components/ui/progress";
import { HardDrive, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

export const StorageIndicator = () => {
  const { data, isLoading, error } = useStorageUsage();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <HardDrive className="w-4 h-4" />
        <span className="hidden md:block ml-2">Loading...</span>
      </Button>
    );
  }

  if (error || !data) {
    return (
      <Button variant="ghost" size="sm">
        <HardDrive className="w-4 h-4" />
        <span className="hidden md:block ml-2">Storage</span>
      </Button>
    );
  }

  const { usage } = data;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${
            usage.isOverLimit ? "text-red-600" : ""
          }`}
        >
          <HardDrive className="w-4 h-4" />
          {usage.isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className="hidden md:block">
            {usage.totalSizeGB.toFixed(1)}GB / {usage.limitGB}GB
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage Usage
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>
                {usage.totalSizeGB.toFixed(1)} GB of {usage.limitGB} GB
              </span>
            </div>

            <Progress value={usage.usagePercentage} className="h-2" />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usage.totalFiles} files</span>
              <span>{usage.usagePercentage.toFixed(1)}% used</span>
            </div>
          </div>

          {usage.usagePercentage > 80 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {usage.isOverLimit
                  ? "Storage limit exceeded!"
                  : "Storage almost full"}
              </p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            <p>• Counts files from all workspaces you own</p>
            <p>• Limit applies per workspace owner</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
