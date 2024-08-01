// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import React, { Suspense } from "react";
import { getInventoryItems, getItemsByQuery } from "@/data/loaders";
import InventoryPageTabs from "./InventoryPageTabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import Loading from "@/app/loading";

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
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser.role.name !== "Admin" &&
    thisUser.role.name !== "InventoryManager"
  ) {
    return <p>User Access Forbidden</p>;
  }

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
    <div className="p-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Master Inventory</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<h1>Loading . . .</h1>}>
        <InventoryPageTabs data={data} meta={meta} filter={filter} />
      </Suspense>
    </div>
  );
}
