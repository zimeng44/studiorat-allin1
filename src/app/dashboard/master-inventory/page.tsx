// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import InventoryTable from "@/components/custom/InventoryTable";
import PaginationControls from "@/components/custom/PaginationControls";
import React from "react";

import { InventoryItem } from "@/app/lib/definitions";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getInventoryItems, getItemsByQuery } from "@/data/loaders";
import { inventoryColumns } from "@/data/inventoryColumns";

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

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    mTechBarcode?: string;
    make?: string;
    model?: string;
    category?: string;
    description?: string;
    accessories?: string;
    storageLocation?: string;
    comments?: string;
    out?: string;
    broken?: string;
  };
}

export default async function MasterInventory({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "";

  const filter = {
    mTechBarcode: searchParams?.mTechBarcode ?? "",
    make: searchParams?.make ?? "",
    model: searchParams?.model ?? "",
    category: searchParams?.category ?? "",
    description: searchParams?.description ?? "",
    accessories: searchParams?.accessories ?? "",
    storageLocation: searchParams?.storageLocation ?? "All",
    comments: searchParams?.comments ?? "",
    out: searchParams?.out === "true" ? true : false,
    broken: searchParams?.broken === "true" ? true : false,
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
          <InventoryTable data={data} filter={filter} columns={inventoryColumns} />
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
