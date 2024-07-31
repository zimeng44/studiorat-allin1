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
import { BookingType } from "@/data/definitions";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { add, addDays, addHours, startOfDay } from "date-fns";

// const INITIAL_STATE = {
//   startTime: "",
//   endTime: "",
//   useLocation: "",
//   type: "",
//   createMonitor: "",
//   notes: "",
// };
interface SearchParamsProps {
  searchParams?: {
    startTime?: string;
    // query?: string;
    // page?: number;
    // pageSize?: number;
    // sort?: string;
    // filterOpen?: boolean;
    // creationTimeFrom?: string;
    // creationTimeTo?: string;
    // finishTimeFrom?: string;
    // finishTimeTo?: string;
    // stuIDCheckout?: string;
    // stuIDCheckin?: string;
    // studio?: string;
    // otherLocation?: string;
    // creationMonitor?: string;
    // finishMonitor?: string;
    // notes?: string;
    // finished?: string;
    // userName?: string;
  };
}

const NewBooking = async ({ searchParams }: Readonly<SearchParamsProps>) => {
  // console.log(await getUserMeLoader());
  const { data: thisUser } = await getUserMeLoader();

  const data: BookingType = {
    user: thisUser.role.name === "Authenticated" ? thisUser : undefined,
    bookingCreator: thisUser,
    startTime: searchParams?.startTime
      ? new Date(searchParams?.startTime)
      : addHours(startOfDay(addDays(new Date(), 1)), 12),
  };

  // console.log(data);
  // const { value: authToken } = cookies().get("jwt");
  // console.log(authToken);
  const jwtCookie = cookies().get("jwt");

  if (jwtCookie) {
    const { value: authToken } = jwtCookie;
    // You can now use authToken safely here
    // console.log(authToken);
  } else {
    // Handle the case where the cookie is not found
    console.error("JWT cookie not found");
  }

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
            <BreadcrumbLink href="/dashboard/booking">Booking</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">New Booking</h1>
      <div className="flex items-center px-2">
        <NewBookingForm booking={data} authToken={jwtCookie?.value ?? ""} />
      </div>
    </div>
  );
};

export default NewBooking;
