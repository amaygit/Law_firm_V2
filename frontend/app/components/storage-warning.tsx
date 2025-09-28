import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, HardDrive } from "lucide-react";
import { useStorageUsage } from "@/hooks/use-storage";

interface StorageWarningProps {
  showOnlyWhenNearLimit?: boolean;
  className?: string;
}

export const StorageWarning: React.FC<StorageWarningProps> = ({
  showOnlyWhenNearLimit = true,
  className = "",
}) => {
  const { data, isLoading } = useStorageUsage();

  if (isLoading || !data) return null;

  const { usage } = data;
  const isNearLimit = usage.usagePercentage >= 80;
  const isOverLimit = usage.isOverLimit;

  // Only show when near limit if specified
  if (showOnlyWhenNearLimit && !isNearLimit) return null;

  return (
    <Alert
      className={`${className} ${
        isOverLimit ? "border-red-500" : "border-yellow-500"
      }`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${
          isOverLimit ? "text-red-500" : "text-yellow-500"
        }`}
      />
      <AlertDescription>
        <div className="space-y-2">
          <p
            className={`font-medium ${
              isOverLimit ? "text-red-800" : "text-yellow-800"
            }`}
          >
            {isOverLimit
              ? "🚨 Storage Limit Exceeded!"
              : "⚠️ Storage Almost Full"}
          </p>
          <p className="text-sm text-muted-foreground">
            You've used {usage.totalSizeGB.toFixed(1)} GB of {usage.limitGB} GB
            ({usage.usagePercentage.toFixed(1)}% full)
          </p>
          {isOverLimit && (
            <p className="text-sm text-red-600">
              You cannot upload new files until you free up space or upgrade
              your plan.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
