"use client";

import { useEffect } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { useProfileContext } from "@/lib/profile-context";

export default function ProfilePage() {
  const { loaded } = useProfileContext();

  useEffect(() => {
    document.title = "Judgement Profile | Personal Board of Directors";
  }, []);

  // The form reads the saved profile and any draft once, when it mounts, so
  // wait until browser storage has been read.
  if (!loaded) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="mx-auto h-1.5 w-24 rounded-full bg-board-surface-raised animate-pulse" />
        <div className="h-64 rounded-[16px] border border-board-border bg-board-surface animate-pulse" />
      </div>
    );
  }

  return <ProfileForm />;
}
