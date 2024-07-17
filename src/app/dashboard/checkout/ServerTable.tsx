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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  EllipsisVertical,
  Filter,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import EditForm from "./EditForm";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import CustomColumns from "./CustomColumns";
import AddForm from "./AddForm";
import FilterForm from "./FilterForm";

interface ServerTableProps {
  data: any[];
  pageSize: number;
  totalEntries: number;
  filter: {};
  filterOn: boolean;
  setNumRowSelected: Function;
  setPageIndex: Function;
  setSort: Function;
  setFilter: Function;
  addItem: Function;
  updateItem: Function;
  deleteItem: Function;
}

const ServerTable = ({
  data,
  pageSize,
  totalEntries,
  filter,
  filterOn,
  setNumRowSelected,
  setPageIndex,
  setSort,
  setFilter,
  addItem,
  updateItem,
  deleteItem,
}: ServerTableProps) => {
  const [columns, setColumns] = useState(CustomColumns); // column meta data

  // store columns visibility
  const [columnsVisible, setColumnsVisible] = useState(
    Array(CustomColumns.length)
      .fill(true)
      .map((item, index) => columns[index].visible),
  );

  //store row selection
  const [rowsSelected, setRowsSelected] = useState(
    Array(data.length).fill(false),
  );
  const [allSelected, setAllSelected] = useState(false); //store if select all is checked
  const [batchPopoverOpen, setbatchPopoverOpen] = useState(false); //store if batch action menu popover is open
  const [filterOpen, setFilterOpen] = useState(false);

  // console.log(columns.length);
  // store keys of columns
  const header = Array(columns.length)
    .fill("")
    .map((item, index) => columns[index].accessorKey);

  const maxLen = 8;
  const [addOpen, setAddOpen] = useState(false); // store if add window is open

  // store if details window is open
  const [openDetails, setOpenDetails] = useState(
    Array(data.length).fill(false),
  );

  // if data is changed, reset the arrays that store the status
  useEffect(() => {
    setOpenDetails(Array(data.length).fill(false));
    setRowsSelected(Array(data.length).fill(false));
    setAllSelected(false);
  }, [data]);

  // if select-all is checked, set individual rows checked
  useEffect(() => {
    setRowsSelected(Array(data.length).fill(allSelected));
  }, [allSelected]);

  // if any row is select, show the batch action menue
  useEffect(() => {
    setNumRowSelected(rowsSelected.filter((item) => item).length);
    if (rowsSelected.filter((item) => item === true).length > 0) {
      setbatchPopoverOpen(true);
    }

    if (rowsSelected.filter((item) => item === true).length < 1) {
      setbatchPopoverOpen(false);
    }
  }, [rowsSelected]);

  const resetColumns = () => {
    setColumnsVisible(
      Array(CustomColumns.length)
        .fill(true)
        .map((item, index) => columns[index].visible),
    );
    setSort("");
    setRowsSelected(Array(data.length).fill(false));
  };

  const handleRowClick = (index: number) => {
    setOpenDetails(
      openDetails.map((isOpen, i) => (i === index ? !isOpen : isOpen)),
    );
  };

  const toggleColumnVisible = (matchedIndex: number, checked: boolean) => {
    const newColumnsVisible = columnsVisible.map((col, index) => {
      return index === matchedIndex ? checked : col;
    });

    setColumnsVisible(newColumnsVisible);
  };

  const handleRowSelection = (
    matchedIndex: number,
    checked: string | boolean,
  ) => {
    // const newSelection = rowsSelected.map((rowChecked, index) =>
    //   index === matchedIndex ? checked : rowChecked,
    // );

    setRowsSelected((rowsSelected) =>
      rowsSelected.map((rowChecked, index) =>
        index === matchedIndex ? checked : rowChecked,
      ),
    );
  };

  const handleAllSelected = (checked: boolean | "indeterminate") => {
    // console.log("checked passed in is ", checked);
    if (checked !== "indeterminate") setAllSelected(checked);
    // console.log("All Selected is ", allSelected);
  };

  const getRow: {} = (data: [], rowId: number) =>
    data.filter((item) => item.id === rowId)[0];

  const handleBatchDelete = () => {
    const counter = rowsSelected.filter((item) => item === true).length;
    // console.log("Size of rowSelected is ", rowsSelected.length);

    const confirm = window.confirm(
      `Are you sure you want to delete ${counter} item(s)?`,
    );

    if (!confirm) return;

    rowsSelected.map((row, index) => {
      if (row) {
        // const id =
        deleteItem(data[index].id);

        // console.log(`item id ${id} deleted!!!!!!!!!!`);
      }
    });
    if ((totalEntries - counter) % pageSize === 0) {
      setPageIndex((pageIndex) => pageIndex - 1);
    }
    // console.log("Row Number after batch delete is ", numRows);
    setRowsSelected(Array(data.length).fill(false));
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filter</SheetTitle>
              {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
            </SheetHeader>
            <FilterForm
              filter={filter}
              setFilter={setFilter}
              filteOpen={filterOpen}
              setFilterOpen={setFilterOpen}
            />
          </SheetContent>
        </Sheet>
        <p className="ml-2">{`${filterOn ? "(filter: on)" : ""}`}</p>
        <div className="item-end ml-auto">
          {/* <Button variant="outline" className="h10 ml-5">
            Add
          </Button> */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>New Item</DialogTitle>
                {/* <DialogDescription></DialogDescription> */}
              </DialogHeader>
              <AddForm
                rowData={{
                  attributes: {
                    creationTime: `${new Date().toLocaleString()}`,
                    stuIDCheckout: "",
                    stuIDCheckin: "",
                    studio: "",
                    otherLocation: "",
                    creationMonitor: "",
                    finishMonitor: "",
                    finishTime: "",
                    notes: "",
                    finished: false,
                    inventory_items: [],
                    studio_user: [863],
                  },
                }}
                addItem={addItem}
                setAddOpen={setAddOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-5 h-10">
              <Settings className="mr-2 h-4 w-4" />
              Display
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((col, index) => {
              return (
                <DropdownMenuCheckboxItem
                  key={col.accessorKey}
                  className="capitalize"
                  checked={columnsVisible[index]}
                  onCheckedChange={(checked) =>
                    toggleColumnVisible(index, checked)
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              key={"reset"}
              className="capitalize"
              onSelect={(e) => {
                e.preventDefault();
                resetColumns();
              }}
            >
              Reset
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-indigo-100">
            <TableRow>
              <TableHead key={"select"}>
                <Popover open={batchPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Checkbox
                      className="mr-2"
                      checked={allSelected}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleAllSelected(checked)
                      }
                      aria-label="Select all"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-50 space-x-2"
                    onInteractOutside={(e) => e.preventDefault()}
                    side="right"
                    // asChild
                  >
                    <Button
                      onClick={() => handleBatchDelete()}
                      variant="destructive"
                    >
                      Delete Selected
                    </Button>
                    <Button
                      onClick={() => {
                        setRowsSelected(Array(data.length).fill(false));
                        setAllSelected(false);
                      }}
                      variant="secondary"
                    >
                      Reset
                    </Button>
                  </PopoverContent>
                </Popover>
              </TableHead>
              {columnsVisible[0] ? (
                <TableHead className="whitespace-nowrap p-0" key={header[0]}>
                  Creation Time
                  <Button
                    className="p-1 text-left"
                    variant="ghost"
                    onClick={() => setSort("creationTime")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[1] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[1]}
                >
                  {/* {" "} */}
                  Checkout ID
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => setSort("stuIDCheckout")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[2] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[2]}
                >
                  {/* {" "} */}
                  Checkin ID
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => setSort("stuIDCheckin")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[3] ? (
                <TableHead
                  className="whitespace-nowrap border-x-0"
                  key={header[3]}
                >
                  {/* {" "} */}
                  Studio
                  <Button
                    className="p-1"
                    variant="ghost"
                    onClick={() => setSort("studio")}
                  >
                    <ArrowUpDown className="m-1 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[4] ? (
                <TableHead key={header[4]}>Other Location</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[5] ? (
                <TableHead key={header[5]}>Creation Monitor</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[6] ? (
                <TableHead key={header[6]}>Finish Monitor</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[7] ? (
                <TableHead key={header[7]}>Finsh Time</TableHead>
              ) : (
                ``
              )}
              {columnsVisible[8] ? (
                <TableHead className="text-center" key={header[8]}>
                  Notes
                </TableHead>
              ) : (
                ``
              )}
              {columnsVisible[9] ? (
                <TableHead className="text-center" key={header[9]}>
                  Finished
                </TableHead>
              ) : (
                ``
              )}
              <TableHead className="text-center" key={"details"}></TableHead>
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
                  <TableCell key="select">
                    <Checkbox
                      checked={rowsSelected[index]}
                      onCheckedChange={(checked) =>
                        handleRowSelection(index, checked)
                      }
                      // checked={row.getIsSelected()}
                      // onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select Row"
                    />
                  </TableCell>
                  {columnsVisible[0] ? (
                    <TableCell
                      className="whitespace-nowrap p-1"
                      key={header[0]}
                    >{`${new Date(row.attributes.creationTime).toLocaleString()}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[1] ? (
                    <TableCell
                      className="whitespace-nowrap p-4"
                      key={header[1]}
                    >
                      {row.attributes.stuIDCheckout.length > maxLen
                        ? `${row.attributes.stuIDCheckout.substring(0, maxLen)}...`
                        : `${row.attributes.stuIDCheckout}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[2] ? (
                    <TableCell className="whitespace-nowrap" key={header[2]}>
                      {row.attributes.stuIDCheckin.length > maxLen
                        ? `${row.attributes.stuIDCheckin.substring(0, maxLen)}...`
                        : `${row.attributes.stuIDCheckin}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[3] ? (
                    <TableCell className="whitespace-nowrap" key={header[3]}>
                      {row.attributes.studio.length > maxLen
                        ? `${row.attributes.studio.substring(0, maxLen)}...`
                        : `${row.attributes.studio}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[4] ? (
                    <TableCell className="whitespace-nowrap" key={header[4]}>
                      {row.attributes.otherLocation?.length > maxLen
                        ? `${row.attributes.otherLocation.substring(0, maxLen)}...`
                        : `${row.attributes.otherLocation}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[5] ? (
                    <TableCell key={header[5]}>
                      {row.attributes.creationMonitor.length > maxLen
                        ? `${row.attributes.creationMonitor.substring(0, maxLen)}...`
                        : `${row.attributes.creationMonitor}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[6] ? (
                    <TableCell
                      key={header[6]}
                    >{`${row.attributes.finishMonitor}`}</TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[7] ? (
                    <TableCell className="whitespace-nowrap" key={header[7]}>
                      {`${row.attributes.finishTime ? new Date(row.attributes.finishTime).toLocaleString() : ""}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[8] ? (
                    <TableCell className="p-1 text-center" key={header[8]}>
                      {row.attributes.notes?.length > maxLen
                        ? `${row.attributes.notes.substring(0, maxLen)}...`
                        : `${row.attributes.notes}`}
                    </TableCell>
                  ) : (
                    ``
                  )}
                  {columnsVisible[9] ? (
                    <TableCell className="text-center" key={header[9]}>
                      <Checkbox disabled checked={row.attributes.finished} />
                    </TableCell>
                  ) : (
                    ``
                  )}
                  <TableCell className="text-center" key="details">
                    <Dialog
                      open={openDetails[index]}
                      onOpenChange={() => handleRowClick(index)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(index);
                          }}
                          variant="outline"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        onInteractOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                      >
                        <DialogHeader>
                          <DialogTitle>Item Info</DialogTitle>
                          {/* <DialogDescription></DialogDescription> */}
                        </DialogHeader>
                        <EditForm
                          rowId={row.id}
                          rowData={() => getRow(data, row.id)}
                          pageSize={pageSize}
                          totalEntries={totalEntries}
                          setPageIndex={setPageIndex}
                          updateItem={updateItem}
                          deleteItem={deleteItem}
                          closeDetail={() => handleRowClick(index)}
                        />
                      </DialogContent>
                    </Dialog>
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

export default ServerTable;
