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
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteItemAction } from "@/data/actions/inventory-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "../../../components/ui/badge";
import {
  inventoryColumnsDefault,
  TableColumnStatus,
} from "@/app/dashboard/master-inventory/inventoryColumns";
import { toast } from "sonner";

const MAX_TEXT_LEN = 20;

interface InventoryTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
}

const InventoryTable = ({ data, columnsStatus }: InventoryTableProps) => {
  // console.log(data);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const sort = searchParams.get("sort") ?? "";
  // console.log(sort);

  // let filterOpen = searchParams.get("filterOpen") === "true";
  const pageIndex = searchParams.get("pageIndex") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const isAllSelected = searchParams.get("isAllSelected") === "true";
  const isBatchOpOpen = searchParams.get("isBatchOpOpen") === "true";

  // remember the current pageIndex and pageIndex size to tell if navigated to a new pageIndex or set a new pageIndex size
  const [currentPage, setCurrentPage] = useState("1");
  const [currentPageSize, setCurrentPageSize] = useState("10");
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

  // clear the row selections when moving to a new pageIndex or setting a new pageIndex size
  if (pageIndex !== currentPage || pageSize !== currentPageSize) {
    setCurrentPage(pageIndex);
    setCurrentPageSize(pageSize);
    setRowsSelected(Array(data.length).fill(false));
  }

  const handleAllSelected = (checked: boolean) => {
    setRowsSelected(Array(data.length).fill(checked));

    params.set("isAllSelected", checked ? "true" : "false");
    params.set("isBatchOpOpen", checked ? "true" : "false");
    params.set("numRowsSelected", data.length.toString());
    router.replace(`${pathname}?${params.toString()}`);
    // console.log("All Selected is ", allSelected);
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
  };

  const handleBatchDelete = async () => {
    const counter = rowsSelected.filter((item) => item === true).length;
    // console.log("Size of rowSelected is ", rowsSelected.length);

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    await Promise.all(
      rowsSelected.map(async (row, index) => {
        if (row) {
          await deleteItemAction(data[index].id);
        }
      }),
    );

    // rowsSelected.map((row, index) => {
    //   if (row) {
    //     deleteItemAction(data[index].id);
    //   }
    // });
    setRowsSelected(Array(data.length).fill(false));
    toast.success("Entries Deleted");
  };

  const handleSort = (field: string) => {
    const order = sort.split(":")[1] === "asc" ? "desc" : "asc";
    const sortStr = field + ":" + order;
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortStr);
    router.push(`${pathname}?${params.toString()}`);
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
            {Object.entries(columnsStatus).map(([key, value]) => {
              return value.visible ? (
                <TableHead className="whitespace-nowrap p-3" key={key}>
                  {value.header}
                  {key === "m_tech_barcode" ||
                  key === "make" ||
                  key === "model" ||
                  key === "category" ||
                  key === "storage_location" ? (
                    <Button
                      className="p-1 text-left"
                      variant="ghost"
                      onClick={() => handleSort(key)}
                    >
                      <ArrowUpDown className="m-1 h-4 w-4" />
                    </Button>
                  ) : (
                    ``
                  )}
                </TableHead>
              ) : (
                ``
              );
            })}
            <TableHead className="text-center" key={"edit"}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data[0] ? (
            data.map((row, index) => (
              <TableRow
                key={row.id}
                // data-state={row.getIsSelected() && "selected"}
              >
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
                  if (key === "out") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row.out ? (
                          <Badge variant="default">Out</Badge>
                        ) : (
                          <Badge variant="secondary">In</Badge>
                        )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "broken") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row.broken ? (
                          <Badge variant="destructive">Broken</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }

                  return value.visible ? (
                    <TableCell className="whitespace-nowrap" key={key}>
                      {row[key] && row[key].length >= MAX_TEXT_LEN
                        ? `${row[key].substring(0, MAX_TEXT_LEN)}...`
                        : row[key]}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="edit">
                  {/* <Link href={`/dashboard/master-inventory/${row.id}`}>
                    <Button variant="outline">
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </Link> */}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const params = new URLSearchParams(searchParams);
                      router.push(`${pathname}/${row.id}?${params.toString()}`);
                    }}
                  >
                    <SquarePen className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Object.keys(inventoryColumnsDefault).length}
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

export default InventoryTable;
