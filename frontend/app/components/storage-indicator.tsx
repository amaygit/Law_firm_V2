import React from "react";
import { useStorageUsage } from "@/hooks/use-storage";
import { Progress } from "../components/ui/progress";
import { HardDrive, AlertTriangle, AlertCircle } from "lucide-react";
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
  const isNearLimit = usage.usagePercentage >= 80;
  const isOverLimit = usage.isOverLimit;

  // ✅ NEW: Dynamic styling based on usage
  const getButtonStyle = () => {
    if (isOverLimit) return "text-red-600 border-red-300";
    if (isNearLimit) return "text-yellow-600 border-yellow-300";
    return "";
  };

  const getProgressColor = () => {
    if (isOverLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${getButtonStyle()}`}
        >
          <HardDrive className="w-4 h-4" />
          {isOverLimit && <AlertCircle className="w-4 h-4 text-red-500" />}
          {isNearLimit && !isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
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
            {isOverLimit && <AlertCircle className="w-4 h-4 text-red-500" />}
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span className={isOverLimit ? "text-red-600 font-medium" : ""}>
                {usage.totalSizeGB.toFixed(1)} GB of {usage.limitGB} GB
              </span>
            </div>

            {/* ✅ NEW: Enhanced progress bar with color coding */}
            <div className="relative">
              <Progress
                value={Math.min(usage.usagePercentage, 100)}
                className="h-2"
              />
              {isOverLimit && (
                <div className="absolute top-0 left-0 h-2 w-full bg-red-500 rounded-full opacity-80" />
              )}
              {isNearLimit && !isOverLimit && (
                <div
                  className="absolute top-0 left-0 h-2 bg-yellow-500 rounded-full opacity-80"
                  style={{ width: `${usage.usagePercentage}%` }}
                />
              )}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usage.totalFiles} files</span>
              <span className={isOverLimit ? "text-red-600 font-medium" : ""}>
                {usage.usagePercentage.toFixed(1)}% used
              </span>
            </div>
          </div>

          {/* ✅ ENHANCED: Better warning messages */}
          {isOverLimit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  Storage Limit Exceeded!
                </p>
              </div>
              <p className="text-xs text-red-700">
                You cannot upload new files until you free up space or upgrade
                your plan.
              </p>
            </div>
          )}

          {isNearLimit && !isOverLimit && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Storage Almost Full
                </p>
              </div>
              <p className="text-xs text-yellow-700">
                Consider freeing up space soon to avoid upload restrictions.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>• Counts files from all workspaces you own</p>
            <p>• Limit applies per workspace owner</p>
            <p>• Maximum 50MB per individual file</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
