"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { BookingType } from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookingColumnsDefault } from "@/data/bookingColumns";
import BookingTabHeader from "./BookingTabHeader";
import BookingsTable from "./BookingsTable";
import Selectable from "./BookingCalendar";
import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import BookingCalendar from "./BookingCalendar";
import { addDays, endOfWeek, startOfDay, subDays } from "date-fns";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import { CalendarDays, Grid, List, Square } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TableFieldStatus {
  header: string;
  visible: boolean;
}
interface TableColumnStatus {
  startTime: TableFieldStatus;
  endTime: TableFieldStatus;
  user: TableFieldStatus;
  type: TableFieldStatus;
  useLocation: TableFieldStatus;
  bookingCreator: TableFieldStatus;
  notes: TableFieldStatus;
}

interface ViewTabsProps {
  data: any[];
  meta: { pagination: { pageCount: number; total: number } };
  filter: {};
  authToken: string;
  calendarFirstLoadData: any[];
}

function LinkCard(booking: Readonly<BookingType>) {
  return (
    <Link href={`/dashboard/booking/${booking.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-7 text-pink-500">
            {`${booking.user?.firstName} ${booking.user?.lastName}` ||
              "User Name Unknown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 w-full leading-5">
            {booking.useLocation || "Studio Unknow"}
          </p>
          <p className="mb-4 w-full leading-5">
            {`${booking.startTime ? new Date(booking.startTime).toLocaleString() : "Time Unknown"}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const BookingPageTabs = ({
  data,
  meta,
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

  return (
    <div className="py-2">
      <Tabs
        value={`${view}`}
        onValueChange={(value) => {
          params.set("view", value);
          router.replace(`${pathname}?${params.toString()}`);
          // console.log(value);
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Bookings</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-1 h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="mr-1 h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays className="mr-1 h-4 w-4" />
                Calendar
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
          />
          <BookingsTable data={data} columnsStatus={columnsStatus} />
          <div className="flex items-center justify-end space-x-2 py-2">
            <PaginationControls
              pageCount={meta.pagination.pageCount}
              totalEntries={meta.pagination.total}
            />
          </div>
        </TabsContent>
        <TabsContent value="grid">
          <BookingTabHeader
            columnsStatus={columnsStatus}
            filter={filter}
            setColumnsStatus={setColumnsStatus}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((booking: BookingType) => (
              <LinkCard key={booking.id} {...booking} />
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2 py-2">
            <PaginationControls
              pageCount={meta.pagination.pageCount}
              totalEntries={meta.pagination.total}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingPageTabs;
