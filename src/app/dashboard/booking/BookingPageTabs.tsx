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

interface ViewTabsProps {
  data: any[];
  meta: {};
  filter: {};
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

const BookingPageTabs = ({ data, meta, filter }: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState(
    structuredClone(bookingColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Bookings</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="icon">Icon</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <BookingTabHeader
          columnsStatus={columnsStatus}
          filter={filter}
          setColumnsStatus={setColumnsStatus}
        />

        <TabsContent value="list">
          <BookingsTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="icon">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((booking: BookingType) => (
              <LinkCard key={booking.id} {...booking} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end space-x-2 py-2">
        <PaginationControls
          pageCount={meta.pagination.pageCount}
          totalEntries={meta.pagination.total}
        />
      </div>
    </div>
  );
};

export default BookingPageTabs;
