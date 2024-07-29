"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import FilterForm from "./FilterForm";
import { Search } from "@/components/custom/Search";
import Link from "next/link";
// import { bookingColumnsDefault } from "@/data/bookingColumns";
import { bookingColumnsDefault } from "@/data/bookingColumns";

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  startTime: TableFieldStatus;
  endTime: TableFieldStatus;
  user: TableFieldStatus;
  type: TableFieldStatus;
  useLocation: TableFieldStatus;
  bookingCreator: TableFieldStatus;
  notes: TableFieldStatus;
}

// type ColumnKeys =
//   | "startTime"
//   | "endTime"
//   | "user"
//   | "type"
//   | "useLocation"
//   | "bookingCreator"
//   | "notes";
type ColumnKeys = keyof TableColumnStatus;

interface TableHeaderProps {
  columnsStatus: TableColumnStatus;
  filter: {};
  setColumnsStatus: Function;
}

const BookingTabHeader = ({
  columnsStatus,
  filter,
  setColumnsStatus,
}: TableHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  let filterOpen = searchParams.get("filterOpen") === "true";

  // console.log("yes!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  const setColumnsVisibility = (key: ColumnKeys, checked: boolean) => {
    // console.log("yes!!!!!!!!!!!!!!!!!!!!!!!");
    let newState:TableColumnStatus = structuredClone(bookingColumnsDefault);
    newState[key].visible = checked;
    setColumnsStatus(newState);
  };

  const resetColumnsVisibility = () => {
    setColumnsStatus(structuredClone(bookingColumnsDefault));
    // setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
    // console.log(bookingColumnsDefault);
  };

  return (
    <div className="flex items-center py-1">
      <Sheet
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
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <FilterForm filter={filter} />
        </SheetContent>
      </Sheet>
      <div className="px-2">
        <Search />
      </div>
      <div className="item-end ml-auto">
        <Link href="/dashboard/booking/new">
          <Button variant="outline" className="h10 ml-5">
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Button>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-5 h-10">
            <Settings className="mr-2 h-4 w-4" />
            Display
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(columnsStatus).map(([key, value]) => {
            const typedKey = key as ColumnKeys; //type assertion
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

export default BookingTabHeader;
