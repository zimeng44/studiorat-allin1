// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import React, { Suspense } from "react";
import { getRosters, getRostersByQuery } from "@/data/loaders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import RosterPageTabs from "./RosterPageTabs";
// import Loading from "@/app/loading";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    pageIndex?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    stu_n?: string;
    net_id?: string;
    stu_name?: string;
    academic_level?: string;
    academic_program?: string;
    agreement?: string;
  };
}

export default async function RosterPage({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.pageIndex ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "created_at:desc";

  const filter = {
    stu_n: searchParams?.stu_n ?? null,
    net_id: searchParams?.net_id ?? null,
    stu_name: searchParams?.stu_name ?? null,
    academic_level: searchParams?.academic_level ?? null,
    academic_program: searchParams?.academic_program ?? null,
  };

  // console.log(filter.broken);

  const { data, count } = searchParams?.query
    ? await getRostersByQuery(
        sort,
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getRosters(sort, pageIndex.toString(), pageSize.toString(), filter);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Inventory data</p>;

  // console.log(searchParams?.query);

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
            <BreadcrumbPage>Roster</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<h1>Loading . . .</h1>}>
        <RosterPageTabs
          data={data}
          totalEntries={count}
          filter={filter}
          userRole={thisUser.user_role.name}
        />
      </Suspense>
    </div>
  );
}
