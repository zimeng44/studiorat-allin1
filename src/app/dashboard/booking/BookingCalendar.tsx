import React, { Fragment, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Calendar, Views, DateLocalizer } from "react-big-calendar";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import {
  addDays,
  startOfDay,
  addHours,
  compareDesc,
  compareAsc,
  startOfMonth,
  subMonths,
  endOfMonth,
} from "date-fns";
import "!style-loader!css-loader!react-big-calendar/lib/css/react-big-calendar.css";
import { BookingWithUserAndItems } from "@/data/definitions";
import { useRouter, useSearchParams } from "next/navigation";
// import Loading from "./loading";
import { Loader2 } from "lucide-react";

// const mLocalizer = momentLocalizer(moment);

// const ColoredDateCellWrapper = ({ children }) =>
//   React.cloneElement(React.Children.only(children), {
//     style: {
//       backgroundColor: "lightblue",
//     },
//   });

export default function BookingCalendar({
  localizer,
  authToken,
  firstLoadData,
}: {
  localizer: any;
  authToken: string;
  firstLoadData: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageView = searchParams.get("view") ?? "calendar";

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [myEvents, setEvents] = useState(firstLoadData);
  const [isLoading, setIsLoading] = useState(false);

  const onNavigate = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      setIsLoading(true);
      // window.alert(newDate);
      getDateData(newDate).then(({ data, error }) => {
        setIsLoading(false);
        // console.log("Date is ###############", data);
        setEvents(
          data.map((booking: BookingWithUserAndItems) => {
            return {
              id: booking.id,
              title: `${booking.user?.first_name} ${booking.user?.last_name}`,
              start: new Date(booking?.start_time ?? ``),
              end: new Date(booking?.end_time ?? ``),
            };
          }),
        );
      });
    },
    [setDate],
  );
  const onView = useCallback((newView: any) => setView(newView), [setView]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (compareAsc(addDays(new Date(), 1), start) > 0) {
        window.alert("No booking allowed within 24 hours or in the past.");
        return;
      }

      const eightAM = addHours(startOfDay(start), 8);
      const elevenPM = addHours(startOfDay(start), 23);
      if (
        compareAsc(eightAM, start) === 1 ||
        compareDesc(elevenPM, start) !== -1
      ) {
        // window.alert("Our office hours are 8AM to 11PM");
        start = addHours(startOfDay(start), 12);
        // console.log(compareAsc(eightAM, start));
        // return;
      }
      const confirm = window.confirm("Creating a new booking?");

      if (confirm)
        router.push(
          `/dashboard/booking/new?start_time=${start.toISOString()}&view=${pageView}`,
        );
    },
    [setEvents],
  );

  const handleSelectEvent = useCallback(
    (event: any) =>
      router.push(`/dashboard/booking/${event.id}?view=${pageView}`),
    [],
  );

  const { defaultDate, scrollToTime, views } = useMemo(
    () => ({
      // defaultDate: new Date(2015, 3, 12),
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
      views: {
        month: true,
        week: true,
        day: true,
      },
    }),
    [],
  );

  const baseUrl = getStrapiURL();

  async function fetchData(url: string) {
    const headers = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };

    try {
      const response = await fetch(url, authToken ? headers : {});
      const data = await response.json();
      // console.log(data);
      return flattenAttributes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  const getDateData = useCallback(
    async (newDate: Date) => {
      // const start = startOfDay(subDays(startOfWeek(newDate), 7)).toISOString();
      // const end = startOfDay(addDays(endOfWeek(newDate), 1)).toISOString();
      const start = startOfDay(
        subMonths(startOfMonth(newDate), 1),
      ).toISOString();
      const end = startOfDay(addDays(endOfMonth(newDate), 1)).toISOString();

      // console.log(subMonths(startOfMonth(newDate),1));

      const query = qs.stringify({
        // populate: ["user"],
        // sort: ["createdAt:desc"],
        // filters: {
        // $and: [{ startTime: { $gte: start } }, { startTime: { $lt: end } }],
        // },
        start: start,
        end: end,
      });
      const url = new URL("/api/bookings", baseUrl);
      url.search = query;
      return fetchData(url.href);
    },
    [date],
  );

  return (
    <Fragment>
      <div className="rbc-calendar p-1">
        <Calendar
          date={date}
          onNavigate={onNavigate}
          onView={onView}
          view={view}
          views={views}
          defaultDate={defaultDate}
          // defaultView={Views.WEEK}
          events={myEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
        />
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ``}
      </div>
    </Fragment>
  );
}

BookingCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
