"use client";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, SquarePen } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
// import { deleteRosterAction } from "@/data/actions/roster-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { Badge } from "@/components/ui/badge";
import {
  rosterPermissionsColumnsDefault,
  TableColumnStatus,
} from "./rosterPermissionsColumns";
import { TagsInput } from "react-tag-input-component";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  deleteManyRosterPermissionsAction,
  deleteRosterPermissionAction,
} from "@/data/actions/rosterPermission-actions";

const MAX_TEXT_LEN = 20;

interface RosterPermissionsTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
  userRole: string;
}

const RosterTable = ({
  data,
  columnsStatus,
  userRole,
}: RosterPermissionsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const sort = searchParams.get("sort") ?? "";
  // console.log(sort);

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
    // console.log("Size of rowSelected is ", rowsSelected.length);

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    const deleteList = rowsSelected.map((row, index) => {
      if (row) return data[index].id;
    });

    if (deleteList.filter((item) => item !== undefined).length === 0) {
      toast.error("No item selected");
    } else {
      const { res, error } = await deleteManyRosterPermissionsAction(
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
            {userRole === "Admin" ? (
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
            ) : (
              ``
            )}

            {Object.entries(columnsStatus).map(([key, value]) => {
              return value.visible ? (
                <TableHead className="whitespace-nowrap p-3" key={key}>
                  {value.header}
                  {key === "permission_code" ||
                  key === "permission_title" ||
                  key === "instructor" ||
                  key === "start_date" ||
                  key === "end_date" ? (
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
          {data.length ? (
            data.map((row, index) => (
              <TableRow
                key={row.id}
                // data-state={row.getIsSelected() && "selected"}
              >
                {userRole === "Admin" ? (
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
                ) : (
                  ``
                )}
                {Object.entries(columnsStatus).map(([key, value]) => {
                  if (key === "permission_details") {
                    return value.visible ? (
                      <TableCell className="break-word" key={key}>
                        <HoverCard>
                          <HoverCardTrigger
                            className="flex-col content-center"
                            asChild
                          >
                            <div>
                              <Info className="h-5 w-5" />
                              <p className="whitespace-nowrap text-xs text-slate-400">
                                (hover for details)
                              </p>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            {row?.permission_details?.startsWith("http") ? (
                              <a
                                className="text-indigo-500"
                                href={`${row.permission_details}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) =>
                                  !window.confirm(
                                    "You're headed to a external link",
                                  )
                                    ? e.preventDefault()
                                    : ""
                                }
                              >
                                Link
                              </a>
                            ) : (
                              row.permission_details
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "permitted_studios") {
                    return value.visible ? (
                      <TableCell className="break-word" key={key}>
                        <TagsInput
                          value={row.permitted_studios}
                          // onChange={(value) => form.setValue(field.name, value)}
                          name="permitted_studios"
                          // placeHolder="Enter a studio"
                          disabled
                        />
                      </TableCell>
                    ) : (
                      ``
                    );
                  }

                  if (key === "start_date" || key === "end_date") {
                    return value.visible ? (
                      <TableCell className="break-word" key={key}>
                        {row[key] === null
                          ? ``
                          : format(new Date(row[key]), "MM/dd/y")}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }

                  return value.visible ? (
                    <TableCell className="break-words" key={key}>
                      {row[key]}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="edit">
                  {/* <Link href={`/dashboard/roster/permissions/${row.id}`}>
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
                colSpan={Object.keys(rosterPermissionsColumnsDefault).length}
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

export default RosterTable;
