"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
        Sign In
      </button>
    </ClerkSignInButton>
  );
}