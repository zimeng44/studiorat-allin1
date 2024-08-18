import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EditItemForm from "./EditItemForm";
import { getInventoryItemById } from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

interface ParamsProps {
  params: {
    itemId: string;
  };
}

export default async function EditItemRoute({ params }: Readonly<ParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "InventoryManager"
  ) {
    return <p>User Access Forbidden</p>;
  }
  // console.log(params);
  const { data, error } = await getInventoryItemById(params.itemId);

  if (error) {
    return <p>Error Fetching Data</p>;
  }

  if (!data) return <p>No data</p>;

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
            <BreadcrumbLink href="/dashboard/master-inventory">
              Master Inventory
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">Edit Item</h1>
      <div className="flex items-center md:px-2">
        <EditItemForm item={data} itemId={params.itemId} />
      </div>
    </div>
  );
}
