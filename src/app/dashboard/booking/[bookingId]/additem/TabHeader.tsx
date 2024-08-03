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
import { Search } from "@/components/custom/Search";
import Link from "next/link";
import InventoryFilterForm from "@/components/forms/InventoryFilterForm";
// import { inventoryColumnsDefault } from "@/data/inventoryColumns";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
// type ColumnKey =
//   | "creationTime"
//   | "stuIDCheckout"
//   | "stuIDCheckin"
//   | "userName"
//   | "finished"
//   | "studio"
//   | "otherLocation"
//   | "creationMonitor"
//   | "finishMonitor"
//   | "finishTime"
//   | "notes";

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  mTechBarcode: TableFieldStatus;
  make: TableFieldStatus;
  model: TableFieldStatus;
  category: TableFieldStatus;
  description: TableFieldStatus;
  accessories: TableFieldStatus;
  storageLocation: TableFieldStatus;
  comments: TableFieldStatus;
}

type ColumnKey = keyof TableColumnStatus;

interface TableHeaderProps {
  columnsStatus: TableColumnStatus;
  filter: {};
  setColumnsStatus: Function;
  defaultTab: string;
}

const TabHeader = ({
  columnsStatus,
  filter,
  setColumnsStatus,
  defaultTab,
}: TableHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  let filterOpen = searchParams.get("filterOpen") === "true";

  const setColumnsVisibility = (key: ColumnKey, checked: boolean) => {
    const keyType = key as ColumnKey;
    let newState = structuredClone(columnsStatus);
    newState[keyType].visible = checked;
    setColumnsStatus(newState);
  };

  const resetColumnsVisibility = () => {
    setColumnsStatus(structuredClone(inventoryColumnsDefault));
    // setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    router.replace(`${pathname}?${params.toString()}`);
    // console.log(checkoutColumnsDefault);
  };

  return (
    <div className="flex items-center py-1">
      {/* <Sheet
        open={filterOpen}
        onOpenChange={(open) => {
          filterOpen = open;
          const params = new URLSearchParams(searchParams);
          params.set("filterOpen", filterOpen ? "true" : "false");
          router.replace(`${pathname}?${params.toString()}`);
        }}
      >
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <InventoryFilterForm filter={filter} />
        </SheetContent>
      </Sheet> */}
      <div className="px-2">
        <Search />
      </div>
      <div className="item-end ml-auto"></div>

      {defaultTab === "cards" ? (
        ``
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-5 h-10">
              <Settings className="mr-2 h-4 w-4" />
              Display
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(columnsStatus).map(([key, value]) => {
              const keyType = key as ColumnKey;
              return (
                <DropdownMenuCheckboxItem
                  key={keyType}
                  className="capitalize"
                  checked={value.visible}
                  onCheckedChange={(checked) =>
                    setColumnsVisibility(keyType, checked)
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

export default TabHeader;
