"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import {
  InventoryItem,
  InventoryReportType,
  InventoryReportWithCreatorAndItems,
} from "@/data/definitions";

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
import { format } from "date-fns";

interface ViewTabsProps {
  data: InventoryReportWithCreatorAndItems[];
  totalEntries: number;
  // meta: { pagination: { pageCount: number; total: number } };
  filter: {};
}

function LinkCard(report: Readonly<InventoryReportWithCreatorAndItems>) {
  return (
    <Link href={`/dashboard/checkout/${report.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {format(new Date(report.created_at ?? ""), "MM/dd/yyyy hh:mm a") ||
              "Report Time"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {`${report.created_by?.first_name} ${report.created_by?.last_name}` ||
              "User Name Unknown"}
          </p>
          <p className="mb-4 w-full leading-5">
            {report.is_finished ? (
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

const InventoryReportsPageTabs = ({
  data,
  totalEntries,
  filter,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(inventoryReportsColumnsDefault),
  );
  // console.log(data);
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
            {data.map((item: InventoryReportWithCreatorAndItems) => (
              <LinkCard key={item.id} {...item} />
            ))}
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

export default InventoryReportsPageTabs;
