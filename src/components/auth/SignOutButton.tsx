"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function SignOutButton() {
  return (
    <ClerkSignOutButton>
      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
        Sign Out
      </button>
    </ClerkSignOutButton>
  );
}