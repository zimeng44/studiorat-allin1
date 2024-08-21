"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function InputWithLoading({
  className,
  field,
  placeholder,
  isLoading,
  disabled,
}: {
  className?: string;
  field: any;
  placeholder?: string;
  isLoading: boolean;
  disabled: boolean;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        className={cn("w-full pr-9", className)}
        {...field}
        disabled={disabled}
        placeholder={placeholder}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${isLoading ? "visible" : "invisible"} absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100`}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-t-4 border-indigo-600" />
      </Button>
    </div>
  );
}
