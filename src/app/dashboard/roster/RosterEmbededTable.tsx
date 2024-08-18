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
import { useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TagsInput } from "react-tag-input-component";
import { CircleMinus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { roster_permissions } from "@prisma/client";

const MAX_TEXT_LEN = 25;

interface RosterEmbeddedTableProps {
  data: roster_permissions[];
  columns: any[];
  handleRemoveFromBooking: Function;
  isEditable: boolean;
}

const BookingEmbededTable = ({
  data,
  columns,
  handleRemoveFromBooking,
  isEditable,
}: RosterEmbeddedTableProps) => {
  // console.log(isEditable);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  let numRowsSelected = searchParams.get("numRowsSelected")
    ? parseInt(searchParams.get("numRowsSelected") ?? "")
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

  // console.log(data.length);

  return (
    <div className="flex rounded-md border">
      <Table className="md:max-w-2xl">
        <TableHeader className="top-0 bg-indigo-100">
          <TableRow>
            {columnsVisible[0] ? (
              <TableHead
                className="whitespace-nowrap p-1 md:p-2"
                key={header[0]}
              >
                Permission code
              </TableHead>
            ) : (
              ``
            )}
            {columnsVisible[1] ? (
              <TableHead
                className="whitespace-nowrap border-x-0 p-1 md:p-2"
                key={header[1]}
              >
                Title
              </TableHead>
            ) : (
              ``
            )}
            {columnsVisible[2] ? (
              <TableHead
                className="whitespace-nowrap border-x-0 p-1 md:p-2"
                key={header[2]}
              >
                Instructor
              </TableHead>
            ) : (
              ``
            )}
            {columnsVisible[3] ? (
              <TableHead
                className="whitespace-nowrap border-x-0"
                key={header[3]}
              >
                Details
              </TableHead>
            ) : (
              ``
            )}
            {columnsVisible[4] ? (
              <TableHead key={header[4]}>Permitted Studios</TableHead>
            ) : (
              ``
            )}
            {data.length ? (
              data.filter((row) => row.start_date).length > 0 ? (
                <TableHead className="text-center" key="startEndDate">
                  Date
                </TableHead>
              ) : (
                ``
              )
            ) : (
              ``
            )}
            {isEditable ? (
              <TableHead className="text-center" key="deleteButton"></TableHead>
            ) : (
              ``
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, index) => (
              <TableRow key={row.id}>
                {columnsVisible[0] ? (
                  <TableCell
                    className="whitespace-nowrap p-1 md:p-2"
                    key={header[0]}
                  >
                    {row.permission_code}
                  </TableCell>
                ) : (
                  ``
                )}
                {columnsVisible[1] ? (
                  <TableCell className="p-1 md:p-2" key={header[1]}>
                    {row.permission_title}
                  </TableCell>
                ) : (
                  ``
                )}
                {columnsVisible[2] ? (
                  <TableCell className="whitespace-nowrap" key={header[2]}>
                    {row.instructor}
                  </TableCell>
                ) : (
                  ``
                )}
                {columnsVisible[3] ? (
                  <TableCell className="content-center" key={header[3]}>
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
                        {row.permission_details?.startsWith("http") ? (
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
                )}
                {columnsVisible[4] ? (
                  <TableCell className="max-w-28" key={header[4]}>
                    {/* {row.permitted_studios}{" "} */}
                    <TagsInput
                      value={row.permitted_studios as string[]}
                      // onChange={(value) => form.setValue(field.name, value)}
                      name="permitted_studios"
                      // placeHolder="Enter a studio"
                      disabled
                    />
                  </TableCell>
                ) : (
                  ``
                )}
                {data.filter((row) => row.start_date).length > 0 ? (
                  row.start_date && row.end_date ? (
                    <TableCell className="text-center" key="startEndDate">
                      {`${format(new Date(row.start_date), "MM/dd/y")} to ${format(new Date(row.end_date), "MM/dd/y")}`}
                    </TableCell>
                  ) : (
                    <TableCell
                      className="text-center"
                      key="startEndDate"
                    ></TableCell>
                  )
                ) : (
                  ``
                )}
                {isEditable ? (
                  <TableCell className="text-center" key="deleteButton">
                    <Button
                      type="button"
                      key="deleteButton"
                      variant="outline"
                      onClick={(e) => {
                        // e.preventDefault();
                        handleRemoveFromBooking(row);
                      }}
                      disabled={!isEditable}
                    >
                      <CircleMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                ) : (
                  ``
                )}
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
  );
};

export default BookingEmbededTable;
