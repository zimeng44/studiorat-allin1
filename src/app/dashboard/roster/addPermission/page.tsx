
import { getInventoryItems, getItemsByQuery } from "@/data/loaders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AddPermissionForm from "./AddPermissionForm";

interface ParamsProps {
  searchParams: {
    bookingId: string;
    itemId: string;
    page: string;
    pageSize: string;
    sort: string;
    mTechBarcode: string;
    make: string;
    model: string;
    category: string;
    description: string;
    accessories: string;
    storageLocation: string;
    comments: string;
    out: string;
    broken: string;
    query: string;
  };
}

const BookingAddItemPage = async ({ searchParams }: Readonly<ParamsProps>) => {
  const pageIndex = searchParams?.page ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "";

  const filter = {
    mTechBarcode: searchParams?.mTechBarcode ?? "",
    make: searchParams?.make ?? "",
    model: searchParams?.model ?? "",
    category: searchParams?.category ?? "",
    description: searchParams?.description ?? "",
    accessories: searchParams?.accessories ?? "",
    storageLocation: searchParams?.storageLocation ?? "All",
    comments: searchParams?.comments ?? "",
    out: searchParams?.out === "true" ? true : false,
    broken: searchParams?.broken === "true" ? true : false,
  };

  const { data, meta } = searchParams?.query
    ? await getItemsByQuery(
        searchParams?.query,
        pageIndex.toString(),
        pageSize.toString(),
      )
    : await getInventoryItems(
        sort,
        pageIndex.toString(),
        pageSize.toString(),
        filter,
      );

  // const dataStr = cookies().get(`tempBooking${searchParams.bookingId}`);
  // const bookingData = dataStr ? JSON.parse(dataStr.value) : undefined;

  if (!data) return <div>Booking Not Found.</div>;
  // if (!bookingData) return <div>Booking Not Found.</div>;

  // console.log(searchParams.bookingId);

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
            <BreadcrumbLink href="/dashboard/booking">Booking</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center md:px-2">
        <AddPermissionForm
          bookingId={searchParams.bookingId}
          // bookingData={bookingData}
          inventoryData={data}
          inventoryMeta={meta}
          filter={filter}
        />
      </div>
    </div>
  );
};

export default BookingAddItemPage;
