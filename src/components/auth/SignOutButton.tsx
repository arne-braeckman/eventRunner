"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();

  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
    >
      Sign Out
    </button>
  );
}