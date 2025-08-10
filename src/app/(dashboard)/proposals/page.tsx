"use client";

import { ProposalPipeline } from "@/components/features/proposals/ProposalPipeline";

export default function ProposalsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
        <p className="text-muted-foreground">
          Manage and track your event proposals, from creation to client acceptance
        </p>
      </div>
      
      <ProposalPipeline />
    </div>
  );
}