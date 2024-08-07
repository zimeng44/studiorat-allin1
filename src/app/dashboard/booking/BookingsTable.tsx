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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SquarePen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { bookingColumnsDefault } from "@/data/bookingColumns";
import { format } from "date-fns";

const MAX_TEXT_LEN = 8;

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

interface BookingsTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
}

const BookingsTable = ({ data, columnsStatus }: BookingsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const view = searchParams.get("view") ?? "calendar";

  const sort = searchParams.get("sort") ?? "";
  // let filterOpen = searchParams.get("filterOpen") === "true";
  const pageIndex = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const isAllSelected = searchParams.get("isAllSelected") === "true";
  const isBatchOpOpen = searchParams.get("isBatchOpOpen") === "true";

  // remember the current page and page size to tell if navigated to a new page or set a new page size
  const [currentPage, setCurrentPage] = useState("1");
  const [currentPageSize, setCurrentPageSize] = useState("10");
  // const [isAllSelected, setIsAllSelected] = useState(false);
  // const [isBatchOpOpen, setIsBatchOpOpen] = useState(false);
  // const [numRowsSelected, setNumRowsSelected] = useState(0);

  //store row selection
  const [rowsSelected, setRowsSelected] = useState(
    Array(data.length).fill(false),
  );

  useEffect(() => {
    const newNumRowsSelected = rowsSelected.filter((item) => item).length;
    // setNumRowsSelected(newNumRowsSelected);
    params.set("numRowsSelected", newNumRowsSelected.toString());
    if (newNumRowsSelected === data.length) params.set("isAllSelected", "true");
    else params.set("isAllSelected", "false");
    if (newNumRowsSelected > 0) params.set("isBatchOpOpen", "true");
    else params.set("isBatchOpOpen", "false");
    params.set("numRowsSelected", newNumRowsSelected.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }, [rowsSelected]);

  // clear the row selections when moving to a new page or setting a new page size
  if (pageIndex !== currentPage || pageSize !== currentPageSize) {
    setCurrentPage(pageIndex);
    setCurrentPageSize(pageSize);
    setRowsSelected(Array(data.length).fill(false));
  }

  // store keys of columns
  // const header = Array(checkoutColumns.length)
  //   .fill("")
  //   .map((item, index) => checkoutColumns[index].accessorKey);

  const handleAllSelected = (checked: boolean) => {
    setRowsSelected(Array(data.length).fill(checked));
    // const params = new URLSearchParams(searchParams);
    params.set("isAllSelected", checked ? "true" : "false");
    params.set("isBatchOpOpen", checked ? "true" : "false");
    params.set("numRowsSelected", data.length.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRowSelection = (
    matchedIndex: number,
    checked: boolean | undefined,
  ) => {
    setRowsSelected((rowsSelected) =>
      rowsSelected.map((rowChecked, index) =>
        index === matchedIndex ? checked : rowChecked,
      ),
    );
  };

  const handleResetSelection = () => {
    setRowsSelected(Array(data.length).fill(false));
    params.set("isAllSelected", "false");
    params.set("isBatchOpOpen", "false");
    params.set("numRowsSelected", "0");
    router.replace(`${pathname}?${params.toString()}`);
    // console.log("All Selected is ", allSelected);
  };

  const handleBatchDelete = () => {
    const counter = rowsSelected.filter((item) => item === true).length;

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    rowsSelected.map((row, index) => {
      if (row) {
        // deleteItemAction(data[index].id);
      }
    });
    setRowsSelected(Array(data.length).fill(false));
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-indigo-100">
          <TableRow>
            <TableHead key={"select"}>
              <Popover open={isBatchOpOpen}>
                <PopoverTrigger asChild>
                  <Checkbox
                    className="mr-2"
                    checked={isAllSelected}
                    onCheckedChange={(checked: boolean) =>
                      handleAllSelected(checked)
                    }
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
                    onClick={() => handleResetSelection()}
                    variant="secondary"
                  >
                    Reset
                  </Button>
                </PopoverContent>
              </Popover>
            </TableHead>
            {Object.entries(columnsStatus).map(([key, value]) => {
              // const typedValue = value as ;
              return value.visible ? (
                <TableHead className="whitespace-nowrap" key={key}>
                  {value.header}
                  {/* <Button
                      className="p-1 text-left"
                      variant="ghost"
                      onClick={() => handleSort(key)}
                    >
                      <ArrowUpDown className="m-1 h-4 w-4" />
                    </Button> */}
                </TableHead>
              ) : (
                ``
              );
            })}
            <TableHead className="text-center" key={"edit"}></TableHead>
            {/* <TableHead className="text-center" key={"actions"}></TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell key="select">
                  <Checkbox
                    checked={rowsSelected[index]}
                    onCheckedChange={(checked: boolean) =>
                      handleRowSelection(index, checked)
                    }
                    // checked={row.getIsSelected()}
                    // onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select Row"
                  />
                </TableCell>
                {Object.entries(columnsStatus).map(([key, value]) => {
                  if (key === "user" || key === "bookingCreator") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {`${row[key].firstName} ${row[key].lastName}`}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  // if (key === "bookingCreator") {
                  //   return value.visible ? (
                  //     <TableCell className="whitespace-nowrap" key={key}>
                  //       {`${row.bookingCreator.firstName} ${row.bookingCreator.lastName}`}
                  //     </TableCell>
                  //   ) : (
                  //     ``
                  //   );
                  // }

                  return value.visible ? (
                    <TableCell className="whitespace-nowrap" key={key}>
                      {key === "startTime" || key === "endTime"
                        ? format(new Date(row[key]), "MM/dd/yyyy hh:mm a")
                        : row[key]}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="edit">
                  {/* <Link href={`/dashboard/booking/${row.id}?view=${view}`}> */}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const params = new URLSearchParams(searchParams);
                      params.set("view", view);
                      router.push(`${pathname}/${row.id}?${params.toString()}`);
                    }}
                  >
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  {/* </Link> */}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Object.keys(bookingColumnsDefault).length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingsTable;
