"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Send,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProposalStatus = 
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

interface ProposalStatusTrackerProps {
  currentStatus: ProposalStatus;
  interactions?: Array<{
    type: string;
    createdAt: number;
    metadata?: any;
  }>;
  sentAt?: number;
  viewedAt?: number;
  respondedAt?: number;
  expiresAt?: number;
  onStatusUpdate?: (newStatus: ProposalStatus) => void;
  isClientView?: boolean;
}

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
  SENT: {
    label: "Sent",
    icon: Send,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
  },
  VIEWED: {
    label: "Viewed",
    icon: Eye,
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Clock,
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-300",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-300",
  },
  EXPIRED: {
    label: "Expired",
    icon: AlertCircle,
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
  },
};

const STATUS_PROGRESSION: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "UNDER_REVIEW",
  "ACCEPTED"
];

export function ProposalStatusTracker({
  currentStatus,
  interactions = [],
  sentAt,
  viewedAt,
  respondedAt,
  expiresAt,
  onStatusUpdate,
  isClientView = false
}: ProposalStatusTrackerProps) {
  const [expandHistory, setExpandHistory] = useState(false);

  const currentStatusConfig = STATUS_CONFIG[currentStatus];
  const StatusIcon = currentStatusConfig.icon;

  const getProgressPercentage = () => {
    if (currentStatus === "REJECTED" || currentStatus === "EXPIRED") {
      return 0;
    }
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / STATUS_PROGRESSION.length) * 100;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysSince = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const getExpirationStatus = () => {
    if (!expiresAt) return null;
    const daysUntilExpiration = Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { text: "Expired", color: "text-red-600", bgColor: "bg-red-50" };
    } else if (daysUntilExpiration <= 3) {
      return { text: `Expires in ${daysUntilExpiration} days`, color: "text-orange-600", bgColor: "bg-orange-50" };
    } else if (daysUntilExpiration <= 7) {
      return { text: `Expires in ${daysUntilExpiration} days`, color: "text-yellow-600", bgColor: "bg-yellow-50" };
    }
    return { text: `Expires in ${daysUntilExpiration} days`, color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  const expirationStatus = getExpirationStatus();

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proposal Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Status Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-3 rounded-full",
                currentStatusConfig.bgColor
              )}>
                <StatusIcon className={cn("h-5 w-5", currentStatusConfig.textColor)} />
              </div>
              <div>
                <p className="font-semibold text-lg">{currentStatusConfig.label}</p>
                {sentAt && (
                  <p className="text-sm text-gray-500">
                    {currentStatus === "SENT" ? "Sent " : ""}
                    {getDaysSince(sentAt)}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                currentStatusConfig.bgColor,
                currentStatusConfig.textColor,
                currentStatusConfig.borderColor
              )}
            >
              {currentStatusConfig.label}
            </Badge>
          </div>

          {/* Expiration Warning */}
          {expirationStatus && currentStatus !== "EXPIRED" && currentStatus !== "ACCEPTED" && currentStatus !== "REJECTED" && (
            <div className={cn(
              "p-3 rounded-lg flex items-center justify-between",
              expirationStatus.bgColor
            )}>
              <div className="flex items-center space-x-2">
                <AlertCircle className={cn("h-4 w-4", expirationStatus.color)} />
                <span className={cn("text-sm font-medium", expirationStatus.color)}>
                  {expirationStatus.text}
                </span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {!["REJECTED", "EXPIRED"].includes(currentStatus) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="pt-4">
            <div className="flex justify-between">
              {STATUS_PROGRESSION.map((status, index) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const isActive = STATUS_PROGRESSION.indexOf(currentStatus) >= index;
                const isCurrent = currentStatus === status;
                
                return (
                  <div key={status} className="flex flex-col items-center relative">
                    {index > 0 && (
                      <div
                        className={cn(
                          "absolute left-0 top-5 w-full h-0.5 -translate-x-1/2",
                          isActive ? "bg-blue-500" : "bg-gray-200"
                        )}
                        style={{ width: '100%', left: '-50%' }}
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 p-2 rounded-full",
                        isCurrent ? config.bgColor : isActive ? "bg-blue-100" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isCurrent ? config.textColor : isActive ? "text-blue-600" : "text-gray-400"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-xs mt-1",
                      isCurrent ? "font-semibold" : "text-gray-500"
                    )}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {sentAt && (
              <div>
                <p className="text-xs text-gray-500">Sent</p>
                <p className="text-sm font-medium">{formatDate(sentAt)}</p>
              </div>
            )}
            {viewedAt && (
              <div>
                <p className="text-xs text-gray-500">First Viewed</p>
                <p className="text-sm font-medium">{formatDate(viewedAt)}</p>
              </div>
            )}
            {respondedAt && (
              <div>
                <p className="text-xs text-gray-500">Responded</p>
                <p className="text-sm font-medium">{formatDate(respondedAt)}</p>
              </div>
            )}
            {expiresAt && (
              <div>
                <p className="text-xs text-gray-500">Expires</p>
                <p className="text-sm font-medium">{formatDate(expiresAt)}</p>
              </div>
            )}
          </div>

          {/* Interaction History */}
          {interactions.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandHistory(!expandHistory)}
                className="w-full justify-between"
              >
                <span>View Activity History</span>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  expandHistory && "rotate-90"
                )} />
              </Button>
              
              {expandHistory && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {interactions
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((interaction, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                        <div className="flex-1">
                          <p className="text-gray-700">
                            {interaction.type.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(interaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Status Update Actions (Admin Only) */}
          {!isClientView && onStatusUpdate && currentStatus !== "ACCEPTED" && currentStatus !== "REJECTED" && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Update Status</p>
              <div className="flex gap-2">
                {currentStatus === "DRAFT" && (
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate("SENT")}
                    className="flex-1"
                  >
                    Mark as Sent
                  </Button>
                )}
                {currentStatus === "SENT" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate("VIEWED")}
                    className="flex-1"
                  >
                    Mark as Viewed
                  </Button>
                )}
                {(currentStatus === "VIEWED" || currentStatus === "UNDER_REVIEW") && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusUpdate("UNDER_REVIEW")}
                      className="flex-1"
                    >
                      Under Review
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onStatusUpdate("ACCEPTED")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onStatusUpdate("REJECTED")}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}