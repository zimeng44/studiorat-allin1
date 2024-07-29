"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Search() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [queryValue, setQueryValue] = useState(
    searchParams.get("query")?.toString(),
  );

  const handleSearch = useDebouncedCallback((term: string) => {
    // console.log(`Searching... ${term}`);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
    // console.log(params.toString());
  }, 300);

  return (
    // <div>
    //   <Input
    //     type="text"
    //     placeholder="Search"
    //     onChange={(e) => handleSearch(e.target.value)}
    //     defaultValue={searchParams.get("query")?.toString()}
    //   />
    // </div>
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        placeholder="Search..."
        className="w-full pr-9"
        onChange={(e) => {
          setQueryValue(e.target.value);
          handleSearch(e.target.value);
        }}
        value={queryValue}
        // defaultValue={searchParams.get("query")?.toString()}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${queryValue?.length ? "visible" : "invisible"} absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100`}
        onClick={() => {
          setQueryValue("");
          handleSearch("");
        }}
        // {...props}
      >
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Clear</span>
      </Button>
    </div>
  );
}

function XIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
