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
import { InventoryItemWithImage } from "@/data/definitions";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CircleMinus } from "lucide-react";

const MAX_TEXT_LEN = 30;

interface InventoryTableProps {
  data?: InventoryItemWithImage[];
  setItemObjArr: Function;
  columnsMeta: any;
  disabled: boolean;
}

const InventoryItemCart = ({
  data,
  setItemObjArr,
  columnsMeta,
  disabled,
}: InventoryTableProps) => {
  const handleRemoveFromBooking = (row: InventoryItemWithImage) => {
    if (data?.length) {
      let newArr = data?.filter((item) => item.id !== row.id);
      setItemObjArr(newArr);
    }
  };

  return (
    <div>
      <div className="overflow-auto rounded-md border">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-indigo-100">
            <TableRow>
              {Object.entries(columnsMeta).map(
                ([key, value]: [key: string, value: any]) => {
                  return value.visible ? (
                    <TableHead
                      className="whitespace-nowrap p-1 md:p-3"
                      key={key}
                    >
                      {value.header}
                    </TableHead>
                  ) : (
                    ``
                  );
                },
              )}
              {disabled ? (
                ""
              ) : (
                <TableHead
                  className="text-center"
                  key="deleteButton"
                ></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length ? (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  {Object.entries(columnsMeta).map(
                    ([key, value]: [key: string, value: any]) => {
                      if (key === "m_tech_barcode") {
                        return value.visible ? (
                          <TableCell className="whitespace-nowrap" key={key}>
                            {row[key] ?? ""}
                          </TableCell>
                        ) : (
                          ``
                        );
                      }
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
                            <div className="h-10 content-center items-center">
                              <Switch
                                checked={row.broken ?? false}
                                onCheckedChange={(checked: boolean) =>
                                  setItemObjArr(
                                    (prev: InventoryItemWithImage[]) =>
                                      prev.map((item) => {
                                        item.broken =
                                          item.id === row.id
                                            ? checked
                                            : item.broken;
                                        return item;
                                      }),
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        ) : (
                          ``
                        );
                      }

                      return value.visible ? (
                        <TableCell className="hyphens-auto" key={key}>
                          {row[key as keyof InventoryItemWithImage] &&
                          typeof row[key as keyof InventoryItemWithImage] ===
                            "string"
                            ? `${row[key as keyof InventoryItemWithImage]}`
                            : ``}
                        </TableCell>
                      ) : (
                        ``
                      );
                    },
                  )}
                  {disabled ? (
                    ``
                  ) : (
                    <TableCell className="text-center" key="deleteButton">
                      <Button
                        type="button"
                        key="addbutton"
                        variant="outline"
                        onClick={(e) => {
                          // e.preventDefault();
                          handleRemoveFromBooking(row);
                        }}
                        disabled={disabled}
                      >
                        <CircleMinus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(columnsMeta).length}
                  className="h-24 text-center"
                >
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

export default InventoryItemCart;
