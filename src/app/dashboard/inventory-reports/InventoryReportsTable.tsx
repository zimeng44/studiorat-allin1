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
  SquarePen,
  PlusCircle,
  // Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// import InventoryFilterForm from "@/components/forms/InventoryFilterForm";

import { deleteItemAction } from "@/data/actions/inventory-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "@/components/custom/Search";
import { Badge } from "@/components/ui/badge";
import {
  ColumnKeys,
  inventoryReportsColumnsDefault,
  TableColumnStatus,
} from "./inventoryReportsColumns";
import { InventoryReportType } from "@/data/definitions";

const MAX_TEXT_LEN = 8;

// interface TableFieldStatus {
//   header: string;
//   visible: boolean;
// }
// interface TableColumnStatus {
//   creationTime: TableFieldStatus;
//   stuIDCheckout: TableFieldStatus;
//   stuIDCheckin: TableFieldStatus;
//   studio: TableFieldStatus;
//   otherLocation: TableFieldStatus;
//   creationMonitor: TableFieldStatus;
//   finishMonitor: TableFieldStatus;
//   finishTime: TableFieldStatus;
//   notes: TableFieldStatus;
//   finished: TableFieldStatus;
// }

interface InventoryReportsTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
}

const InventoryReportsTable = ({
  data,
  columnsStatus,
}: InventoryReportsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-indigo-100">
          <TableRow>
            {Object.entries(columnsStatus).map(([key, value]) => {
              return value.visible ? (
                <TableHead className="whitespace-nowrap" key={key}>
                  {value.header}
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
              <TableRow
                key={row.id}
                // data-state={row.getIsSelected() && "selected"}
              >
                {Object.entries(columnsStatus).map(([key, value]) => {
                  if (key === "creatorName") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {`${row.creator?.firstName ?? ""} ${row.creator?.lastName ?? ""}`}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "numItemsChecked") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        <Badge variant="secondary">
                          {row.itemsChecked?.data?.length ?? ""}
                        </Badge>
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "isFinished") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row.isFinished ? (
                          <Badge variant="secondary">Finished</Badge>
                        ) : (
                          <Badge variant="default">In Progress</Badge>
                        )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }

                  return value.visible ? (
                    <TableCell className="whitespace-nowrap" key={key}>
                      {key === "createdAt"
                        ? new Date(row[key] ?? "").toLocaleString()
                        : row[key]}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="edit">
                  <Link href={`/dashboard/inventory-reports/${row.id}`}>
                    <Button variant="outline">
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Object.keys(inventoryReportsColumnsDefault).length}
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

export default InventoryReportsTable;
