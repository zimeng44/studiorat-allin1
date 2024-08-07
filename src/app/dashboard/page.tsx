import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import DashboardCards from "./DashboardCards";
import {
  getBookings,
  getCheckoutSessions,
  getInventoryItems,
  getInventoryReports,
} from "@/data/loaders";
import { finished } from "stream";
import { subDays } from "date-fns";

export default async function DashboardRoute() {
  const { data: thisUser } = await getUserMeLoader();

  const pageIndex = "1";
  const pageSize = "20";

  const bookingsSort = "startTime:asc";
  const bookingFilter = {
    startTime: {
      from: new Date().toISOString(),
      to: undefined,
    },
    endTime: {
      from: undefined,
      to: undefined,
    },
  };
  const { data: upcomingBookings, meta: bookingMeta } = await getBookings(
    bookingsSort,
    pageIndex.toString(),
    pageSize.toString(),
    bookingFilter,
  );

  const checkoutSort = "createdAt:desc";
  const checkoutFilter = {
    finished: "unfinished",
  };
  const { data: checkoutUnfinished, meta: checkoutMeta } =
    await getCheckoutSessions(
      checkoutSort,
      pageIndex.toString(),
      pageSize.toString(),
      checkoutFilter,
    );

  const inventorySort = "createdAt:desc";
  const inventoryFilter = {
    mTechBarcode: "MT",
  };
  const { data: inventoryItems, meta: inventoryMeta } = await getInventoryItems(
    inventorySort,
    pageIndex.toString(),
    pageSize.toString(),
    inventoryFilter,
  );

  const inventoryReportsSort = "createdAt:desc";
  const inventoryReportsFilter = {
    createdAt: {
      from: subDays(new Date(), 1).toISOString(),
      to: new Date().toISOString(),
    },
  };
  const { data: inventoryReportsItems, meta: inventoryReportsMeta } =
    await getInventoryReports(
      inventoryReportsSort,
      pageIndex.toString(),
      pageSize.toString(),
      inventoryReportsFilter,
    );

  // console.log(inventoryReportsFilter);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      {/* <h1>Dashboard</h1> */}
      <DashboardCards
        userRole={thisUser.role.name}
        upcomingBookings={upcomingBookings}
        upcomingBookingsNum={bookingMeta?.pagination?.total ?? 0}
        checkoutUnfinished={checkoutUnfinished}
        checkoutUnfinishedNum={checkoutMeta?.pagination?.total ?? 0}
        inventorySizeTagged={inventoryMeta.pagination.total}
        inventoryReportsInADay={
          inventoryReportsItems?.length
            ? inventoryReportsMeta.pagination.total
            : 0
        }
      />
      {/* <LogoutButton /> */}
    </div>
  );
}
