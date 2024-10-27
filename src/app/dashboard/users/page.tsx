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

type SearchParamsProps = Promise<{
  query?: string;
  pageIndex?: number;
  pageSize?: number;
  sort?: string;
  filterOpen?: boolean;
  username?: string;
  stu_id?: string;
  fullName?: string;
  academic_level?: string;
  email?: string;
  bio?: string;
  blocked?: string;
  user_role?: string;
}>;

export default async function Users({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = (await searchParams)?.pageIndex ?? "1";
  const pageSize = (await searchParams)?.pageSize ?? "10";
  const sort = (await searchParams)?.sort ?? "created_at:desc";

  const filter = {
    username: (await searchParams)?.username ?? null,
    stu_id: (await searchParams)?.stu_id ?? null,
    fullName: (await searchParams)?.fullName ?? null,
    academic_level: (await searchParams)?.academic_level ?? null,
    email: (await searchParams)?.email ?? null,
    bio: (await searchParams)?.bio ?? null,
    blocked: (await searchParams)?.blocked === "true",
    user_role: (await searchParams)?.user_role ?? null,
  };

  // console.log(filter.broken);

  const { data, count } = (await searchParams)?.query
    ? await getUsersByQuery(
        (await searchParams)?.query ?? "",
        pageIndex.toString(),
        pageSize.toString(),
        thisUser,
      )
    : await getUsers(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
        thisUser,
      );

  // const meta = { pagination: { pageCount: 1, total: data.length } };
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
          // meta={meta}
          totalEntries={count}
          filter={filter}
          currentUserRole={thisUser.user_role?.name ?? ""}
        />
      </Suspense>
    </div>
  );
}
