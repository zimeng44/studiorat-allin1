"use client";
import { getCookies, setCookie, deleteCookie, getCookie } from "cookies-next";
import { useParams, usePathname, useRouter } from "next/navigation";
import BookingEmbededTable from "../../BookingEmbededTable";
import { inventoryColumns } from "@/data/inventoryColumns";
import { BookingType, InventoryItem } from "@/data/definitions";
// import InventoryTable from "@/components/custom/InventoryTable";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingInventoryTable from "./BookingInventoryTable";
import BookingAddItemPageTabs from "./BookingAddItemPageTabs";
import BookingAddItemEmbededTable from "./BookingAddItemEmbededTable";
import Link from "next/link";
import { ArrowLeftToLine } from "lucide-react";

const config = {
  maxAge: 60 * 60, // 1 hour
  path: "/",
  domain: process.env.HOST ?? "localhost",
  // httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const BookingAddItemForm = ({
  // /
  // bookingData,
  inventoryData,
  inventoryMeta,
  filter,
}: {
  // / string;
  // bookingData: BookingType;
  inventoryData: InventoryItem[];
  inventoryMeta: { pagination: { pageCount: number; total: number } };
  filter: {};
}) => {
  const router = useRouter();

  // if (typeof window !== "undefined") {
  const temp2 = localStorage.getItem(`tempNewBooking`) ?? undefined;
  const bookingData2 = temp2 ? JSON.parse(temp2) : "";
  // console.log(bookingData2);
  // }
  if (!bookingData2) return <div>Booking Info Lost.</div>;

  const [itemObjArr, setItemObjArr] = useState(
    bookingData2?.inventory_items ?? Array(),
  );
  // console.lo;
  if (!bookingData2?.inventory_items) return <div>No Inventory Item</div>;

  // const bookingItems = bookingData.inventory_items;
  // console.log(bookingData.inventory_items);
  const handleBackToBooking = () => {
    // setCookie(
    //   `tempNewBookingItems`,
    //   JSON.stringify(itemObjArr),
    //   config,
    // );
    // deleteCookie(`tempNewBooking`);

    localStorage.setItem(
      `tempNewBookingItems`,
      JSON.stringify(itemObjArr),
    );
    // localStorage.removeItem(`tempNewBooking`);

    router.push(`/dashboard/booking/new`);
    router.refresh();
  };

  return (
    <div>
      <div className="py-3">
        <Button
          className="hover:bg-slate-200 active:bg-slate-300"
          variant={"secondary"}
          type="button"
          onClick={(e) => {
            handleBackToBooking();
          }}
        >
          <ArrowLeftToLine className="h-4 w-4" />
          Back to Booking
        </Button>
      </div>
      <p className="mb-2 font-bold">Added Items</p>
      <BookingAddItemEmbededTable
        data={itemObjArr}
        columns={inventoryColumns}
        itemObjArr={itemObjArr}
        setItemObjArr={setItemObjArr}
      />
      {/* <p className="py-5 font-bold">Available Items</p> */}
      <BookingAddItemPageTabs
        data={inventoryData}
        meta={inventoryMeta}
        filter={filter}
        itemObjArr={itemObjArr}
        addToBooking={setItemObjArr}
      />
    </div>
  );
};

export default BookingAddItemForm;
