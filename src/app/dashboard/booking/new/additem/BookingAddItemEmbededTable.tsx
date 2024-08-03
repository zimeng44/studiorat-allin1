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

import {
  deleteItemAction,
  updateItemAction,
} from "@/data/actions/inventory-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleMinus } from "lucide-react";
import { InventoryItem } from "@/data/definitions";

const MAX_TEXT_LEN = 25;

interface BookingAddItemEmbededTableProps {
  data: InventoryItem[] | any[];
  columns: any[];
  itemObjArr: InventoryItem[];
  setItemObjArr: Function;
}

const BookingAddItemEmbededTable = ({
  data,
  columns,
  itemObjArr,
  setItemObjArr,
}: BookingAddItemEmbededTableProps) => {
  // console.log(data);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  let numRowsSelected = searchParams.get("numRowsSelected")
    ? parseInt(searchParams.get("numRowsSelected")??"0")
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

  const handleRemoveFromBooking = (row: InventoryItem) => {
    let newArr = itemObjArr.filter((item) => item.id !== row.id);
    setItemObjArr(newArr);
  };

  // console.log(data.length);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="top-0 bg-indigo-100">
            <TableRow>
              {columnsVisible[0] ? (
                <TableHead
                  className="whitespace-nowrap p-1 md:p-4"
                  key={header[0]}
                >
                  MTech Barcode
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[1] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0 p-1 md:p-4"
                  key={header[1]}
                >
                  Make
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[2] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0 p-1 md:p-4"
                  key={header[2]}
                >
                  Model
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[3] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[3]}
                >
                  Category
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
              {/* {columnsVisible[8] ? (
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
              )} */}
              <TableHead className="text-center" key="deleteButton"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  {columnsVisible[0] ? (
                    <TableCell
                      className="whitespace-nowrap p-1 md:p-4"
                      key={header[0]}
                    >{`${row.mTechBarcode}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[1] ? (
                    <TableCell className="p-1 md:p-4" key={header[1]}>
                      {row.make.length > MAX_TEXT_LEN
                        ? `${row.make.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.make}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[2] ? (
                    <TableCell className="p-1 md:p-4" key={header[2]}>
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
                  {/* {columnsVisible[8] ? (
                    <TableCell className="p-1 text-center" key={header[8]}>
                      <Checkbox disabled checked={row.out} />
                    </TableCell>
                  ) : (
                    ``
                  )} */}
                  {/* {columnsVisible[9] ? (
                    <TableCell className="text-center" key={header[9]}>
                      <Checkbox
                        checked={row.broken}
                        onCheckedChange={(checked) => {
                          updateItemAction({ broken: !row.broken }, row.id);
                        }}
                      />
                    </TableCell>
                  ) : (
                    ``
                  )} */}
                  <TableCell className="text-center" key="deleteButton">
                    <Button
                      type="button"
                      key="addbutton"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromBooking(row);
                      }}
                    >
                      <CircleMinus className="h-4 w-4" />
                    </Button>
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

export default BookingAddItemEmbededTable;
