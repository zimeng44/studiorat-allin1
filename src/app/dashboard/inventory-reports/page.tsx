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

interface SearchParamsProps {
  searchParams?: {
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
  };
}

export default async function InventoryReportsPage({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser?.user_role.name === "Monitor") redirect("/dashboard/checkout");

  if (thisUser?.user_role.name !== "Admin") {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "created_at:desc";

  // console.log(sort);

  const filter = {
    // createdAt: {
    //   from: searchParams?.createdFrom ?? undefined,
    //   to: searchParams?.createdTo ?? undefined,
    // },
    // itemChecked: searchParams?.itemChecked ?? "",
    // notes: searchParams?.notes ?? "",
    is_finished: searchParams?.is_finished ?? "All",
    // creator: searchParams?.creator ?? "",
  };

  // console.log(filter);

  const { data, count } = searchParams?.query
    ? await getInventoryReportsByQuery(
        sort,
        searchParams?.query,
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
