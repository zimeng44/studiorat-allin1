"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { InventoryItem } from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  inventoryColumnsDefault,
  TableColumnStatus,
} from "@/app/dashboard/master-inventory/inventoryColumns";
import InventoryTable from "./InventoryTable";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import { inventory_items } from "@prisma/client";

interface ViewTabsProps {
  data: any[];
  // meta: { pagination: { pageCount: number; total: number } };
  totalEntries: number;
  filter: {};
  userRole: string;
}

function LinkCard(item: Readonly<inventory_items>) {
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
          <p className="mb-4 w-full leading-7">{item.category}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

const InventoryPageTabs = ({
  data,
  totalEntries,
  filter,
  userRole,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(inventoryColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Master Inventory</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-1 h-4 w-4" />
                {/* List */}
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="mr-1 h-4 w-4" />
                {/* Grid */}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabHeader
          columnsStatus={columnsStatus}
          filter={filter}
          setColumnsStatus={setColumnsStatus}
          userRole={userRole}
        />

        <TabsContent value="list">
          <InventoryTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data[0] ? (
              data.map((item: inventory_items) => (
                <LinkCard key={item.id} {...item} />
              ))
            ) : (
              <p>No data</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end space-x-2 py-2">
        <PaginationControls
          // pageCount={meta.pagination.pageCount}
          totalEntries={totalEntries}
        />
      </div>
    </div>
  );
};

export default InventoryPageTabs;
