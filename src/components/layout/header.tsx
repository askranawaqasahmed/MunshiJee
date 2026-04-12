"use client";

import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Welcome, {session?.user?.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Customer"}
        </p>
      </div>
    </header>
  );
}
