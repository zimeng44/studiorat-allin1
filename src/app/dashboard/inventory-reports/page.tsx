import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getInventoryReports,
  getInventoryReportsByQuery,
} from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import InventoryReportsPageTabs from "./InventoryReportsPageTabs";
import { redirect } from "next/navigation";
import { count } from "console";

type SearchParamsProps = Promise<{
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  filterOpen?: boolean;
  // createdFrom?: string;
  // createdTo?: string;
  // notes?: string;
  is_finished?: string;
  // itemChecked?: string;
  // creator?: string;
}>;

export default async function InventoryReportsPage({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser?.user_role.name === "Monitor") redirect("/dashboard/checkout");

  if (thisUser?.user_role.name !== "Admin") {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = (await searchParams)?.page ?? "1";
  const pageSize = (await searchParams)?.pageSize ?? "10";
  const sort = (await searchParams)?.sort ?? "created_at:desc";

  // console.log(sort);

  const filter = {
    // createdAt: {
    //   from: (await searchParams)?.createdFrom ?? undefined,
    //   to: (await searchParams)?.createdTo ?? undefined,
    // },
    // itemChecked: (await searchParams)?.itemChecked ?? "",
    // notes: (await searchParams)?.notes ?? "",
    is_finished: (await searchParams)?.is_finished ?? "All",
    // creator: (await searchParams)?.creator ?? "",
  };

  // console.log(filter);

  const { data, count } = (await searchParams)?.query
    ? await getInventoryReportsByQuery(
        sort,
        (await searchParams)?.query ?? "",
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getInventoryReports(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // console.log(data[0].itemsChecked);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Inventory Reports data</p>;

  // console.log("filter is ", filter);

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
            <BreadcrumbPage>Inventory Reports</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <InventoryReportsPageTabs
        data={data}
        totalEntries={count}
        filter={filter}
      />
    </div>
  );
}
