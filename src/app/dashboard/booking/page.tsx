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
  getBookingByDateWeek,
  getBookings,
  getBookingsByQuery,
} from "@/data/loaders";
import BookingPageTabs from "./BookingPageTabs";
import { cookies } from "next/headers";
import { BookingType } from "@/data/definitions";

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

  const { data: calendarFirstLoadData, meta: calendarFirstMeta } =
    await getBookingByDateWeek(new Date());

  const calendarLoadEvents = calendarFirstLoadData.map(
    (booking: BookingType) => {
      return {
        id: booking.id,
        title: `${booking.user?.firstName} ${booking.user?.lastName}`,
        start: new Date(booking?.startTime ?? ``),
        end: new Date(booking?.endTime ?? ``),
      };
    },
  );

  const { value: authToken } = cookies().get("jwt");
  // console.log(authToken);

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
      <BookingPageTabs
        data={data}
        meta={meta}
        filter={filter}
        authToken={authToken}
        calendarFirstLoadData={calendarLoadEvents}
      />
    </div>
  );
}
