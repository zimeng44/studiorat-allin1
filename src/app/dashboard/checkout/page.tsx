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
  getCheckoutSessions,
  getCheckoutSessionsByQuery,
} from "@/data/loaders";
import CheckoutPageTabs from "./CheckoutPageTabs";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import {
  CheckoutWithUserAndItems,
  InventoryItem,
  studioList,
} from "@/data/definitions";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    pageIndex?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    creation_timeFrom?: string;
    creation_timeTo?: string;
    finish_timeFrom?: string;
    finish_timeTo?: string;
    stuIDCheckout?: string;
    stuIDCheckin?: string;
    studio?: string;
    otherLocation?: string;
    creationMonitor?: string;
    finishMonitor?: string;
    notes?: string;
    finished?: string;
    userName?: string;
  };
}

export default async function CheckoutSessions({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser?.user_role);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = searchParams?.pageIndex ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "creation_time:desc";

  // console.log(sort);

  const filter = {
    creation_time: {
      from: searchParams?.creation_timeFrom
        ? new Date(searchParams?.creation_timeFrom).toISOString()
        : null,
      to: searchParams?.creation_timeTo
        ? new Date(searchParams?.creation_timeTo).toISOString()
        : null,
    },
    finish_time: {
      from: searchParams?.finish_timeFrom
        ? new Date(searchParams?.finish_timeFrom).toISOString()
        : null,
      to: searchParams?.finish_timeTo
        ? new Date(searchParams?.finish_timeTo).toISOString()
        : null,
    },
    // stuIDCheckout: searchParams?.stuIDCheckout ?? "",
    // stuIDCheckin: searchParams?.stuIDCheckin ?? "",
    studio: searchParams?.studio ?? null,
    // otherLocation: searchParams?.otherLocation ?? "",
    // creationMonitor: searchParams?.creationMonitor ?? "",
    // finishMonitor: searchParams?.finishMonitor ?? "",
    // notes: searchParams?.notes ?? "",
    finished: searchParams?.finished ?? "All",
    // userName: searchParams?.userName ?? "",
  };

  // console.log(filter);

  const { data, count } = searchParams?.query
    ? await getCheckoutSessionsByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getCheckoutSessions(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // console.log(data);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Checkout Sessions data</p>;

  // console.log("filter is ", filter);
  const studioData: CheckoutWithUserAndItems[] = await Promise.all(
    studioList.map(
      async (studio: string): Promise<CheckoutWithUserAndItems> => {
        const { data, count } = await getCheckoutSessions(
          "creation_time:desc",
          "1",
          "10",
          {
            studio: studio,
          },
        );
        return data[0];
      },
    ),
  );

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
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CheckoutPageTabs
        data={data}
        // meta={meta}
        totalEntries={count}
        filter={filter}
        studioData={studioData}
      />
    </div>
  );
}
