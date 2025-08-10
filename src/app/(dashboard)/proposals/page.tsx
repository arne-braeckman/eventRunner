"use client";

import { useUser } from "@clerk/nextjs";
import { ProposalPipeline } from "@/components/features/proposals/ProposalPipeline";
import { ProposalErrorBoundary } from "@/components/features/proposals/ProposalErrorBoundary";

export default function ProposalsPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access proposals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
        <p className="text-muted-foreground">
          Manage and track your event proposals, from creation to client acceptance
        </p>
      </div>
      
      <ProposalErrorBoundary>
        <ProposalPipeline />
      </ProposalErrorBoundary>
    </div>
  );
}