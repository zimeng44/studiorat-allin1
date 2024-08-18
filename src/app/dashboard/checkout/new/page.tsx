// import React from "react";
import { cookies } from "next/headers";
import NewCheckoutForm from "./NewCheckoutForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

const NewCheckoutSession = async () => {
  // const { value: authToken } = cookies().get("jwt");
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");
  // console.log(thisMonitor);

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
            <BreadcrumbLink href="/dashboard/checkout">Checkout</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-1 py-4 text-lg font-bold md:px-2">New Checkout</h1>
      <div className="flex items-center md:px-2">
        <NewCheckoutForm
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
};

export default NewCheckoutSession;
