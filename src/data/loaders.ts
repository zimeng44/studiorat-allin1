import qs from "qs";
import { getAuthToken } from "./services/get-token";
// import { unstable_noStore as noStore } from "next/cache";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { boolean } from "zod";
import {
  CheckoutSessionType,
  InventoryItem,
  UserType,
} from "@/data/definitions";
import { addDays, endOfWeek, startOfDay, startOfWeek, subDays } from "date-fns";

interface InventoryFilterProps {
  mTechBarcode: string;
  make: string;
  model: string;
  category: string;
  description: string;
  accessories: string;
  storageLocation: string;
  comments: string;
  out: boolean;
  broken: boolean;
}

interface CheckoutSessionsFilterProps {
  id?: number;
  createdFrom?: string;
  createdTo?: string;
  finishedFrom?: string;
  finishedTo?: string;
  stuIDCheckout?: string;
  stuIDCheckin?: string;
  studio?: string;
  otherLocation?: string;
  creationMonitor?: string;
  finishMonitor?: string;
  finished?: string;
  notes?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

interface BookingsFilterProps {
  id?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  endTimeFrom?: string;
  endTimeTo?: string;
  user?: string;
  useLocation?: string;
  type?: string;
  bookingCreator?: string;
  notes?: string;
  // inventory_items?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

const baseUrl = getStrapiURL();

async function fetchData(url: string) {
  const authToken = await getAuthToken();
  // we will implement this later getAuthToken() later
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

export async function getHomePageData() {
  // noStore();

  // throw new Error("Test error");

  const url = new URL("/api/home-page", baseUrl);

  url.search = qs.stringify({
    populate: {
      blocks: {
        populate: {
          image: {
            fields: ["url", "alternativeText"],
          },
          link: {
            populate: true,
          },
          feature: {
            populate: true,
          },
        },
      },
    },
  });

  return await fetchData(url.href);
}

export async function getGlobalPageData() {
  // noStore();
  const url = new URL("/api/global", baseUrl);

  url.search = qs.stringify({
    populate: [
      "header.logoText",
      "header.ctaButton",
      "footer.logoText",
      "footer.socialLink",
    ],
  });

  return await fetchData(url.href);
}

export async function getGlobalPageMetadata() {
  // noStore();
  const url = new URL("/api/global", baseUrl);
  url.search = qs.stringify({
    fields: ["title", "description"],
  });
  return await fetchData(url.href);
}

export async function getSummaries(queryString: string) {
  const query = qs.stringify({
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { title: { $containsi: queryString } },
        { summary: { $containsi: queryString } },
      ],
    },
  });
  const url = new URL("/api/summaries", baseUrl);
  url.search = query;
  return fetchData(url.href);
}

export async function getSummaryById(summaryId: string) {
  return fetchData(`${baseUrl}/api/summaries/${summaryId}`);
}

export async function getInventoryItems(
  sort: string,
  page: string,
  pageSize: string,
  filter: InventoryFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === "" || value === false || value === "false") continue;
    if (key === "storageLocation" && value === "All") continue;

    if (value === true || value === "true") {
      filterArr.push({ [key]: { $eq: value } });
    } else {
      filterArr.push({ [key]: { $containsi: value } });
    }
  }

  // console.log(filterArr);

  const query = qs.stringify({
    sort: [sort],
    filters: {
      $and: filterArr,
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/inventory-items", baseUrl);
  url.search = query;
  // console.log(url.href);
  return fetchData(url.href);
}

export async function getInventoryItemById(itemId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  return fetchData(`${baseUrl}/api/inventory-items/${itemId}`);
}

export async function getItemsByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { mTechBarcode: { $containsi: queryString } },
        { make: { $containsi: queryString } },
        { model: { $containsi: queryString } },
        { category: { $containsi: queryString } },
        { description: { $containsi: queryString } },
        { accessories: { $containsi: queryString } },
        { storageLocation: { $containsi: queryString } },
        { comments: { $containsi: queryString } },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/inventory-items", baseUrl);
  url.search = query;
  return fetchData(url.href);
}

export async function getCheckoutSessions(
  sort: string,
  page: string,
  pageSize: string,
  filter: CheckoutSessionsFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || value === "") continue;

    if (key === "creationTime" || key === "finishTime") {
      if (value.from === undefined && value.to === undefined) {
        continue;
      } else if (value.to === undefined) {
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (value.from === undefined) {
        filterArr.push({
          [key]: {
            $lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      } else {
        // console.log(new Date(value.to).toISOString());
        // console.log("Value to is ", value.to);
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        filterArr.push({
          [key]: {
            $lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      }
    }

    if (value === "finished") {
      filterArr.push({ [key]: { $eq: true } });
      continue;
    } else if (value === "unfinished") {
      filterArr.push({ [key]: { $eq: false } });
      continue;
    }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { $eq: value } });
    } else {
      filterArr.push({ [key]: { $containsi: value } });
    }
  }

  const query = qs.stringify({
    populate: "*",
    sort: [sort],
    filters: {
      $and: filterArr,
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/checkout-sessions", baseUrl);
  url.search = query;
  // console.log(url.href);

  return fetchData(url.href);
}

export async function getCheckoutSessionById(itemId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  return fetchData(`${baseUrl}/api/checkout-sessions/${itemId}?populate=*`);
}

export async function getCheckoutSessionsByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    populate: "*",
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { stuIDCheckout: { $containsi: queryString } },
        { stuIDCheckin: { $containsi: queryString } },
        { studio: { $containsi: queryString } },
        { otherLocation: { $containsi: queryString } },
        { creationMonitor: { $containsi: queryString } },
        { finishMonitor: { $containsi: queryString } },
        { notes: { $containsi: queryString } },
        {
          user: {
            $or: [
              { firstName: { $containsi: queryString } },
              { lastName: { $containsi: queryString } },
              { stuId: { $containsi: queryString } },
              { email: { $containsi: queryString } },
            ],
          },
        },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/checkout-sessions", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}

export async function getBookings(
  sort: string,
  page: string,
  pageSize: string,
  filter: BookingsFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || value === "") continue;

    if (key === "starTime" || key === "endTime") {
      if (value.from === undefined && value.to === undefined) {
        continue;
      } else if (value.to === undefined) {
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (value.from === undefined) {
        filterArr.push({
          [key]: {
            $lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      } else {
        // console.log(new Date(value.to).toISOString());
        // console.log("Value to is ", value.to);
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        filterArr.push({
          [key]: {
            $lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      }
    }

    // if (value === "finished") {
    //   filterArr.push({ [key]: { $eq: true } });
    //   continue;
    // } else if (value === "unfinished") {
    //   filterArr.push({ [key]: { $eq: false } });
    //   continue;
    // }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { $eq: value } });
    } else {
      filterArr.push({ [key]: { $containsi: value } });
    }
  }

  const query = qs.stringify({
    populate: "*",
    sort: [sort],
    filters: {
      $and: filterArr,
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/bookings", baseUrl);
  url.search = query;
  // console.log(url.href);
  // console.log(url.href);
  return fetchData(url.href);
}

export async function getBookingById(bookingId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  return fetchData(`${baseUrl}/api/bookings/${bookingId}?populate=*`);
}

export async function getBookingsByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    populate: "*",
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { type: { $containsi: queryString } },
        { useLocation: { $containsi: queryString } },
        { notes: { $containsi: queryString } },
        { useLocation: { $containsi: queryString } },
        {
          user: {
            $or: [
              { firstName: { $containsi: queryString } },
              { lastName: { $containsi: queryString } },
              { stuId: { $containsi: queryString } },
              { email: { $containsi: queryString } },
            ],
          },
        },

        {
          bookingCreator: {
            $or: [
              { firstName: { $containsi: queryString } },
              { lastName: { $containsi: queryString } },
              { stuId: { $containsi: queryString } },
              { email: { $containsi: queryString } },
            ],
          },
        },
        {
          inventory_items: {
            $or: [
              { mTechBarcode: { $containsi: queryString } },
              { make: { $containsi: queryString } },
              { model: { $containsi: queryString } },
              { category: { $containsi: queryString } },
              { description: { $containsi: queryString } },
              { accessories: { $containsi: queryString } },
              { storageLocation: { $containsi: queryString } },
              { comments: { $containsi: queryString } },
            ],
          },
        },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/bookings", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}

export async function getBookingByDateWeek(newDate: Date) {
  const start = startOfDay(subDays(startOfWeek(newDate), 7)).toISOString();
  const end = startOfDay(addDays(endOfWeek(newDate), 1)).toISOString();

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
}

// export async function getStudioUserByStuId(stuId: string) {
//   const query = qs.stringify({
//     sort: ["createdAt:desc"],
//     filters: {
//       $or: [{ stuIDCheckout: { $containsi: stuId } }],
//     },
//   });
//   const url = new URL("/api/checkout-sessions", baseUrl);
//   url.search = query;
//   // console.log("query data", query)
//   return fetchData(url.href);
// }
