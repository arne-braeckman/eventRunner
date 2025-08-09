"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ClientPortal } from "@/components/features/proposals/ClientPortal";
import { Loader2 } from "lucide-react";

export default function ProposalPortalPage() {
  const params = useParams();
  const token = params.token as string;

  // Fetch proposal by client access token
  const proposal = useQuery(api.proposals.getProposalByClientToken, {
    clientAccessToken: token,
  });

  // Track view when proposal loads
  const trackView = useMutation(api.proposals.trackProposalView);

  // Track the view once when proposal loads
  if (proposal && !proposal.viewedAt) {
    trackView({
      clientAccessToken: token,
      clientInfo: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      }
    }).catch(console.error);
  }

  if (proposal === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (proposal === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposal Not Found</h1>
          <p className="text-gray-600">
            The proposal you're looking for doesn't exist or the link has expired.
            Please contact your event coordinator for assistance.
          </p>
        </div>
      </div>
    );
  }

  return <ClientPortal proposal={proposal} token={token} />;
}