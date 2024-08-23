"use client";
import React, { useEffect } from "react";
import { useState } from "react";
// import PaginationControls from "@/components/custom/PaginationControls";
import { InventoryItemWithImage } from "@/data/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
import TabHeader from "./TabHeader";
import BookingInventoryTable from "./BookingInventoryTable";
import { CirclePlus, Grid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StrapiImage } from "@/components/custom/StrapiImage";
import PaginationControls from "@/components/custom/PaginationControls";

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

interface ViewTabsProps {
  data: any[];
  // meta: { pagination: { pageCount: number; total: number } };
  totalEntries: number;
  filter: {};
  itemObjArr: InventoryItemWithImage[];
  addToBooking: Function;
}

function LinkCard({
  item,
  itemObjArr,
  setItemObjArr,
}: {
  item: Readonly<InventoryItemWithImage>;
  itemObjArr: Readonly<InventoryItemWithImage>[];
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
        <div className="relative h-40 w-40 items-center overflow-hidden rounded-md">
          <StrapiImage
            className="h-full w-full rounded-lg object-contain"
            src={item.image?.url ?? null}
            height={50}
            width={50}
          />
        </div>
        <CardTitle className="text-md w-full leading-7 text-pink-500">
          {(item.model ?? "") || "Model Blank"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="w-full text-sm leading-6">
          {item.make}
          <CirclePlus className="ml-2 h-5 w-5 content-end" />
        </p>
      </CardContent>
    </Card>
  );
}

const BookingAddItemPageTabs = ({
  data,
  // meta,
  totalEntries,
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
            {data.map((item: InventoryItemWithImage) => (
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
        <PaginationControls totalEntries={totalEntries} />
      </div>
    </div>
  );
};

export default BookingAddItemPageTabs;
