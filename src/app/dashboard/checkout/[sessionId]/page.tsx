// import EditItemForm from "@/components/forms/EditItemForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCheckoutSessionById } from "@/data/loaders";
import EditCheckoutSessionForm from "./EditCheckoutSessionForm";

interface ParamsProps {
  params: {
    sessionId: string;
  };
}

export default async function SingleCheckoutSessionDetails({
  params,
}: Readonly<ParamsProps>) {
  // console.log(params);
  const data = await getCheckoutSessionById(params.sessionId);

  // console.log("checkout session by ID \n", data);

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
            <BreadcrumbLink href="/dashboard/checkout">
              Checkout
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">Edit Checkout</h1>
      <div className="flex items-center px-2">
        <EditCheckoutSessionForm session={data} sessionId={params.sessionId} />
      </div>
    </div>
  );
}
