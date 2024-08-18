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
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRoute() {
  const { data: thisUser, ok } = await getUserMeLoader();

  if (!ok || !thisUser) redirect("/signin");

  // const thisUser = await auth();

  const pageIndex = "1";
  const pageSize = "20";

  const bookingsSort = "start_time:asc";
  const bookingFilter = {
    start_time: {
      from: new Date(),
      to: null,
    },
    end_time: {
      from: null,
      to: null,
    },
    use_location: null,
    type: null,
  };
  const { data: upcomingBookings, count: bookingMeta } = await getBookings(
    bookingsSort,
    pageIndex.toString(),
    pageSize.toString(),
    bookingFilter,
    thisUser,
  );

  const checkoutSort = "created_at:desc";
  const checkoutFilter = {
    finished: "unfinished",
  };
  const { data: checkoutUnfinished, count: checkoutMeta } =
    await getCheckoutSessions(
      checkoutSort,
      pageIndex.toString(),
      pageSize.toString(),
      checkoutFilter,
    );

  const inventorySort = "created_at:desc";
  const inventoryFilter = {
    m_tech_barcode: "MT",
  };
  const { data: inventoryItems, count: inventoryMeta } =
    await getInventoryItems(
      inventorySort,
      pageIndex.toString(),
      pageSize.toString(),
      inventoryFilter,
    );

  const inventoryReportsSort = "created_at:desc";
  const inventoryReportsFilter = {
    created_at: {
      from: subDays(new Date(), 1).toISOString(),
      to: new Date().toISOString(),
    },
  };
  const { data: inventoryReportsItems, count: inventoryReportsMeta } =
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
        userRole={thisUser?.user_role.name}
        upcomingBookings={upcomingBookings}
        upcomingBookingsNum={bookingMeta ?? 0}
        checkoutUnfinished={checkoutUnfinished}
        checkoutUnfinishedNum={checkoutMeta ?? 0}
        inventorySizeTagged={inventoryMeta}
        inventoryReportsInADay={
          inventoryReportsItems?.length ? inventoryReportsMeta : 0
        }
      />
      {/* <LogoutButton /> */}
    </div>
  );
}
