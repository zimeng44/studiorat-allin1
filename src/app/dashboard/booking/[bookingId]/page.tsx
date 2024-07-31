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
import { getCookie } from "cookies-next";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

interface ParamsProps {
  params: {
    bookingId: string;
  };
}

export default async function BookingDetails({
  params,
}: Readonly<ParamsProps>) {
  const data = await getBookingById(params.bookingId);
  const { data: currentUser } = await getUserMeLoader();
  // console.log(data);

  const jwtCookie = cookies().get("jwt");

  if (jwtCookie) {
    const { value: authToken } = jwtCookie;
    // You can now use authToken safely here
    // console.log(authToken);
  } else {
    // Handle the case where the cookie is not found
    console.error("JWT cookie not found");
  }
  // const temp = cookies().get(`tempBookingItems${params.bookingId}`) ?? "";
  // const tempItems = temp?.value ? JSON.parse(temp.value) : undefined;
  // console.log(data);

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
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">Edit Booking</h1>
      <div className="flex items-center px-2">
        <EditBookingForm
          booking={data}
          bookingId={params.bookingId}
          currentUser={currentUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
