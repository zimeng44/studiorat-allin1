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

// const INITIAL_STATE = {
//   creationTime: `${new Date().toLocaleString()}`,
//   stuIDCheckout: "",
//   stuIDCheckin: "",
//   studio: "",
//   otherLocation: "",
//   creationMonitor: "",
//   finishMonitor: "",
//   finishTime: "",
//   notes: "",
//   finished: false,
// };

const NewCheckoutSession = async () => {
  // const { value: authToken } = cookies().get("jwt");
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser.role.name !== "Admin" && thisUser.role.name !== "Monitor") {
    return <p>User Access Forbidden</p>;
  }

  const jwtCookie = cookies().get("jwt");

  if (jwtCookie) {
    const { value: authToken } = jwtCookie;
    // You can now use authToken safely here
    // console.log(authToken);
  } else {
    // Handle the case where the cookie is not found
    console.error("JWT cookie not found");
  }
  // console.log(thisMonitor);

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
            <BreadcrumbLink href="/dashboard/checkout">Checkout</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">New Checkout</h1>
      <div className="flex items-center px-4">
        <NewCheckoutForm
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
};

export default NewCheckoutSession;
