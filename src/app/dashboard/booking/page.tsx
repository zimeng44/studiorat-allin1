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

type SearchParamsProps = Promise<{
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
}>;

export default async function BookingPage({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const pageIndex = (await searchParams)?.pageIndex ?? "1";
  const pageSize = (await searchParams)?.pageSize ?? "10";
  const sort = (await searchParams)?.sort ?? "start_time:desc";
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);

  const filter = {
    start_time: {
      from: (await searchParams)?.start_timeFrom
        ? new Date((await searchParams)?.start_timeFrom ?? "")
        : null,
      to: (await searchParams)?.start_timeTo
        ? new Date((await searchParams)?.start_timeTo ?? "")
        : null,
    },
    end_time: {
      from: (await searchParams)?.end_timeFrom
        ? new Date((await searchParams)?.end_timeFrom ?? "")
        : null,
      to: (await searchParams)?.end_timeTo
        ? new Date((await searchParams)?.end_timeTo ?? "")
        : null,
    },
    // user: (await searchParams)?.user ?? "",
    use_location: (await searchParams)?.use_location ?? null,
    // bookingCreator: (await searchParams)?.bookingCreator ?? "",
    type: (await searchParams)?.type ?? null,
    // notes: (await searchParams)?.notes ?? "",
  };

  // console.log(filter);

  const { data, count } = (await searchParams)?.query
    ? await getBookingsByQuery(
        (await searchParams)?.query ?? "",
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

  const jwtCookie = (await cookies()).get("jwt");

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
