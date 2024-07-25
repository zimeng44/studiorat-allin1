// import React from "react";
import NewCheckoutForm from "./NewCheckoutForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

const NewCheckoutSession = () => {
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
        <NewCheckoutForm />
      </div>
    </div>
  );
};

export default NewCheckoutSession;
