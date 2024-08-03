"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import { InventoryItem, InventoryReportType } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import CheckoutSessionsTable from "./InventoryReportsTable";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  inventoryReportsColumnsDefault,
  TableColumnStatus,
} from "./inventoryReportsColumns";
import InventoryReportsTable from "./InventoryReportsTable";

interface ViewTabsProps {
  data: any[];
  meta: { pagination: { pageCount: number; total: number } };
  filter: {};
}

function LinkCard(report: Readonly<InventoryReportType>) {
  return (
    <Link href={`/dashboard/checkout/${report.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {new Date(report.createdAt ?? "").toLocaleString() || "Report Time"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {`${report.creator?.firstName} ${report.creator?.lastName}` ||
              "User Name Unknown"}
          </p>
          <p className="mb-4 w-full leading-5">
            {report.isFinished ? (
              <Badge variant="secondary">Finished</Badge>
            ) : (
              <Badge variant="default">In Progress</Badge>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const InventoryReportsPageTabs = ({ data, meta, filter }: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(inventoryReportsColumnsDefault),
  );

  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Inventory Reports</h1>
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
        />
        <TabsContent value="list">
          <InventoryReportsTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
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

export default InventoryReportsPageTabs;
