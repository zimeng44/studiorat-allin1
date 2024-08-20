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
// import {
//   BookingType,
//   BookingWithUserAndItems,
//   UserWithRole,
// } from "@/data/definitions";
// import { bookings } from "@prisma/client";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    pageIndex?: number;
    pageSize?: number;
    sort?: string;
    filterOpen?: boolean;
    start_timeFrom?: string;
    start_timeTo?: string;
    end_timeFrom?: string;
    end_timeTo?: string;
    user?: string;
    type?: string;
    use_location?: string;
    bookingCreator?: string;
    notes?: string;
  };
}

export default async function BookingPage({
  searchParams,
}: Readonly<SearchParamsProps>) {
  const pageIndex = searchParams?.pageIndex ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "start_time:desc";
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);

  const filter = {
    start_time: {
      from: searchParams?.start_timeFrom
        ? new Date(searchParams?.start_timeFrom)
        : null,
      to: searchParams?.start_timeTo
        ? new Date(searchParams?.start_timeTo)
        : null,
    },
    end_time: {
      from: searchParams?.end_timeFrom
        ? new Date(searchParams?.end_timeFrom)
        : null,
      to: searchParams?.end_timeTo ? new Date(searchParams?.end_timeTo) : null,
    },
    // user: searchParams?.user ?? "",
    use_location: searchParams?.use_location ?? null,
    // bookingCreator: searchParams?.bookingCreator ?? "",
    type: searchParams?.type ?? null,
    // notes: searchParams?.notes ?? "",
  };

  // console.log(filter);

  const { data, count } = searchParams?.query
    ? await getBookingsByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
        thisUser,
      )
    : await getBookings(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
        thisUser,
      );

  const calendarFirstLoadData = await getBookingByDateWeek(
    new Date(),
    thisUser,
  );

  const calendarLoadEvents = calendarFirstLoadData.map((booking: any) => {
    return {
      id: booking.id,
      title: `${booking.user?.first_name} ${booking.user?.last_name}`,
      start: new Date(booking?.start_time ?? ``),
      end: new Date(booking?.end_time ?? ``),
    };
  });

  // const { value: authToken } = cookies().get("jwt");

  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) {
    console.error("JWT cookie not found");
    return <p>You're not authorized.</p>;
  }
  // Handle the case where the cookie is not found

  // console.log(data);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Booking data</p>;

  // console.log("filter is ", filter);

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
            <BreadcrumbPage>Booking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BookingPageTabs
        data={data}
        totalEntries={count}
        filter={filter}
        authToken={jwtCookie?.value ?? ""}
        calendarFirstLoadData={calendarLoadEvents}
      />
    </div>
  );
}
