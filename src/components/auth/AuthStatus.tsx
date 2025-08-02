"use client";

import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export function AuthStatus() {
  const token = useAuthToken();
  const user = useQuery(api.users.getCurrentUser, token ? {} : "skip");

  if (token === undefined) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>You are not signed in.</p>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p>Welcome, {user?.name || user?.email || "User"}!</p>
      {user?.image && (
        <img src={user.image} alt="Profile" className="w-16 h-16 rounded-full" />
      )}
      <SignOutButton />
    </div>
  );
}