"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export function AuthStatus() {
  const { isLoaded, isSignedIn, user } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser, isSignedIn ? {} : "skip");

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>You are not signed in.</p>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p>Welcome, {user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}!</p>
      {user?.imageUrl && (
        <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full" />
      )}
      <SignOutButton />
    </div>
  );
}