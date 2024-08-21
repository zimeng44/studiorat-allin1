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
import { CirclePlus } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteItemAction } from "@/data/actions/inventory-actions";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
import { InventoryItem } from "@/data/definitions";
import { toast } from "sonner";
import { StrapiImage } from "@/components/custom/StrapiImage";

const MAX_TEXT_LEN = 20;

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  image: TableFieldStatus;
  m_tech_barcode: TableFieldStatus;
  make: TableFieldStatus;
  model: TableFieldStatus;
  category: TableFieldStatus;
  description: TableFieldStatus;
  accessories: TableFieldStatus;
  storage_location: TableFieldStatus;
  comments: TableFieldStatus;
}

interface InventoryTableProps {
  data: any[];
  columnsStatus: TableColumnStatus;
  itemObjArr: InventoryItem[];
  addToBooking: Function;
}

const BookingInventoryTable = ({
  data,
  columnsStatus,
  itemObjArr,
  addToBooking,
}: InventoryTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const sort = searchParams.get("sort") ?? "";

  const pageIndex = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";

  // remember the current page and page size to tell if navigated to a new page or set a new page size
  const [currentPage, setCurrentPage] = useState("1");
  const [currentPageSize, setCurrentPageSize] = useState("10");

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

  // clear the row selections when moving to a new page or setting a new page size
  if (pageIndex !== currentPage || pageSize !== currentPageSize) {
    setCurrentPage(pageIndex);
    setCurrentPageSize(pageSize);
    setRowsSelected(Array(data.length).fill(false));
  }

  const handleSort = (field: string) => {
    const order = sort.split(":")[1] === "asc" ? "desc" : "asc";
    const sortStr = field + ":" + order;
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortStr);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddToBooking = (row: InventoryItem) => {
    const newArr = structuredClone(itemObjArr);
    if (newArr.filter((item) => item.id === row.id).length > 0) {
      window.alert("Item Added Already.");
      return;
    }
    addToBooking([...newArr, row]);
    toast.success("Item Added.");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-indigo-100">
          <TableRow>
            {Object.entries(columnsStatus).map(([key, value]) => {
              return value.visible ? (
                <TableHead className="whitespace-nowrap" key={key}>
                  {value.header}
                  {key === "mTechBarcode" ||
                  key === "make" ||
                  key === "model" ||
                  key === "category" ||
                  key === "storageLocation" ? (
                    <Button
                      className="content-center p-1 text-left"
                      variant="ghost"
                      onClick={() => handleSort(key)}
                    >
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    ``
                  )}
                </TableHead>
              ) : (
                ``
              );
            })}
            <TableHead className="text-center" key={"addToBooking"}></TableHead>
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
                  if (key === "image") {
                    return value.visible ? (
                      <TableCell
                        className="relative flex h-20 w-20 items-center overflow-hidden rounded-md"
                        key={key}
                      >
                        {row[key] ? (
                          <StrapiImage
                            className="h-full w-full rounded-lg object-contain"
                            src={row[key].url}
                            height={100}
                            width={100}
                          />
                        ) : (
                          ``
                        )}
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
                    <TableCell className="" key={key}>
                      {row[key].length <= MAX_TEXT_LEN
                        ? row[key]
                        : `${row[key].substring(0, MAX_TEXT_LEN)}...`}
                    </TableCell>
                  ) : (
                    ``
                  );
                })}
                <TableCell className="text-center" key="addToBooking">
                  <Button
                    type="button"
                    key="addbutton"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToBooking(row);
                    }}
                  >
                    <CirclePlus className="h-4 w-4" />
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

export default BookingInventoryTable;
