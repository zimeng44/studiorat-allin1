import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import DashboardCards from "./DashboardCards";
import {
  getBookings,
  getCheckoutSessions,
  getInventoryItems,
  getInventoryReports,
} from "@/data/loaders";
import { subDays } from "date-fns";
import { redirect } from "next/navigation";

export default async function DashboardRoute() {
  // console.log("here");

  const { data: thisUser, ok, error } = await getUserMeLoader();

  // return <p>{thisUser?.first_name}</p>;

  if (error) {
    console.log("getUserMeLoader Error: ", error);
    // throw Error("getUserMeLoader Error: ", error);
    return <p>{`{error}`}</p>;
  }

  if (!ok || !thisUser) redirect("/signin");

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
  const { data: upcomingBookings, count: bookingCount } = await getBookings(
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
  const { data: checkoutUnfinished, count: checkoutCount } =
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
  const { data: inventoryItems, count: inventoryCount } =
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
  const { data: inventoryReportsItems, count: inventoryReportsCount } =
    await getInventoryReports(
      inventoryReportsSort,
      pageIndex.toString(),
      pageSize.toString(),
      inventoryReportsFilter,
    );

  return (
    <div className="flex h-full flex-col items-center justify-start bg-gray-100 dark:bg-gray-900">
      <DashboardCards
        userRole={thisUser?.user_role.name ?? "wrong"}
        upcomingBookings={upcomingBookings}
        upcomingBookingsNum={bookingCount ?? 0}
        checkoutUnfinished={checkoutUnfinished}
        checkoutUnfinishedNum={checkoutCount ?? 0}
        inventorySizeTagged={inventoryCount ?? 0}
        inventoryReportsInADay={
          inventoryReportsItems?.length ? inventoryReportsCount : 0
        }
      />
    </div>
  );
}
