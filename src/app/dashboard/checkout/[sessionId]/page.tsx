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
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";

interface ParamsProps {
  params: {
    sessionId: string;
  };
}

export default async function SingleCheckoutSessionDetails({
  params,
}: Readonly<ParamsProps>) {
  // console.log(params);
  // const { value: authToken } = cookies().get("jwt");
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const data = await getCheckoutSessionById(params.sessionId);

  if (!data) return <p>No data</p>;

  const jwtCookie = cookies().get("jwt");

  if (jwtCookie) {
    const { value: authToken } = jwtCookie;
    // You can now use authToken safely here
    // console.log(authToken);
  } else {
    // Handle the case where the cookie is not found
    console.error("JWT cookie not found");
  }

  // console.log("checkout session by ID \n", data);

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
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center px-1 py-2 text-lg font-bold md:px-2">
        <h1 className="py-2 text-lg font-bold">Edit Checkout</h1>
        {data?.finished ? (
          <Badge className="size-fit" variant="secondary">
            Finished
          </Badge>
        ) : (
          <Badge className="size-fit" variant="default">
            Ongoing
          </Badge>
        )}
      </div>
      <div className="flex items-center md:px-2">
        <EditCheckoutSessionForm
          session={data}
          sessionId={params.sessionId}
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
