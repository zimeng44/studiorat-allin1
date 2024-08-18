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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "@/components/custom/Search";
import Link from "next/link";
// import { bookingColumnsDefault } from "@/data/bookingColumns";
import { bookingColumnsDefault } from "./bookingColumns";
import BookingFilterForm, { BookingFilterFormProps } from "./BookingFilterForm";

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  start_time: TableFieldStatus;
  end_time: TableFieldStatus;
  user: TableFieldStatus;
  type: TableFieldStatus;
  use_location: TableFieldStatus;
  created_by: TableFieldStatus;
  notes: TableFieldStatus;
}

// type ColumnKeys =
//   | "start_time"
//   | "end_time"
//   | "user"
//   | "type"
//   | "use_location"
//   | "created_by"
//   | "notes";
type ColumnKeys = keyof TableColumnStatus;

interface TableHeaderProps {
  columnsStatus: TableColumnStatus;
  filter: BookingFilterFormProps;
  setColumnsStatus: Function;
  defaultTab: string;
}

const BookingTabHeader = ({
  columnsStatus,
  filter,
  setColumnsStatus,
  defaultTab,
}: TableHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get("view") ?? "calendar";
  let filterOpen = searchParams.get("filterOpen") === "true";
  const filterOn = searchParams.get("filterOn") === "true";

  // console.log("yes!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  const setColumnsVisibility = (key: ColumnKeys, checked: boolean) => {
    // console.log("yes!!!!!!!!!!!!!!!!!!!!!!!");
    let newState: TableColumnStatus = structuredClone(bookingColumnsDefault);
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
          <BookingFilterForm filter={filter} />
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
          <FilterForm filter={filter} />
        </SheetContent>
      </Sheet> */}
      <div className="px-2">
        <Search />
      </div>
      <div className="item-end ml-auto">
        <Link href={`/dashboard/booking/new?view=${view}`}>
          <Button variant="outline" className="h-10 ">
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Button>
        </Link>
      </div>
      {defaultTab === "grid" ? (
        ``
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hide ml-1 h-10">
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
      )}
    </div>
  );
};

export default BookingTabHeader;
