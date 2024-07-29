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

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    creationTimeFrom?: string;
    creationTimeTo?: string;
    finishTimeFrom?: string;
    finishTimeTo?: string;
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
  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "creationTime:desc";

  // console.log(sort);

  const filter = {
    creationTime: {
      from: searchParams?.creationTimeFrom ?? undefined,
      to: searchParams?.creationTimeTo ?? undefined,
    },
    finishTime: {
      from: searchParams?.finishTimeFrom ?? undefined,
      to: searchParams?.finishTimeTo ?? undefined,
    },
    stuIDCheckout: searchParams?.stuIDCheckout ?? "",
    stuIDCheckin: searchParams?.stuIDCheckin ?? "",
    studio: searchParams?.studio ?? "",
    otherLocation: searchParams?.otherLocation ?? "",
    creationMonitor: searchParams?.creationMonitor ?? "",
    finishMonitor: searchParams?.finishMonitor ?? "",
    notes: searchParams?.notes ?? "",
    finished: searchParams?.finished ?? "All",
    userName: searchParams?.userName ?? "",
  };

  // console.log(filter);

  const { data, meta } = searchParams?.query
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

  // console.log(data[0]);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Checkout Sessions data</p>;

  // console.log("filter is ", filter);

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
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CheckoutPageTabs data={data} meta={meta} filter={filter} />
    </div>
  );
}
