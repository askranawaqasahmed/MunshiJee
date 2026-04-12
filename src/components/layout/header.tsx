"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-white px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold truncate">
            Welcome, {session?.user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Customer"}
          </p>
        </div>
      </div>
    </header>
  );
}
