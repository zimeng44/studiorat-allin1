import React, {
  Fragment,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import {
  format,
  addDays,
  endOfDay,
  subDays,
  startOfDay,
  endOfWeek,
  lastDayOfWeek,
} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingType } from "@/data/definitions";
import { useRouter } from "next/navigation";

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
}) {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [myEvents, setEvents] = useState(firstLoadData);

  const onNavigate = useCallback(
    (newDate) => {
      setDate(newDate);
      // window.alert(newDate);
      getDateData(newDate).then(({ data, meta }) =>
        setEvents(
          data.map((booking: BookingType) => {
            return {
              id: booking.id,
              title: `${booking.user?.firstName} ${booking.user?.lastName}`,
              start: new Date(booking?.startTime ?? ``),
              end: new Date(booking?.endTime ?? ``),
            };
          }),
        ),
      );
    },
    [setDate],
  );
  const onView = useCallback((newView) => setView(newView), [setView]);

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt("New Event name");
      if (title) {
        setEvents((prev) => [...prev, { start, end, title }]);
      }
    },
    [setEvents],
  );

  const handleSelectEvent = useCallback(
    (event) => router.push(`/dashboard/booking/${event.id}`),
    [],
  );

  const { defaultDate, scrollToTime, views } = useMemo(
    () => ({
      // defaultDate: new Date(2015, 3, 12),
      defaultDate: new Date(),
      // scrollToTime: new Date(1970, 1, 1, 6),
      views: {
        month: false,
        week: true,
        day: true,
      },
    }),
    [],
  );

  const baseUrl = getStrapiURL();

  async function fetchData(url: string) {
    // const authToken = getAuthToken();
    // const authToken = process.env.NEXT_PUBLIC_API_TOKEN;
    // console.log(authToken);
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
      const start = startOfDay(subDays(newDate, 7)).toISOString();
      const end = startOfDay(addDays(newDate, 7)).toISOString();

      // console.log(start.toLocaleString(), end.toLocaleString());

      const query = qs.stringify({
        populate: ["user"],
        sort: ["createdAt:desc"],
        filters: {
          $and: [{ startTime: { $gte: start } }, { startTime: { $lt: end } }],
        },
      });
      const url = new URL("/api/bookings", baseUrl);
      url.search = query;
      return fetchData(url.href);
    },
    [date],
  );

  return (
    <Fragment>
      <div className="height600">
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
      </div>
    </Fragment>
  );
}

BookingCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
