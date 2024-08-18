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

import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  inventoryReportsColumnsDefault,
  TableColumnStatus,
} from "./inventoryReportsColumns";
import { format } from "date-fns";
import { InventoryReportWithCreatorAndItems } from "@/data/definitions";

const MAX_TEXT_LEN = 8;
interface InventoryReportsTableProps {
  data: InventoryReportWithCreatorAndItems[];
  columnsStatus: TableColumnStatus;
}

const InventoryReportsTable = ({
  data,
  columnsStatus,
}: InventoryReportsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <div className="rounded-md">
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
                  if (key === "created_by") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {`${row.created_by?.first_name ?? ""} ${row.created_by?.last_name ?? ""}`}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "num_items_checked") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        <Badge variant="secondary">
                          {row.inventory_items?.length ?? ""}
                        </Badge>
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "inventory_size") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        <Badge variant="secondary">{row[key]}</Badge>
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "is_finished") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row.is_finished ? (
                          <Badge variant="secondary">Finished</Badge>
                        ) : (
                          <Badge variant="default">In Progress</Badge>
                        )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "created_at") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {!row[key]
                          ? ``
                          : format(
                              new Date(row[key] ?? ""),
                              "MM/dd/yyyy hh:mm a",
                            )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "notes") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row[key]}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                })}
                <TableCell className="text-center" key="edit">
                  {/* <Link href={`/dashboard/inventory-reports/${row.id}`}>
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
