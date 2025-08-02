"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function SignInButton() {
  const { signIn } = useAuthActions();

  return (
    <div className="flex gap-4">
      <button
        onClick={() => signIn("github")}
        className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
      >
        Sign in with GitHub
      </button>
      <button
        onClick={() => signIn("google")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Sign in with Google
      </button>
    </div>
  );
}