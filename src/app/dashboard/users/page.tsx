// import dynamic from "next/dynamic";

// const InventoryTable = dynamic(() => import("./InventoryTable"), {
//   ssr: false,
// });
import React, { Suspense } from "react";
import { getUsers, getUsersByQuery } from "@/data/loaders";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

import UsersPageTabs from "./UsersPageTabs";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    username?: string;
    stuId?: string;
    fullName?: string;
    academicLevel?: string;
    email?: string;
    bio?: string;
    blocked?: string;
    role?: string;
  };
}

export default async function Users({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser.role.name !== "Admin" && thisUser.role.name !== "Monitor") {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "createdAt:desc";

  const filter = {
    username: searchParams?.username ?? "",
    stuId: searchParams?.stuId ?? "",
    fullName: searchParams?.fullName ?? "",
    academicLevel: searchParams?.academicLevel ?? "",
    email: searchParams?.email ?? "",
    bio: searchParams?.bio ?? "",
    blocked: searchParams?.blocked === "true",
    role: searchParams?.role ?? "",
  };

  // console.log(filter.broken);

  const data = searchParams?.query
    ? await getUsersByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getUsers(sort, pageIndex.toString(), pageSize.toString(), filter);

  const meta = { pagination: { pageCount: 1, total: data.length } };
  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No User data</p>;

  // console.log(data);

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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<h1>Loading . . .</h1>}>
        <UsersPageTabs
          data={data}
          meta={meta}
          filter={filter}
          currentUserRole={thisUser.role?.name ?? ""}
        />
      </Suspense>
    </div>
  );
}
