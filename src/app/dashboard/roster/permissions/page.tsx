// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import React, { Suspense } from "react";
import {
  getRosterPermissions,
  getRosterPermissionsByQuery,
  getRosters,
  getRostersByQuery,
} from "@/data/loaders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
// import RosterPageTabs from "./RosterPermissionsPageTabs";
import RosterPermissionsPageTabs from "./RosterPermissionsPageTabs";
// import Loading from "@/app/loading";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    pageIndex?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    permission_code?: string;
    permission_title?: string;
    instructor?: string;
    permitted_studios?: string;
  };
}

export default async function RosterPermissionPage({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser!.user_role.name !== "Admin" &&
    thisUser!.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.pageIndex ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "created_at:desc";

  const filter = {
    permission_code: searchParams?.permission_code ?? null,
    permission_title: searchParams?.permission_title ?? null,
    instructor: searchParams?.instructor ?? null,
    permitted_studios: searchParams?.permitted_studios ?? null,
  };

  // console.log(filter.broken);

  const { data, count } = searchParams?.query
    ? await getRosterPermissionsByQuery(
        sort,
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getRosterPermissions(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Inventory data</p>;

  // console.log(data);

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
            <BreadcrumbLink href="/dashboard/roster">Roster</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Roster Permissions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<h1>Loading . . .</h1>}>
        <RosterPermissionsPageTabs
          data={data}
          // meta={meta}
          totalEntries={count}
          filter={filter}
          userRole={thisUser?.user_role.name}
        />
      </Suspense>
    </div>
  );
}
