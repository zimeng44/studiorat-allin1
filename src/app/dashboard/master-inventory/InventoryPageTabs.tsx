"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import { InventoryItem } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { inventoryColumnsDefault } from "@/data/inventoryColumns";
import InventoryTable from "@/components/custom/InventoryTable";
import TabHeader from "./TabHeader";

interface ViewTabsProps {
  data: any[];
  meta: {};
  filter: {};
}

function LinkCard(item: Readonly<InventoryItem>) {
  return (
    <Link href={`/dashboard/master-inventory/${item.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {item.make + " " + item.model || "Brand Model"}
            {/* {item.model || "Model"} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full leading-7">
            {item.description.slice(0, 50) + "... [read more]"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const InventoryPageTabs = ({ data, meta, filter }: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState(
    structuredClone(inventoryColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Master Inventory</h1>
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
          <InventoryTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="icon">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: InventoryItem) => (
              <LinkCard key={item.id} {...item} />
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

export default InventoryPageTabs;
