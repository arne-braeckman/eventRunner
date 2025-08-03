"use client";

import { use } from "react";
import { ContactDetail } from "~/components/features/contacts/ContactDetail";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ContactDetailPageProps {
  params: Promise<{
    id: Id<"contacts">;
  }>;
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = use(params);
  
  return (
    <div>
      <Authenticated>
        <ContactDetail contactId={id} />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please sign in to view contact details.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}