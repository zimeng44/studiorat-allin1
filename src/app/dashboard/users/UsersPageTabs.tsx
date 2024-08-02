"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import { InventoryItem, UserType } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TableColumnStatus, userColumnsDefault } from "./userColumns";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import UserTable from "./UserTable";

// interface TableFieldStatus {
//   header: string;
//   visible: boolean;
// }
// interface TableColumnStatus {
//   username: TableFieldStatus;
//   stuId: TableFieldStatus;
//   fullName: TableFieldStatus;
//   academicLevel: TableFieldStatus;
//   email: TableFieldStatus;
//   bio: TableFieldStatus;
//   blocked: TableFieldStatus;
// }

interface ViewTabsProps {
  data: any[];
  meta: { pagination: { pageCount: number; total: number } };
  filter: {};
}

function LinkCard(user: Readonly<UserType>) {
  return (
    <Link href={`/dashboard/master-inventory/${user.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {user.firstName + " " + user.lastName || "Brand Model"}
            {/* {item.model || "Model"} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full leading-7">{user.username}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

const UsersPageTabs = ({ data, meta, filter }: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(userColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Users</h1>
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
          <UserTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((user: UserType) => (
              <LinkCard key={user.id} {...user} />
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

export default UsersPageTabs;
