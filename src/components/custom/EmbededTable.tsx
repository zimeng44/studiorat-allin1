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
// import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { InventoryItem } from "@/data/definitions";
import { inventory_items } from "@prisma/client";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";

const MAX_TEXT_LEN = 30;

interface InventoryTableProps {
  data?: inventory_items[];
  setItemObjArr: Function;
  columns: any[];
  disabled: boolean;
}

const EmbededInventoryTable = ({
  data,
  setItemObjArr,
  columns,
  disabled,
}: InventoryTableProps) => {
  // store columns visibility
  const [columnsVisible, setColumnsVisible] = useState(
    Array(columns.length)
      .fill(true)
      .map((item, index) => columns[index].visible),
  );

  // store keys of columns
  const header = Array(columns.length)
    .fill("")
    .map((item, index) => columns[index].accessorKey);

  return (
    <div>
      <div className="overflow-auto rounded-md border">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-indigo-100">
            <TableRow>
              {columnsVisible[0] ? (
                <TableHead
                  className="whitespace-nowrap p-1 md:p-3"
                  key={header[0]}
                >
                  MTech Barcode
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[1] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0 p-1 md:p-3"
                  key={header[1]}
                >
                  {/* {" "} */}
                  Make
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[2] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0 p-1 md:p-3"
                  key={header[2]}
                >
                  {/* {" "} */}
                  Model
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[3] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0 p-1 md:p-3"
                  key={header[3]}
                >
                  {/* {" "} */}
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
              {columnsVisible[8] ? (
                <TableHead className="p-1 text-center md:p-3" key={header[8]}>
                  Returned
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[9] ? (
                <TableHead className="p-1 text-center md:p-3" key={header[9]}>
                  Broken
                </TableHead>
              ) : (
                ``
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length ? (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  {columnsVisible[0] ? (
                    <TableCell
                      className="whitespace-nowrap p-1 md:p-3"
                      key={header[0]}
                    >{`${row.m_tech_barcode}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[1] ? (
                    <TableCell className="p-1 md:p-3" key={header[1]}>
                      {(row.make?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.make?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.make ?? ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[2] ? (
                    <TableCell className="p-1 md:p-3" key={header[2]}>
                      {(row.model?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.model?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.model ?? ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[3] ? (
                    <TableCell className="whitespace-nowrap" key={header[3]}>
                      {(row.category?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.category?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.category ?? ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[4] ? (
                    <TableCell className="whitespace-nowrap" key={header[4]}>
                      {(row.description?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.description?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.description ?? ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[5] ? (
                    <TableCell key={header[5]}>
                      {(row.accessories?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.accessories?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.accessories ?? ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[6] ? (
                    <TableCell
                      key={header[6]}
                    >{`${row.storage_location}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[7] ? (
                    <TableCell className="whitespace-nowrap" key={header[7]}>
                      {(row.comments?.length ?? 0) > MAX_TEXT_LEN
                        ? `${row.comments?.substring(0, MAX_TEXT_LEN)}...`
                        : `${row.comments ?? 0}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[8] ? (
                    <TableCell
                      className=" p-1 text-center md:p-4"
                      key={header[8]}
                    >
                      {row.out ? (
                        <Badge variant="default">No</Badge>
                      ) : (
                        <Badge variant="secondary">Yes</Badge>
                      )}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[9] ? (
                    <TableCell
                      className=" p-1 text-center md:p-4"
                      key={header[9]}
                    >
                      <div className="h-10 content-center items-center">
                        <Switch
                          checked={row.broken ?? false}
                          onCheckedChange={(checked: boolean) =>
                            setItemObjArr((prev: InventoryItem[]) =>
                              prev.map((item) => {
                                item.broken =
                                  item.id === row.id ? checked : item.broken;
                                return item;
                              }),
                            )
                          }
                        />
                      </div>
                    </TableCell>
                  ) : (
                    ``
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={header.length} className="h-24 text-center">
                  No item added.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmbededInventoryTable;
