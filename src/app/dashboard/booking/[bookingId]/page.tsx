// import EditItemForm from "@/components/forms/EditItemForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBookingById } from "@/data/loaders";
import EditBookingForm from "./EditBookingForm";
import { cookies } from "next/headers";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

type ParamsProps = Promise<{
  bookingId: string;
}>;

export default async function BookingDetails({
  params,
}: {
  params: ParamsProps;
}) {
  const { ok, data: currentUser } = await getUserMeLoader();

  if (!ok) {
    return <p>Authorization Error</p>;
  }

  const jwtCookie = (await cookies()).get("jwt");

  if (!jwtCookie) {
    console.error("JWT cookie not found");
    return <p>JWT token not found</p>;
  }

  const { data } = await getBookingById((await params).bookingId, currentUser);

  if (!data) {
    return <p>No Booking Found</p>;
  }

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
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 pt-2 text-lg font-bold md:px-2">Edit Booking</h1>
      <div className="flex items-center md:px-2">
        <EditBookingForm
          booking={data}
          bookingId={(await params).bookingId}
          currentUser={currentUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
