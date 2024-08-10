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
import { Button } from "@/components/ui/button";
import { checkoutColumnsDefault, TableColumnStatus } from "./checkoutColumns";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

const MAX_TEXT_LEN = 8;

interface CheckoutSessionsTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
}

const CheckoutSessionsTable = ({
  data,
  columnsStatus,
}: CheckoutSessionsTableProps) => {
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
                <TableHead className="whitespace-nowrap p-3" key={key}>
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
              <TableRow key={row.id}>
                {Object.entries(columnsStatus).map(([key, value]) => {
                  if (key === "userName") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap p-1" key={key}>
                        {`${row.user.firstName} ${row.user.lastName}`}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }
                  if (key === "finished") {
                    return value.visible ? (
                      <TableCell className="whitespace-nowrap" key={key}>
                        {row.finished ? (
                          <Badge variant="secondary">Finished</Badge>
                        ) : (
                          <Badge variant="default">Ongoing</Badge>
                        )}
                      </TableCell>
                    ) : (
                      ``
                    );
                  }

                  return value.visible ? (
                    <TableCell className="whitespace-nowrap p-1" key={key}>
                      {key === "creationTime" || key === "finishTime"
                        ? row[key] === null
                          ? ``
                          : format(new Date(row[key]), "MM/dd/yyyy hh:mm a")
                        : row[key]}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="edit">
                  {/* <Link href={`/dashboard/checkout/${row.id}`}>
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
                colSpan={Object.keys(checkoutColumnsDefault).length}
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

export default CheckoutSessionsTable;
