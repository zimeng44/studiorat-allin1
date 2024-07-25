"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { getCookies, setCookie, deleteCookie, getCookie } from "cookies-next";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prevPath, setPrevPath] = useState(pathname);
  const pathParams = useParams<{ bookingId: string }>();
  const [prevBookingId, setPrevBookingId] = useState(
    pathParams.bookingId ?? "",
  );

  useEffect(() => {
    // const url = `${pathname}?${searchParams}`;
    // console.log(url);
    // if (!pathname.includes("booking") && !pathname.includes("/additem")) {
    // }
    // const bookingId = pathParams.bookingId ?? "";

    if (prevPath !== pathname) {
      if (
        prevPath.includes(`booking/`) &&
        prevPath.includes(`/additem`) &&
        !pathname.includes(`booking/}`)
      ) {
        // window.alert("you quit adding item");
        // deleteCookie(`tempBooking${prevBookingId}`);
        localStorage.removeItem(`tempBooking${prevBookingId}`);
        // deleteCookie(`tempBookingItems${prevBookingId}`);
        // console.log(`tempBooking${prevBookingId}`);
      } else if (
        prevPath.includes("booking/") &&
        !prevPath.includes("/additem") &&
        !pathname.includes(`booking/`)
      ) {
        // window.alert("you quit editing booking");
        // deleteCookie(`tempBooking${prevBookingId}`);
        // deleteCookie(`tempBookingItems${prevBookingId}`);
        localStorage.removeItem(`tempBookingItems${prevBookingId}`);
        // console.log(`booking/${prevBookingId}/additem`);
      }
    }
    setPrevPath(pathname);
    setPrevBookingId(pathParams.bookingId ?? "");
    // You can now use the current URL
    // ...
  }, [pathname, searchParams]);

  return null;
}
