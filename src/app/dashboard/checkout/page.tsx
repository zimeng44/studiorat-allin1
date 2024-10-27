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

type SearchParamsProps = Promise<{
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
}>;

export default async function CheckoutSessions({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser?.user_role);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const pageIndex = (await searchParams)?.pageIndex ?? "1";
  const pageSize = (await searchParams)?.pageSize ?? "10";
  const sort = (await searchParams)?.sort ?? "creation_time:desc";

  // console.log(sort);

  const filter = {
    creation_time: {
      from: (await searchParams)?.creation_timeFrom
        ? new Date((await searchParams)?.creation_timeFrom ?? "").toISOString()
        : null,
      to: (await searchParams)?.creation_timeTo
        ? new Date((await searchParams)?.creation_timeTo ?? "").toISOString()
        : null,
    },
    finish_time: {
      from: (await searchParams)?.finish_timeFrom
        ? new Date((await searchParams)?.finish_timeFrom ?? "").toISOString()
        : null,
      to: (await searchParams)?.finish_timeTo
        ? new Date((await searchParams)?.finish_timeTo ?? "").toISOString()
        : null,
    },
    // stuIDCheckout: (await searchParams)?.stuIDCheckout ?? "",
    // stuIDCheckin: (await searchParams)?.stuIDCheckin ?? "",
    studio: (await searchParams)?.studio ?? null,
    // otherLocation: (await searchParams)?.otherLocation ?? "",
    // creationMonitor: (await searchParams)?.creationMonitor ?? "",
    // finishMonitor: (await searchParams)?.finishMonitor ?? "",
    // notes: (await searchParams)?.notes ?? "",
    finished: (await searchParams)?.finished ?? "All",
    // userName: (await searchParams)?.userName ?? "",
  };

  // console.log(filter);

  const { data, count } = (await searchParams)?.query
    ? await getCheckoutSessionsByQuery(
        (await searchParams)?.query ?? "",
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
