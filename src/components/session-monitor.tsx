"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Monitor session status
    if (status === "unauthenticated") {
      // Session expired or user logged out
      router.push("/login?expired=true");
    }
  }, [status, router]);

  // Periodic session check
  useEffect(() => {
    const interval = setInterval(() => {
      // This triggers a session revalidation
      if (status === "authenticated") {
        fetch("/api/auth/session").then((res) => {
          if (!res.ok) {
            signOut({ callbackUrl: "/login?expired=true" });
          }
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [status]);

  return null; // This component doesn't render anything
}
