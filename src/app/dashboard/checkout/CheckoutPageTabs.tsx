"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import {
  CheckoutSessionType,
  CheckoutWithUserAndItems,
  InventoryItem,
} from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkoutColumnsDefault, TableColumnStatus } from "./checkoutColumns";
import CheckoutSessionsTable from "./CheckoutSessionsTable";
import TabHeader from "./TabHeader";
import { Grid, HomeIcon, List } from "lucide-react";
import { format } from "date-fns";
import { checkout_sessions } from "@prisma/client";

interface ViewTabsProps {
  data: any[];
  totalEntries: number;
  // meta: { pagination: { pageCount: number; total: number } };
  filter: {};
  studioData: CheckoutWithUserAndItems[];
}

function LinkCard(session: Readonly<CheckoutWithUserAndItems>) {
  return (
    <Link href={`/dashboard/checkout/${session.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {`${session.user?.first_name} ${session.user?.last_name}` ||
              "User Name Unknown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {session.studio || "Studio Unknow"}
          </p>
          <p className="mb-4 w-full leading-5">
            {`${session.created_at ? format(new Date(session.created_at), "MM/dd/yyyy hh:mm a") : "Time Unknown"}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StudioCard(session: Readonly<CheckoutWithUserAndItems>) {
  return (
    <Link href={`/dashboard/checkout/${session.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {session.studio || "Studio Unknow"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {`${session.user?.first_name} ${session.user?.last_name}` ||
              "User Name Unknown"}
          </p>
          <p className="mb-4 w-full leading-5">
            {`${session.created_at ? format(new Date(session.created_at), "MM/dd/yyyy hh:mm a") : "Time Unknown"}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const CheckoutPageTabs = ({
  data,
  // meta,
  totalEntries,
  filter,
  studioData,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(checkoutColumnsDefault),
  );

  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Checkout Sessions</h1>
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
              <TabsTrigger value="studio">
                <HomeIcon className="mr-1 h-4 w-4" />
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
          <CheckoutSessionsTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: CheckoutWithUserAndItems) => (
              <LinkCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="studio">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {studioData.map((item) => (
              <StudioCard key={item.id} {...item} />
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

export default CheckoutPageTabs;
