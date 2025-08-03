"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Authenticated>
          <ProjectsContent />
        </Authenticated>
        
        <Unauthenticated>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please sign in to view projects.</p>
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

function ProjectsContent() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Project Cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sample Project {i}
            </h3>
            <p className="text-gray-600 mb-4">
              This is a placeholder for future project management functionality.
            </p>
            <div className="flex justify-between items-center">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
              <span className="text-sm text-gray-500">
                Due: TBD
              </span>
            </div>
          </div>
        ))}
        
        {/* Add Project Card */}
        <div className="bg-gray-100 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Add New Project</p>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Completed This Month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </div>
      </div>
    </div>
  );
}