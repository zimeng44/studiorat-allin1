"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  EllipsisVertical,
  File,
  Filter,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  SquarePen,
  PlusCircle,
  // Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import FilterForm from "./CheckoutFilterForm";
import { Search } from "@/components/custom/Search";
import Link from "next/link";
import {
  checkoutColumnsDefault,
  ColumnKeys,
  TableColumnStatus,
} from "./checkoutColumns";
import CheckoutFilterForm from "./CheckoutFilterForm";

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
  const filterOn = searchParams.get("filterOn") === "true";

  const setColumnsVisibility = (key: ColumnKeys, checked: boolean) => {
    let newState = structuredClone(columnsStatus);
    newState[key].visible = checked;
    setColumnsStatus(newState);
  };

  const resetColumnsVisibility = () => {
    setColumnsStatus(structuredClone(checkoutColumnsDefault));
    // setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
    // console.log(checkoutColumnsDefault);
  };

  return (
    <div className="flex items-center py-1">
      <Popover
        open={filterOpen}
        onOpenChange={(open) => {
          filterOpen = open;
          const params = new URLSearchParams(searchParams);
          params.set("filterOpen", filterOpen ? "true" : "false");
          router.replace(`${pathname}?${params.toString()}`);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`${filterOn ? "brightness-50" : ""}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <CheckoutFilterForm filter={filter} />
        </PopoverContent>
      </Popover>

      {/* <Sheet
        open={filterOpen}
        onOpenChange={(open) => {
          filterOpen = open;
          const params = new URLSearchParams(searchParams);
          params.set("filterOpen", filterOpen ? "true" : "false");
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
           
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <CheckoutFilterForm filter={filter} />
        </SheetContent>
      </Sheet> */}
      <div className="px-2">
        <Search />
      </div>
      <div className="item-end ml-auto">
        <Link href="/dashboard/checkout/new">
          <Button variant="outline" className="h10 ml-5">
            <PlusCircle className="mr-2 h-4 w-4" />
            New
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
            const typedKey = key as ColumnKeys;
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
