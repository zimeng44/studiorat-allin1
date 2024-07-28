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
    if (prevPath !== pathname) {
      if (
        prevPath.includes(`booking/`) &&
        prevPath.includes(`/additem`) &&
        !pathname.includes(`booking/}`)
      ) {
        localStorage.removeItem(`tempBooking${prevBookingId}`);
        localStorage.removeItem(`tempNewBooking`);
      }
    }
    setPrevPath(pathname);
    setPrevBookingId(pathParams.bookingId ?? "");
  }, [pathname, searchParams]);

  return null;
}
