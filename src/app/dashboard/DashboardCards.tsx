import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Barcode,
  BookPlus,
  ClipboardPlus,
  Vault,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookingWithUserAndItems,
  CheckoutWithUserAndItems,
} from "@/data/definitions";
import { format } from "date-fns";

const DashboardCards = ({
  userRole,
  upcomingBookings,
  upcomingBookingsNum,
  checkoutUnfinished,
  checkoutUnfinishedNum,
  inventorySizeTagged,
  inventoryReportsInADay,
}: {
  userRole: string;
  upcomingBookings: BookingWithUserAndItems[];
  upcomingBookingsNum: number;
  checkoutUnfinished: CheckoutWithUserAndItems[];
  checkoutUnfinishedNum: number;
  inventorySizeTagged: number;
  inventoryReportsInADay: number;
}) => {
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {userRole !== "InventoryManager" ? (
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <BookPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingBookingsNum ?? "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {/* +20.1% from last month */}
                  upcoming appointments
                </p>
              </CardContent>
            </Card>
          ) : (
            ``
          )}
          {userRole === "Admin" || userRole === "Monitor" ? (
            <>
              <Card x-chunk="dashboard-01-chunk-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Checkouts
                  </CardTitle>
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {checkoutUnfinishedNum ?? "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    unfinished sessions
                  </p>
                </CardContent>
              </Card>
              <Card x-chunk="dashboard-01-chunk-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inventory
                  </CardTitle>
                  <Vault className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventorySizeTagged}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    tagged items in stock
                  </p>
                </CardContent>
              </Card>
              <Card x-chunk="dashboard-01-chunk-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inventory Reports
                  </CardTitle>
                  <ClipboardPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {`+${inventoryReportsInADay}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    in the last 24 hours
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            ``
          )}
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          {userRole !== "InventoryManager" ? (
            <Card x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Bookings</CardTitle>
                  <CardDescription>
                    Upcoming bookings in the system
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/dashboard/booking">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="userName">User</TableHead>
                      <TableHead className="hidden xl:table-column" key="type">
                        Type
                      </TableHead>
                      <TableHead
                        className="hidden xl:table-column"
                        key="status"
                      >
                        Status
                      </TableHead>
                      <TableHead
                        className="hidden md:table-cell lg:hidden xl:table-column"
                        key="location"
                      >
                        Use Location
                      </TableHead>
                      <TableHead className="text-right" key="startTime">
                        Start Time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingBookings?.length
                      ? upcomingBookings.slice(0, 6).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell key="userName">
                              <div className="font-medium">
                                {`${booking.user?.first_name} ${booking.user?.last_name}`}
                              </div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                {booking.user?.net_id}
                              </div>
                            </TableCell>
                            <TableCell
                              className="hidden xl:table-column"
                              key="type"
                            >
                              Sale
                            </TableCell>
                            <TableCell
                              className="hidden xl:table-column"
                              key="status"
                            >
                              <Badge className="text-xs" variant="outline">
                                Approved
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="hidden md:table-cell lg:hidden xl:table-column"
                              key="location"
                            >
                              {booking.use_location}
                            </TableCell>
                            <TableCell className="text-right" key="startTime">
                              {format(
                                new Date(booking.start_time ?? ""),
                                "MM/dd/yyyy hh:mm a",
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      : ``}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            ``
          )}
          {userRole === "Admin" || userRole === "Monitor" ? (
            <Card x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Checkout Sessions</CardTitle>
                  <CardDescription>
                    Unfinished sessions in the system
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/dashboard/checkout">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="userName">User</TableHead>
                      <TableHead className="hidden xl:table-column" key="type">
                        Type
                      </TableHead>
                      <TableHead
                        className="hidden xl:table-column"
                        key="status"
                      >
                        Status
                      </TableHead>
                      <TableHead
                        className="hidden md:table-cell lg:hidden xl:table-column"
                        key="location"
                      >
                        Studio
                      </TableHead>
                      <TableHead className="text-right" key="creationTime">
                        Started At
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkoutUnfinished?.length
                      ? checkoutUnfinished.slice(0, 6).map((checkout) => (
                          <TableRow key={checkout.id}>
                            <TableCell key="userName">
                              <div className="font-medium">
                                {`${checkout.user?.first_name} ${checkout.user?.last_name}`}
                              </div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                {checkout.user?.stu_id}
                              </div>
                            </TableCell>
                            <TableCell
                              className="hidden xl:table-column"
                              key="type"
                            >
                              Sale
                            </TableCell>
                            <TableCell
                              className="hidden xl:table-column"
                              key="status"
                            >
                              <Badge className="text-xs" variant="outline">
                                Approved
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="hidden md:table-cell lg:hidden xl:table-column"
                              key="location"
                            >
                              {checkout.studio}
                            </TableCell>
                            <TableCell
                              className="text-right"
                              key="creationTime"
                            >
                              {format(
                                new Date(checkout.created_at ?? ""),
                                "MM/dd/yyyy hh:mm a",
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      : ``}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            ``
          )}
        </div>
      </main>
    </>
  );
};

export default DashboardCards;
