import BookingAddItemForm from "./BookingAddItemForm";
import { getInventoryItems, getItemsByQuery } from "@/data/loaders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ParamsProps {
  searchParams: {
    bookingId: string;
    itemId: string;
    pageIndex: string;
    pageSize: string;
    sort: string;
    m_tech_barcode: string;
    make: string;
    model: string;
    category: string;
    description: string;
    accessories: string;
    storage_location: string;
    comments: string;
    out: string;
    broken: string;
    query: string;
  };
}

const BookingAddItemPage = async ({ searchParams }: Readonly<ParamsProps>) => {
  const pageIndex = searchParams?.pageIndex ?? "1";
  const pageSize = searchParams?.pageSize ?? "10";
  const sort = searchParams?.sort ?? "make:asc";

  const filter = {
    // mTechBarcode: searchParams?.mTechBarcode ?? "",
    // make: searchParams?.make ?? "",
    // model: searchParams?.model ?? "",
    // category: searchParams?.category ?? "",
    // description: searchParams?.description ?? "",
    // accessories: searchParams?.accessories ?? "",
    storage_location: searchParams?.storage_location ?? "Floor 8",
    // comments: searchParams?.comments ?? "",
    // out: searchParams?.out === "true" ? true : false,
    // broken: searchParams?.broken === "true" ? true : false,
    broken: "false",
  };

  const { data, count } = searchParams?.query
    ? await getItemsByQuery(
        sort,
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
        <BookingAddItemForm
          bookingId={searchParams.bookingId}
          // bookingData={bookingData}
          totalEntries={count}
          inventoryData={data}
          // inventoryMeta={meta}
          filter={filter}
        />
      </div>
    </div>
  );
};

export default BookingAddItemPage;
