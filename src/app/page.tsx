"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LeadCaptureForm } from "~/components/forms/LeadCaptureForm";
import { useEffect } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800 text-center mb-12">
          event<span className="text-blue-600">Runner</span>
        </h1>
        
        <AuthLoading>
          <div className="text-center text-lg text-gray-600">Loading...</div>
        </AuthLoading>
        
        <Authenticated>
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <UserButton />
              <span className="text-gray-700">Welcome back!</span>
            </div>
            <Content />
          </div>
        </Authenticated>
        
        <Unauthenticated>
          <div className="flex flex-col items-center gap-8">
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Welcome to eventRunner - Your comprehensive event venue management platform. 
              Sign in to access lead management, project collaboration, and more.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
                Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </Unauthenticated>
      </div>
    </main>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const contacts = useQuery(api.contacts.getAllContacts);
  const ensureUserExists = useMutation(api.users.ensureUserExists);
  
  // Ensure user record exists in database on first load
  useEffect(() => {
    if (currentUser === null) {
      // User is authenticated but no database record found, create one
      ensureUserExists().catch(console.error);
    }
  }, [currentUser, ensureUserExists]);
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Dashboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
          <div className="space-y-3 text-gray-600">
            <p><strong>User:</strong> {currentUser?.name || currentUser?.email || "Loading..."}</p>
            <p><strong>Role:</strong> {currentUser?.role || "STAFF"}</p>
            <p><strong>Total Contacts:</strong> {contacts?.length || 0}</p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Contact Management</h3>
              <p className="text-blue-600">Manage leads and customer relationships</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Project Management</h3>
              <p className="text-green-600">Organize events and collaborate with clients</p>
            </div>
          </div>
        </div>
        
        {/* Lead Capture Form */}
        <div>
          <LeadCaptureForm />
        </div>
      </div>
      
      {/* Recent Contacts */}
      {contacts && contacts.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Contacts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.slice(0, 5).map((contact) => (
                  <tr key={contact._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.leadSource}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.leadHeat === 'HOT' ? 'bg-red-100 text-red-800' :
                        contact.leadHeat === 'WARM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {contact.leadHeat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
