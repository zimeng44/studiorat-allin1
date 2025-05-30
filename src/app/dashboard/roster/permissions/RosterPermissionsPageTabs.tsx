"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { RosterPermissionType } from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  rosterPermissionsColumnsDefault,
  TableColumnStatus,
} from "./rosterPermissionsColumns";
// import RosterTable from "./RosterTable";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import RosterTable from "./RosterPermissionsTable";
import RosterPermissionsTable from "./RosterPermissionsTable";

interface ViewTabsProps {
  data: any[];
  // meta: { pagination: { pageCount: number; total: number } };
  totalEntries: number;
  filter: {};
  userRole?: string;
}

function LinkCard(item: Readonly<RosterPermissionType>) {
  return (
    <Link href={`/dashboard/roster/permissions/${item.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="break-all leading-8 text-pink-500">
            {item.permission_title || "Title Missing"}
            {/* {item.model || "Model"} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full break-all leading-7">
            {item.instructor ?? ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const RosterPermissionsPageTabs = ({
  data,
  // meta,
  totalEntries,
  filter,
  userRole,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(rosterPermissionsColumnsDefault),
  );
  return (
    <div className="py-2">
      {/* <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Roster Permissions</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="mr-1 h-4 w-4" />
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
          <RosterPermissionsTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: RosterPermissionType) => (
              <LinkCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>
      </Tabs> */}

      <h1 className="left-content p-2 text-lg font-bold">Roster Permissions</h1>
      <TabHeader
        columnsStatus={columnsStatus}
        filter={filter}
        setColumnsStatus={setColumnsStatus}
        userRole={userRole ?? ""}
      />

      <RosterPermissionsTable
        data={data}
        columnsStatus={columnsStatus}
        userRole={userRole ?? ""}
      />

      <div className="flex items-center justify-end space-x-2 py-2">
        <PaginationControls
          // pageCount={meta.pagination.pageCount}
          totalEntries={totalEntries}
        />
      </div>
    </div>
  );
};

export default RosterPermissionsPageTabs;
