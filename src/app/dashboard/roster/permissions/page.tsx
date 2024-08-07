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
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    permissionCode?: string;
    permissionTitle?: string;
    instructor?: string;
    permittedStudios?: string;
  };
}

export default async function RosterPermissionPage({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser.role.name !== "Admin" && thisUser.role.name !== "Monitor") {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "";

  const filter = {
    permissionCode: searchParams?.permissionCode ?? "",
    permissionTitle: searchParams?.permissionTitle ?? "",
    instructor: searchParams?.instructor ?? "",
    permittedStudios: searchParams?.permittedStudios ?? "",
  };

  // console.log(filter.broken);

  const { data, meta } = searchParams?.query
    ? await getRosterPermissionsByQuery(
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
          meta={meta}
          filter={filter}
          userRole={thisUser.role.name}
        />
      </Suspense>
    </div>
  );
}
