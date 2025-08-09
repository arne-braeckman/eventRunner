"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Calendar,
  User,
  Building,
  ChevronRight,
  Download,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

type ProposalStatus = 
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

interface ProposalCardProps {
  proposal: {
    _id: Id<"proposals">;
    title: string;
    status: ProposalStatus;
    opportunityId: Id<"opportunities">;
    createdAt: number;
    updatedAt: number;
    sentAt?: number;
    viewedAt?: number;
    respondedAt?: number;
    expiresAt?: number;
    version: number;
  };
  opportunity?: {
    name: string;
    eventType: string;
    eventDate?: number;
    value: number;
    contact?: {
      name: string;
      company?: string;
    };
  };
  onClick?: () => void;
  onSendEmail?: () => void;
  onDownloadPdf?: () => void;
  showActions?: boolean;
  compact?: boolean;
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

export function ProposalCard({
  proposal,
  opportunity,
  onClick,
  onSendEmail,
  onDownloadPdf,
  showActions = false,
  compact = false
}: ProposalCardProps) {
  const statusConfig = STATUS_CONFIG[proposal.status];
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysSince = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getExpirationWarning = () => {
    if (!proposal.expiresAt || proposal.status === "ACCEPTED" || proposal.status === "REJECTED" || proposal.status === "EXPIRED") {
      return null;
    }
    
    const daysUntilExpiration = Math.floor((proposal.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { text: "Expired", urgent: true };
    } else if (daysUntilExpiration <= 3) {
      return { text: `Expires in ${daysUntilExpiration} days`, urgent: true };
    } else if (daysUntilExpiration <= 7) {
      return { text: `Expires in ${daysUntilExpiration} days`, urgent: false };
    }
    return null;
  };

  const expirationWarning = getExpirationWarning();

  if (compact) {
    return (
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-md transition-all",
          onClick && "hover:scale-[1.02]"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={cn("h-4 w-4", statusConfig.textColor)} />
                <h3 className="font-medium text-sm">{proposal.title}</h3>
              </div>
              <p className="text-xs text-gray-600">
                {proposal.sentAt ? getDaysSince(proposal.sentAt) : formatDate(proposal.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "ml-2",
                statusConfig.bgColor,
                statusConfig.textColor,
                statusConfig.borderColor
              )}
            >
              {statusConfig.label}
            </Badge>
          </div>
          {expirationWarning && (
            <Badge
              variant={expirationWarning.urgent ? "destructive" : "secondary"}
              className="mt-2 text-xs"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {expirationWarning.text}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all",
        onClick && "cursor-pointer hover:scale-[1.01]"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn("h-5 w-5", statusConfig.textColor)} />
              <h3 className="text-lg font-semibold">{proposal.title}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {opportunity && (
                <>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{opportunity.eventType}</span>
                  </div>
                  {opportunity.eventDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(opportunity.eventDate)}</span>
                    </div>
                  )}
                  {opportunity.contact && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{opportunity.contact.name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={cn(
                statusConfig.bgColor,
                statusConfig.textColor,
                statusConfig.borderColor
              )}
            >
              {statusConfig.label}
            </Badge>
            {opportunity && (
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(opportunity.value)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Timeline Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">Created:</span> {formatDate(proposal.createdAt)}
          </div>
          {proposal.sentAt && (
            <div>
              <span className="font-medium">Sent:</span> {getDaysSince(proposal.sentAt)}
            </div>
          )}
          {proposal.viewedAt && (
            <div>
              <span className="font-medium">Viewed:</span> {getDaysSince(proposal.viewedAt)}
            </div>
          )}
          {proposal.respondedAt && (
            <div>
              <span className="font-medium">Responded:</span> {getDaysSince(proposal.respondedAt)}
            </div>
          )}
        </div>

        {/* Expiration Warning */}
        {expirationWarning && (
          <div className={cn(
            "p-3 rounded-lg mb-4 flex items-center gap-2",
            expirationWarning.urgent ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
          )}>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{expirationWarning.text}</span>
          </div>
        )}

        {/* Progress Bar */}
        {!["REJECTED", "EXPIRED"].includes(proposal.status) && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage(proposal.status)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${getProgressPercentage(proposal.status)}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {proposal.status === "DRAFT" && onSendEmail && (
              <Button size="sm" onClick={(e) => {
                e.stopPropagation();
                onSendEmail();
              }}>
                <Send className="h-4 w-4 mr-1" />
                Send to Client
              </Button>
            )}
            {onDownloadPdf && (
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onDownloadPdf();
              }}>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            )}
            {["SENT", "VIEWED"].includes(proposal.status) && onSendEmail && (
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onSendEmail();
              }}>
                <Mail className="h-4 w-4 mr-1" />
                Send Reminder
              </Button>
            )}
            <Button size="sm" variant="ghost" className="ml-auto">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getProgressPercentage(status: ProposalStatus): number {
  const statusProgress: Record<ProposalStatus, number> = {
    DRAFT: 20,
    SENT: 40,
    VIEWED: 60,
    UNDER_REVIEW: 80,
    ACCEPTED: 100,
    REJECTED: 0,
    EXPIRED: 0,
  };
  return statusProgress[status] || 0;
}