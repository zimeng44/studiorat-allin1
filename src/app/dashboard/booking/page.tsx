import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBookings, getBookingsByQuery } from "@/data/loaders";
import BookingPageTabs from "./BookingPageTabs";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    startTimeFrom?: string;
    startTimeTo?: string;
    endTimeFrom?: string;
    endTimeTo?: string;
    user?: string;
    type?: string;
    useLocation?: string;
    bookingCreator?: string;
    notes?: string;
  };
}

export default async function CheckoutSessions({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "startTime:desc";

  // console.log(sort);

  const filter = {
    startTime: {
      from: searchParams?.startTimeFrom ?? undefined,
      to: searchParams?.startTimeTo ?? undefined,
    },
    endTime: {
      from: searchParams?.endTimeFrom ?? undefined,
      to: searchParams?.endTimeTo ?? undefined,
    },
    user: searchParams?.user ?? "",
    useLocation: searchParams?.useLocation ?? "",
    bookingCreator: searchParams?.bookingCreator ?? "",
    type: searchParams?.type ?? "",
    notes: searchParams?.notes ?? "",
  };

  // console.log(filter);

  const { data, meta } = searchParams?.query
    ? await getBookingsByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getBookings(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // console.log(data);

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
            <BreadcrumbPage>Booking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BookingPageTabs data={data} meta={meta} filter={filter} />
    </div>
  );
}
