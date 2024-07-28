"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import { InventoryItem } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import { inventoryColumnsDefault } from "@/data/inventoryColumns";
import { inventoryColumnsDefault } from "../../bookingInventoryColumns";
import InventoryTable from "@/components/custom/InventoryTable";
import TabHeader from "./TabHeader";
import BookingInventoryTable from "./BookingInventoryTable";
import { CirclePlus } from "lucide-react";

interface ViewTabsProps {
  data: any[];
  meta: {};
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
        <p className="mb-4 w-full leading-7">
          {item.description.slice(0, 50) + "... [read more]"}
          <CirclePlus className="h-4 w-4 content-end" />
        </p>
      </CardContent>
    </Card>
  );
}

const BookingAddItemPageTabs = ({
  data,
  meta,
  filter,
  itemObjArr,
  addToBooking,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState(
    structuredClone(inventoryColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold"></h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="icon">Icon</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabHeader
          columnsStatus={columnsStatus}
          filter={filter}
          setColumnsStatus={setColumnsStatus}
        />
        <TabsContent value="list">
          <BookingInventoryTable
            data={data}
            columnsStatus={columnsStatus}
            itemObjArr={itemObjArr}
            addToBooking={addToBooking}
          />
        </TabsContent>
        <TabsContent value="icon">
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

export default BookingAddItemPageTabs;
