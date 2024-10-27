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
// import Loading from "@/app/loading";

type SearchParamsProps = Promise<{
  query?: string;
  pageIndex?: number;
  pageSize?: number;
  sort?: string;
  filterOpen?: boolean;
  m_tech_barcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storage_location?: string;
  comments?: string;
  out?: string;
  broken?: string;
}>;

export default async function MasterInventory({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "InventoryManager"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = (await searchParams)?.pageIndex ?? "1";
  const pageSize = (await searchParams)?.pageSize ?? "10";
  const sort = (await searchParams)?.sort ?? "updated_at:desc";

  const filter = {
    m_tech_barcode: (await searchParams)?.m_tech_barcode ?? "",
    make: (await searchParams)?.make ?? "",
    model: (await searchParams)?.model ?? "",
    category: (await searchParams)?.category ?? "",
    description: (await searchParams)?.description ?? "",
    accessories: (await searchParams)?.accessories ?? "",
    storage_location: (await searchParams)?.storage_location ?? "All",
    comments: (await searchParams)?.comments ?? "",
    out: (await searchParams)?.out ?? "All",
    broken: (await searchParams)?.broken ?? "All",
  };

  // console.log(filter.broken);

  const { data, count } = (await searchParams)?.query
    ? await getItemsByQuery(
        sort,
        (await searchParams)?.query ?? "",
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
    <div className="p-2 md:p-5">
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
        <InventoryPageTabs
          data={data}
          totalEntries={count}
          filter={filter}
          userRole={thisUser.user_role.name}
        />
      </Suspense>
    </div>
  );
}
