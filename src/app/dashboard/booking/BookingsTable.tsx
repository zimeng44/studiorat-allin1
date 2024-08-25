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
import { bookingColumnsDefault } from "./bookingColumns";
import { format } from "date-fns";
import {
  deleteBookingAction,
  deleteManyBookingAction,
} from "@/data/actions/booking-actions";
import { toast } from "sonner";

const MAX_TEXT_LEN = 8;

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
  const pageIndex = searchParams.get("pageIndex") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBatchOpOpen, setIsBatchOpOpen] = useState(false);
  const [numRowsSelected, setNumRowsSelected] = useState("0");

  //store row selection
  const [rowsSelected, setRowsSelected] = useState(
    Array(data.length).fill(false),
  );

  // clear the row selections when moving to a new page or setting a new page size
  useEffect(() => {
    if (numRowsSelected === "0") {
      // setCurrentPage(pageIndex);
      // setCurrentPageSize(pageSize);
      setRowsSelected(Array(data.length).fill(false));
      setIsAllSelected(false);
      setIsBatchOpOpen(false);
    }
  }, [pageIndex, pageSize]);

  const handleAllSelected = (checked: boolean) => {
    setRowsSelected(Array(data.length).fill(checked));
    params.set("isAllSelected", checked ? "true" : "false");
    setIsAllSelected(checked);
    params.set("isBatchOpOpen", checked ? "true" : "false");
    setIsBatchOpOpen(checked);
    params.set("numRowsSelected", data.length.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRowSelection = (
    matchedIndex: number,
    checked: boolean | undefined,
  ) => {
    const newRowsSelected = rowsSelected.map((rowChecked, index) =>
      index === matchedIndex ? checked : rowChecked,
    );
    setRowsSelected(newRowsSelected);
    const newNumRowsSelected = newRowsSelected.filter((item) => item).length;
    params.set("numRowsSelected", newNumRowsSelected.toString());
    if (newNumRowsSelected === data.length) {
      params.set("isAllSelected", "true");
      setIsAllSelected(true);
    } else {
      params.set("isAllSelected", "false");
      setIsAllSelected(false);
    }
    if (newNumRowsSelected > 0) {
      params.set("isBatchOpOpen", "true");
      setIsBatchOpOpen(true);
    } else {
      params.set("isBatchOpOpen", "false");
      setIsBatchOpOpen(false);
    }
    params.set("numRowsSelected", newNumRowsSelected.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleResetSelection = () => {
    const params = new URLSearchParams(searchParams);
    setRowsSelected(Array(data.length).fill(false));
    params.set("isAllSelected", "false");
    setIsAllSelected(false);
    params.set("isBatchOpOpen", "false");
    setIsBatchOpOpen(false);
    params.set("numRowsSelected", "0");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleBatchDelete = async () => {
    const counter = rowsSelected.filter((item) => item === true).length;

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    // console.log(data);
    // return;

    // await Promise.all(
    //   rowsSelected.map(async (row, index) => {
    //     if (row) {
    //       await deleteBookingAction(data[index].id);
    //     }
    //   }),
    // );

    // setRowsSelected(Array(data.length).fill(false));
    // toast.success("Entries Deleted");

    const deleteList = rowsSelected.map((row, index) => {
      if (row) return data[index].id;
    });

    if (deleteList.filter((item) => item !== undefined).length === 0) {
      toast.error("No item selected");
    } else {
      const { res, error } = await deleteManyBookingAction(
        deleteList.filter((item): item is number => item !== undefined),
      );

      if (!error) {
        const params = new URLSearchParams(searchParams);
        setRowsSelected(Array(data.length).fill(false));
        params.set("isAllSelected", "false");
        setIsAllSelected(false);
        params.set("isBatchOpOpen", "false");
        setIsBatchOpOpen(false);
        params.set("numRowsSelected", "0");
        router.replace(`${pathname}?${params.toString()}`);
        toast.success(`${res?.count} Entrie(s) Deleted Successfully.`);
        router.refresh();
      } else {
        toast.error("Error deleting entries");
      }
    }
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
                  if (key === "user" || key === "created_by") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {`${row[key].first_name} ${row[key].last_name}`}
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
                      {key === "start_time" || key === "end_time"
                        ? format(row[key], "MM/dd/yyyy hh:mm a")
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
