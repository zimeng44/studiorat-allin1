"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { InventoryItem } from "@/data/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
import TabHeader from "./TabHeader";
import BookingInventoryTable from "./PermissionTable";
import { CirclePlus, Grid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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

interface ViewTabsProps {
  data: any[];
  meta: { pagination: { pageCount: number; total: number } };
  filter: {};
  itemObjArr: InventoryItem[];
  addToBooking: Function;
}

function LinkCard({
  item,
  itemObjArr,
  setItemObjArr,
}: {
  item: Readonly<InventoryItem>;
  itemObjArr: Readonly<InventoryItem>[];
  setItemObjArr: Function;
}) {
  // console.log(item);
  const handleClick = () => {
    // const newArr = structuredClone(itemObjArr);
    if (itemObjArr.filter((addedItem) => addedItem.id === item.id).length > 0) {
      window.alert("Item Added Already.");
      return;
    }
    setItemObjArr([...itemObjArr, item]);
    toast.success("Item Added.");
  };
  return (
    <Card
      className="relative"
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      <CardHeader>
        <CardTitle className="leading-8 text-pink-500">
          {item.make + " " + item.model || "Brand Model"}
          {/* {item.model || "Model"} */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 flex w-full items-center leading-7">
          {item.description?.slice(0, 50)}
          <CirclePlus className="ml-2 h-5 w-5 content-end" />
        </p>
      </CardContent>
    </Card>
  );
}

const AddPermissionPageTabs = ({
  data,
  meta,
  filter,
  itemObjArr,
  addToBooking,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(inventoryColumnsDefault),
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const addView = searchParams.get("addView") ?? "list";
  const params = new URLSearchParams(searchParams);
  const [defaultTab, setDefaultTab] = useState(addView);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;

      params.set("addView", isMobile ? "cards" : addView);
      setDefaultTab(isMobile ? "cards" : addView);
      router.replace(`${pathname}?${params.toString()}`);
      // Default to 'list' on mobile, 'grid' on larger screens
    };

    handleResize(); // Set initial state
  }, []);

  return (
    <div className="py-2">
      <Tabs
        value={addView}
        onValueChange={(value) => {
          params.set("addView", value);
          router.replace(`${pathname}?${params.toString()}`);
          setDefaultTab(value);
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="left-content font-bold">Available Items</h1>
          <div className="right-content">
            <TabsList>
              {defaultTab === "cards" ? (
                ``
              ) : (
                <TabsTrigger value="list">
                  <List className=" h-4 w-4" />
                </TabsTrigger>
              )}
              <TabsTrigger value="cards">
                <Grid className=" h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabHeader
          columnsStatus={columnsStatus}
          filter={filter}
          setColumnsStatus={setColumnsStatus}
          defaultTab={defaultTab}
        />
        <TabsContent value="list">
          <BookingInventoryTable
            data={data}
            columnsStatus={columnsStatus}
            itemObjArr={itemObjArr}
            addToBooking={addToBooking}
          />
        </TabsContent>
        <TabsContent value="cards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: InventoryItem) => (
              <LinkCard
                key={item.id}
                // {...item}
                item={{ ...item }}
                itemObjArr={itemObjArr}
                setItemObjArr={addToBooking}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex items-center justify-end space-x-2 py-2">
        <PaginationControls
          pageCount={meta.pagination.pageCount}
          totalEntries={meta.pagination.total}
        />
      </div>
    </div>
  );
};

export default AddPermissionPageTabs;
