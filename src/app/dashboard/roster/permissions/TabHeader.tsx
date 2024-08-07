"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { Search } from "@/components/custom/Search";
import Link from "next/link";
import {
  ColumnKey,
  rosterPermissionsColumnsDefault,
  TableColumnStatus,
} from "./rosterPermissionsColumns";

interface TableHeaderProps {
  columnsStatus: TableColumnStatus;
  filter: {};
  setColumnsStatus: Function;
}

const TabHeader = ({
  columnsStatus,
  filter,
  setColumnsStatus,
}: TableHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  let filterOpen = searchParams.get("filterOpen") === "true";

  const setColumnsVisibility = (key: ColumnKey, checked: boolean) => {
    let newState = structuredClone(columnsStatus);
    newState[key].visible = checked;
    setColumnsStatus(newState);
  };

  const resetColumnsVisibility = () => {
    setColumnsStatus(structuredClone(rosterPermissionsColumnsDefault));
    // setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
    // console.log(checkoutColumnsDefault);
  };

  return (
    <div className="flex items-center py-1">
      <div className="px-2">
        <Search />
      </div>

      <div className="item-end ml-auto flex">
        <Link href="/dashboard/roster/permissions/add">
          <Button variant="outline" className="h10 ml-1">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-1 h-10">
            <Settings className="mr-2 h-4 w-4" />
            Display
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(columnsStatus).map(([key, value]) => {
            const typedKey = key as ColumnKey;
            return (
              <DropdownMenuCheckboxItem
                key={typedKey}
                className="capitalize"
                checked={value.visible}
                onCheckedChange={(checked) =>
                  setColumnsVisibility(typedKey, checked)
                }
                onSelect={(e) => e.preventDefault()}
              >
                {value.header}
              </DropdownMenuCheckboxItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            key={"reset"}
            className="capitalize"
            onSelect={(e) => {
              e.preventDefault();
              resetColumnsVisibility();
            }}
          >
            Default
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TabHeader;
