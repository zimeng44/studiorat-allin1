// import React from "react";
import { cookies } from "next/headers";
import NewBookingForm from "./NewBookingForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { addDays, addHours, startOfDay } from "date-fns";

type SearchParamsProps = Promise<{
  start_time?: string;
}>;

const NewBooking = async ({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) => {
  // console.log(searchParams);
  const { data: currentUser } = await getUserMeLoader();

  const data = {
    user: currentUser?.user_role.name === "Authenticated" ? currentUser : null,
    start_time: (await searchParams)?.start_time
      ? new Date((await searchParams).start_time ?? "")
      : addHours(startOfDay(addDays(new Date(), 1)), 12),
  };

  const jwtCookie = (await cookies()).get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");

  return (
    <div className="flex-col p-0 md:p-5">
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
            <BreadcrumbLink href="/dashboard/booking">Booking</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-1 py-4 text-lg font-bold md:px-2">New Booking</h1>
      <div className="flex items-center md:px-2">
        <NewBookingForm
          booking={data}
          currentUser={currentUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
};

export default NewBooking;
