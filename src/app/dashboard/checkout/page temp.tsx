// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import InventoryTable from "@/components/custom/InventoryTable";
import PaginationControls from "@/components/custom/PaginationControls";
import React from "react";

import { CheckoutSessionType, InventoryItem } from "@/data/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getInventoryItems, getItemsByQuery } from "@/data/loaders";
import { inventoryColumns } from "@/data/inventoryColumns";

function LinkCard(session: Readonly<CheckoutSessionType>) {
  return (
    <Link href={`/dashboard/master-inventory/${session.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {session.studio || "Studio"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full leading-7">
            {session.studioUser[0].lastName || "User Name"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    userName?: string;
    monitorName?: string;
    finished?: string;
  };
}

export default async function MasterInventory({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "";

  const filter = {
    userName: searchParams?.userName ?? "",
    monitorName: searchParams?.monitorName ?? "",
    finished: searchParams?.finished ?? "All",
  };

  // console.log(filter.broken);

  const { data, meta } = searchParams?.query
    ? await getItemsByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getInventoryItems(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Inventory data</p>;

  // console.log(meta);

  return (
    <div className="container mx-auto py-5">
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

        <TabsContent value="list">
          <InventoryTable
            data={data}
            filter={filter}
            columns={inventoryColumns}
          />
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
}
