"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { BookingType, BookingWithUserAndItems } from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookingColumnsDefault } from "./bookingColumns";
import BookingTabHeader from "./BookingTabHeader";
import BookingsTable from "./BookingsTable";
import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import BookingCalendar from "./BookingCalendar";
import { CalendarDays, Grid, List, Square } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { BookingFilterFormProps } from "./BookingFilterForm";

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  start_time: TableFieldStatus;
  end_time: TableFieldStatus;
  user: TableFieldStatus;
  type: TableFieldStatus;
  use_location: TableFieldStatus;
  created_by: TableFieldStatus;
  notes: TableFieldStatus;
}

interface ViewTabsProps {
  data: any[];
  // meta: { pagination: { pageCount: number; total: number } };
  totalEntries: number;
  filter: BookingFilterFormProps;
  authToken: string;
  calendarFirstLoadData: any[];
}

function LinkCard(booking: Readonly<BookingWithUserAndItems>) {
  return (
    <Link href={`/dashboard/booking/${booking.id}?view=grid`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {`${booking.user?.first_name} ${booking.user?.last_name}` ||
              "User Name Unknown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {booking.use_location || "Studio Unknow"}
          </p>
          <p className="mb-4 w-full leading-5">
            {`${booking.start_time ? format(new Date(booking.start_time), "MM/dd/yyyy hh:mm a") : "Time Unknown"}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const BookingPageTabs = ({
  data,
  // meta,
  totalEntries,
  filter,
  authToken,
  calendarFirstLoadData,
}: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(bookingColumnsDefault),
  );

  const localizer = momentLocalizer(moment);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get("view") ?? "calendar";
  const params = new URLSearchParams(searchParams);
  const [defaultTab, setDefaultTab] = useState(view);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      // setDefaultTab(isMobile ? "grid" : "calendar");
      // if (view === "list") setDefaultTab(view);
      params.set("view", isMobile ? "grid" : view);
      setDefaultTab(isMobile ? "grid" : view);
      router.replace(`${pathname}?${params.toString()}`);
      // Default to 'list' on mobile, 'grid' on larger screens
    };

    handleResize(); // Set initial state
    // window.addEventListener("resize", handleResize); // Listen for window resize

    // return () => window.removeEventListener("resize", handleResize); // Clean up on unmount
  }, []);

  return (
    <div className="py-2">
      <Tabs
        value={view}
        onValueChange={(value) => {
          params.set("view", value);
          router.replace(`${pathname}?${params.toString()}`);
          setDefaultTab(value);
          // console.log(params.toString());
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Bookings</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list" className="hidden md:block">
                <List className=" h-4 w-4" />
                {/* List */}
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className=" h-4 w-4" />
                {/* Grid */}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="hidden md:block">
                <CalendarDays className="mr-1 h-4 w-4" />
                {/* Calendar */}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="calendar">
          <BookingCalendar
            localizer={localizer}
            authToken={authToken}
            firstLoadData={calendarFirstLoadData}
          />
        </TabsContent>
        <TabsContent value="list">
          <BookingTabHeader
            columnsStatus={columnsStatus}
            filter={filter}
            setColumnsStatus={setColumnsStatus}
            defaultTab={defaultTab}
          />
          <BookingsTable data={data} columnsStatus={columnsStatus} />
          <div className="flex items-center justify-end space-x-2 py-2">
            <PaginationControls
              // pageCount={meta.pagination.pageCount}
              totalEntries={totalEntries}
            />
          </div>
        </TabsContent>
        <TabsContent value="grid">
          <BookingTabHeader
            columnsStatus={columnsStatus}
            filter={filter}
            setColumnsStatus={setColumnsStatus}
            defaultTab={defaultTab}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((booking: BookingWithUserAndItems) => (
              <LinkCard key={booking.id} {...booking} />
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2 py-2">
            <PaginationControls
              // pageCount={meta.pagination.pageCount}
              totalEntries={totalEntries}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingPageTabs;
