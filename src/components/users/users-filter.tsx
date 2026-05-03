"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface PlanOption {
  slug: string;
  name: string;
}

interface UsersFilterProps {
  plans: PlanOption[];
  initialQuery: string;
  initialPlan: string;
  initialStatus: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All accounts" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring within 7 days" },
  { value: "expired", label: "Expired / no plan" },
  { value: "disabled", label: "Disabled" },
];

export function UsersFilter({
  plans,
  initialQuery,
  initialPlan,
  initialStatus,
}: UsersFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateParam("q", q);
    }, 250);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function clearAll() {
    setQ("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  const hasFilters = q || initialPlan !== "all" || initialStatus !== "all";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={initialPlan}
        onValueChange={(value) => updateParam("plan", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All plans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All plans</SelectItem>
          {plans.map((p) => (
            <SelectItem key={p.slug} value={p.slug}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={initialStatus}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
