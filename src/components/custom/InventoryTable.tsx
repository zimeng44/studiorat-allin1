"use client";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  PlusCircle,
  // Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import InventoryFilterForm from "@/components/forms/InventoryFilterForm";
import { deleteItemAction } from "@/data/actions/inventory-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "@/components/custom/Search";

const MAX_TEXT_LEN = 8;

interface InventoryTableProps {
  data: any[];
  filter: {};
  columns: any[];
}

const InventoryTable = ({ data, filter, columns }: InventoryTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sort = searchParams.get("sort") ?? "";
  // console.log(sort);

  let filterOpen = searchParams.get("filterOpen") === "true";
  let isAllSelected = searchParams.get("isAllSelected") === "true";
  let isBatchOpOpen = searchParams.get("isBatchOpOpen") === "true";
  let numRowsSelected = searchParams.get("numRowsSelected")
    ? parseInt(searchParams.get("numRowsSelected"))
    : 0;
  // console.log(numRowsSelected);

  const pageIndex = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";

  // remember the current page and page size to tell if navigated to a new page or set a new page size
  const [currentPage, setCurrentPage] = useState("1");
  const [currentPageSize, setCurrentPageSize] = useState("10");

  // store columns visibility
  const [columnsVisible, setColumnsVisible] = useState(
    Array(columns.length)
      .fill(true)
      .map((item, index) => columns[index].visible),
  );

  //store row selection
  const [rowsSelected, setRowsSelected] = useState(
    Array(data.length).fill(false),
  );

  // clear the row selections when moving to a new page or setting a new page size
  if (pageIndex !== currentPage || pageSize !== currentPageSize) {
    setCurrentPage(pageIndex);
    setCurrentPageSize(pageSize);
    setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("numRowsSelected");
    params.delete("isBatchOpOpen");
    params.delete("isAllSelected");
    router.replace(`${pathname}?${params.toString()}`);
  }

  // store keys of columns
  const header = Array(columns.length)
    .fill("")
    .map((item, index) => columns[index].accessorKey);

  const handleAllSelected = (checked: boolean) => {
    setRowsSelected(Array(data.length).fill(checked));
    const params = new URLSearchParams(searchParams);
    params.set("isAllSelected", checked ? "true" : "false");
    params.set("isBatchOpOpen", checked ? "true" : "false");
    params.set("numRowsSelected", data.length.toString());
    router.push(`${pathname}?${params.toString()}`);
    // console.log("All Selected is ", allSelected);
  };

  const handleRowSelection = (matchedIndex: number, checked: boolean) => {
    // const newSelection = rowsSelected.map((rowChecked, index) =>
    //   index === matchedIndex ? checked : rowChecked,
    // );

    setRowsSelected((rowsSelected) =>
      rowsSelected.map((rowChecked, index) =>
        index === matchedIndex ? checked : rowChecked,
      ),
    );

    if (checked) {
      numRowsSelected += 1;
    } else {
      numRowsSelected -= 1;
    }
    // console.log(numRowsSelected);
    const params = new URLSearchParams(searchParams);
    params.set("isBatchOpOpen", numRowsSelected > 0 ? "true" : "false");
    params.set(
      "numRowsSelected",
      numRowsSelected > 0 ? numRowsSelected.toString() : "0",
    );
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleResetSelection = () => {
    // console.log("checked passed in is ", checked);
    setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.set("isAllSelected", "false");
    params.set("isBatchOpOpen", "false");
    params.set("numRowsSelected", "0");
    router.push(`${pathname}?${params.toString()}`);
    // console.log("All Selected is ", allSelected);
  };

  const handleBatchDelete = () => {
    const counter = rowsSelected.filter((item) => item === true).length;
    // console.log("Size of rowSelected is ", rowsSelected.length);

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    rowsSelected.map((row, index) => {
      if (row) {
        // const id =
        // deleteItem(data[index].id);
        deleteItemAction(data[index].id);

        // console.log(`item id ${id} deleted!!!!!!!!!!`);
      }
    });
    // if ((totalEntries - counter) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Row Number after batch delete is ", numRows);
    setRowsSelected(Array(data.length).fill(false));
  };

  const handleSort = (field: string) => {
    const order = sort.split(":")[1] === "asc" ? "desc" : "asc";
    const sortStr = field + ":" + order;
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortStr);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleColumnVisible = (matchedIndex: number, checked: boolean) => {
    const newColumnsVisible = columnsVisible.map((col, index) => {
      return index === matchedIndex ? checked : col;
    });

    setColumnsVisible(newColumnsVisible);
  };

  const resetColumnsVisibility = () => {
    setColumnsVisible(
      Array(columns.length)
        .fill(true)
        .map((item, index) => columns[index].visible),
    );
    // setSort("");
    setRowsSelected(Array(data.length).fill(false));
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
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
            <InventoryFilterForm filter={filter} />
          </SheetContent>
        </Sheet>
        <div className="px-2">
          <Search />
        </div>
        <div className="item-end ml-auto">
          <Link href="/dashboard/master-inventory/add">
            <Button variant="outline" className="h10 ml-5">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
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
            {columns.map((col, index) => {
              return (
                <DropdownMenuCheckboxItem
                  key={col.accessorKey}
                  className="capitalize"
                  checked={columnsVisible[index]}
                  onCheckedChange={(checked) =>
                    toggleColumnVisible(index, checked)
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {col.header}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-indigo-100">
            <TableRow>
              <TableHead key={"select"}>
                <Popover open={isBatchOpOpen}>
                  <PopoverTrigger asChild>
                    <Checkbox
                      className="mr-2"
                      checked={isAllSelected}
                      onCheckedChange={(checked: boolean) => {
                        handleAllSelected(checked);
                      }}
                      aria-label="Select all"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-50 space-x-2"
                    onInteractOutside={(e) => e.preventDefault()}
                    side="right"
                    // asChild
                  >
                    <Button
                      onClick={() => handleBatchDelete()}
                      variant="destructive"
                    >
                      Delete Selected
                    </Button>
                    <Button
                      onClick={() => {
                        handleResetSelection();
                      }}
                      variant="secondary"
                    >
                      Reset
                    </Button>
                  </PopoverContent>
                </Popover>
              </TableHead>
              {columnsVisible[0] ? (
                <TableHead className="whitespace-nowrap p-0" key={header[0]}>
                  MTech Barcode
                  <Button
                    className="p-1 text-left"
                    variant="ghost"
                    onClick={() => handleSort("mTechBarcode")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[1] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[1]}
                >
                  {/* {" "} */}
                  Make
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => handleSort("make")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[2] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[2]}
                >
                  {/* {" "} */}
                  Model
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => handleSort("model")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[3] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[3]}
                >
                  {/* {" "} */}
                  Category
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => handleSort("category")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[4] ? (
                <TableHead key={header[4]}>Description</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[5] ? (
                <TableHead key={header[5]}>Accessories</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[6] ? (
                <TableHead key={header[6]}>Storage Location</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[7] ? (
                <TableHead key={header[7]}>Comments</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[8] ? (
                <TableHead className="text-center" key={header[8]}>
                  Out
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[9] ? (
                <TableHead className="text-center" key={header[9]}>
                  Broken
                </TableHead>
              ) : (
                ``
              )}
              <TableHead className="text-center" key={"details"}></TableHead>
              {/* <TableHead className="text-center" key={"actions"}></TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  // data-state={row.getIsSelected() && "selected"}
                >
                  <TableCell key="select">
                    <Checkbox
                      checked={rowsSelected[index]}
                      onCheckedChange={(checked) =>
                        handleRowSelection(index, checked)
                      }
                      // checked={row.getIsSelected()}
                      // onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select Row"
                    />
                  </TableCell>
                  {columnsVisible[0] ? (
                    <TableCell
                      className="whitespace-nowrap p-1"
                      key={header[0]}
                    >{`${row.mTechBarcode}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[1] ? (
                    <TableCell
                      className="whitespace-nowrap p-4"
                      key={header[1]}
                    >
                      {row.make.length > MAX_TEXT_LEN
                        ? `${row.make.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.make}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[2] ? (
                    <TableCell className="whitespace-nowrap" key={header[2]}>
                      {row.model.length > MAX_TEXT_LEN
                        ? `${row.model.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.model}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[3] ? (
                    <TableCell className="whitespace-nowrap" key={header[3]}>
                      {row.category.length > MAX_TEXT_LEN
                        ? `${row.category.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.category}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[4] ? (
                    <TableCell className="whitespace-nowrap" key={header[4]}>
                      {row.description.length > MAX_TEXT_LEN
                        ? `${row.description.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.description}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[5] ? (
                    <TableCell key={header[5]}>
                      {row.accessories.length > MAX_TEXT_LEN
                        ? `${row.accessories.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.accessories}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[6] ? (
                    <TableCell
                      key={header[6]}
                    >{`${row.storageLocation}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[7] ? (
                    <TableCell className="whitespace-nowrap" key={header[7]}>
                      {row.comments.length > MAX_TEXT_LEN
                        ? `${row.comments.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.comments}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[8] ? (
                    <TableCell className="p-1 text-center" key={header[8]}>
                      <Checkbox disabled checked={row.out} />
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[9] ? (
                    <TableCell className="text-center" key={header[9]}>
                      <Checkbox disabled checked={row.broken} />
                    </TableCell>
                  ) : (
                    ``
                  )}
                  <TableCell className="text-center" key="details">
                    <Link href={`/dashboard/master-inventory/${row.id}`}>
                      <Button variant="outline">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={header.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryTable;
