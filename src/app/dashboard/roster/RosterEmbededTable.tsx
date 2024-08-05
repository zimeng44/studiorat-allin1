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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleMinus } from "lucide-react";

const MAX_TEXT_LEN = 25;

interface RosterEmbeddedTableProps {
  data: any[];
  columns: any[];
  handleRemoveFromBooking: Function;
  isPast: boolean;
}

const BookingEmbededTable = ({
  data,
  columns,
  handleRemoveFromBooking,
  isPast,
}: RosterEmbeddedTableProps) => {
  // console.log(data);
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
                Course Number
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
                    {row.courseN}
                  </TableCell>
                ) : (
                  ``
                )}
                {columnsVisible[1] ? (
                  <TableCell className="p-1 md:p-2" key={header[1]}>
                    {row.courseTitle}
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
                  <TableCell className="break-word" key={header[3]}>
                    {row.permissionDetails.startsWith("http") ? (
                      <a
                        className="text-indigo-500"
                        href={`${row.permissionDetails}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) =>
                          !window.confirm("You're headed to a external link")
                            ? e.preventDefault()
                            : ""
                        }
                      >
                        Link
                      </a>
                    ) : (
                      row.permissionDetails
                    )}
                  </TableCell>
                ) : (
                  ``
                )}
                {columnsVisible[4] ? (
                  <TableCell key={header[4]}>{row.permittedStudios}</TableCell>
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
