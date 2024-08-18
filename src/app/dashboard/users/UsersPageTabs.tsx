"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";

import { UserType, UserWithRole } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TableColumnStatus, userColumnsDefault } from "./userColumns";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import UserTable from "./UserTable";

interface ViewTabsProps {
  data: UserWithRole[];
  // meta: { pagination: { pageCount: number; total: number } };
  totalEntries: number;
  filter: {};
  currentUserRole: string;
}

function LinkCard(user: Readonly<UserWithRole>) {
  return (
    <Link href={`/dashboard/users/${user.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {user.first_name + " " + user.last_name || "User Name Missing"}
            {/* {item.model || "Model"} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full leading-7">{user.academic_level}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

const UsersPageTabs = ({
  data,
  totalEntries,
  filter,
  currentUserRole,
}: ViewTabsProps) => {
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
          currentUserRole={currentUserRole}
        />

        <TabsContent value="list">
          <UserTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((user: UserWithRole) => (
              <LinkCard key={user.id} {...user} />
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

export default UsersPageTabs;
