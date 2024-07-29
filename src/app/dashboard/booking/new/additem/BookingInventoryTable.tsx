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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CirclePlus,
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
  PlusCircle,
  // Search,
  Settings,
  ShoppingCart,
  SquarePen,
  Users2,
} from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
// import { inventoryColumnsDefault } from "@/data/inventoryColumns";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
import { InventoryItem } from "@/data/definitions";

const MAX_TEXT_LEN = 20;

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  mTechBarcode: TableFieldStatus;
  make: TableFieldStatus;
  model: TableFieldStatus;
  category: TableFieldStatus;
  description: TableFieldStatus;
  accessories: TableFieldStatus;
  storageLocation: TableFieldStatus;
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
  // console.log(data);
  const pathParams = useParams<{ bookingId: string }>();
  // const editable = pathParams.bookingId ? false : true;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const sort = searchParams.get("sort") ?? "";
  // console.log(sort);

  // let filterOpen = searchParams.get("filterOpen") === "true";
  const pageIndex = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const isAllSelected = searchParams.get("isAllSelected") === "true";
  const isBatchOpOpen = searchParams.get("isBatchOpOpen") === "true";

  // remember the current page and page size to tell if navigated to a new page or set a new page size
  const [currentPage, setCurrentPage] = useState("1");
  const [currentPageSize, setCurrentPageSize] = useState("10");

  // const [numRowsSelected, setNumRowsSelected] = useState(0);

  // store columns visibility
  // const [columnsVisible, setColumnsVisible] = useState(
  //   Array(columns.length)
  //     .fill(true)
  //     .map((item, index) => columns[index].visible),
  // );

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
    // const params = new URLSearchParams(searchParams);
    // params.delete("numRowsSelected");
    // params.delete("isBatchOpOpen");
    // params.delete("isAllSelected");
    // router.replace(`${pathname}?${params.toString()}`);
  }

  // store keys of columns
  // const header = Array(columns.length)
  //   .fill("")
  //   .map((item, index) => columns[index].accessorKey);

  // console.log(data.length);

  const handleAllSelected = (checked: boolean) => {
    setRowsSelected(Array(data.length).fill(checked));

    params.set("isAllSelected", checked ? "true" : "false");
    params.set("isBatchOpOpen", checked ? "true" : "false");
    params.set("numRowsSelected", data.length.toString());
    router.replace(`${pathname}?${params.toString()}`);
    // console.log("All Selected is ", allSelected);
  };

  const handleRowSelection = (
    matchedIndex: number,
    checked: boolean | undefined,
  ) => {
    setRowsSelected((rowsSelected) =>
      rowsSelected.map((rowChecked, index) =>
        index === matchedIndex ? checked : rowChecked,
      ),
    );
  };

  const handleResetSelection = () => {
    setRowsSelected(Array(data.length).fill(false));
    params.set("isAllSelected", "false");
    params.set("isBatchOpOpen", "false");
    params.set("numRowsSelected", "0");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleBatchDelete = () => {
    const counter = rowsSelected.filter((item) => item === true).length;
    // console.log("Size of rowSelected is ", rowsSelected.length);

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    rowsSelected.map((row, index) => {
      if (row) {
        deleteItemAction(data[index].id);
      }
    });
    setRowsSelected(Array(data.length).fill(false));
  };

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

    // addToBooking((prev: InventoryItem[]) => {
    //   if (prev.filter((item) => item.id === row.id).length > 0) {
    //     window.alert("Item Added Already.");
    //     return [...prev];
    //   }
    //   return [...prev, row];
    // });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-indigo-100">
          <TableRow>
            {Object.entries(columnsStatus).map(([key, value]) => {
              return value.visible ? (
                <TableHead className="whitespace-nowrap p-3" key={key}>
                  {value.header}
                  {key === "mTechBarcode" ||
                  key === "make" ||
                  key === "model" ||
                  key === "category" ||
                  key === "storageLocation" ? (
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
            <TableHead className="text-center" key={"addToBooking"}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, index) => (
              <TableRow key={row.id}>
                {Object.entries(columnsStatus).map(([key, value]) => {
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
                    <TableCell className="whitespace-nowrap" key={key}>
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
