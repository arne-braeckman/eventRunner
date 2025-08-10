"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProposalGenerator } from "@/components/features/proposals/ProposalGenerator";

export default function EditProposalPage() {
  const params = useParams();
  const proposalId = params.id as string;
  
  // Get proposal details
  const proposal = useQuery(api.proposals.getProposalById, { proposalId });

  if (proposal === undefined) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading proposal...</div>
        </div>
      </div>
    );
  }

  if (proposal === null) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Proposal not found. It may have been deleted or you don't have access to edit it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/proposals/${proposalId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Proposal
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Proposal</h1>
            <p className="text-muted-foreground">
              Make changes to your proposal
            </p>
          </div>
        </div>
      </div>

      {/* Proposal Generator with edit mode */}
      <ProposalGenerator 
        existingProposalId={proposalId}
        mode="edit"
      />
    </div>
  );
}