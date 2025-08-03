"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { LeadCaptureForm } from "~/components/forms/LeadCaptureForm";
import { ContactList } from "~/components/features/contacts/ContactList";
import { exportContactsToCSV } from "~/lib/utils/contacts";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Authenticated>
          <ContactsContent />
        </Authenticated>
        
        <Unauthenticated>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please sign in to view contacts.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Unauthenticated>
      </div>
    </div>
  );
}

function ContactsContent() {
  const handleExport = (contacts: any[]) => {
    exportContactsToCSV(contacts);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Capture Form */}
        <div className="lg:col-span-1">
          <LeadCaptureForm />
        </div>

        {/* Enhanced Contacts List */}
        <div className="lg:col-span-2">
          <ContactList onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}