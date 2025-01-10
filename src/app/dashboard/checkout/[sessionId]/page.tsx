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

type ParamsProps = Promise<{
  sessionId: string;
}>;

export default async function SingleCheckoutSessionDetails({
  params,
}: {
  params: ParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();

  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const data = await getCheckoutSessionById((await params).sessionId);

  if (!data) return <p>No data</p>;

  const jwtCookie = (await cookies()).get("jwt");

  if (jwtCookie) {
    const { value: authToken } = jwtCookie;
  } else {
    // Handle the case where the cookie is not found
    console.error("JWT cookie not found");
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
            <BreadcrumbLink href="/dashboard/checkout">Checkout</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center space-x-1 px-1 py-2 text-lg font-bold md:px-2">
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
          sessionId={(await params).sessionId}
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
