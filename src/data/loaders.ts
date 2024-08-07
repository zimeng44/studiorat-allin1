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
import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

interface InventoryFilterProps {
  mTechBarcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storageLocation?: string;
  comments?: string;
  out?: boolean;
  broken?: boolean;
}

interface CheckoutSessionsFilterProps {
  id?: number;
  creationTime?: { from?: string; to?: string };
  finishTime?: { from?: string; to?: string };
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
  startTime?: { from?: string; to?: string };
  // startTimeTo?: string;
  endTime?: { from?: string; to?: string };
  // endTimeTo?: string;
  user?: string;
  useLocation?: string;
  type?: string;
  bookingCreator?: string;
  notes?: string;
  // inventory_items?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}
interface UsersFilterProps {
  username?: string;
  stuId?: string;
  fullName?: string;
  academicLevel?: string;
  email?: string;
  bio?: string;
  blocked?: boolean;
}

interface InventoryReportsFilterProps {
  createdAt?: { from?: string; to?: string };
  creator?: string;
  itemChecked?: string;
  isFinished?: string;
  notes?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

interface RosterPermissionsFilterProps {
  permissionCode?: string;
  permissionTitle?: string;
  instructor?: string;
  permissionDetails?: string;
  permittedStudios?: string;
  startDate?: { from?: string; to?: string };
  endDate?: { from?: string; to?: string };
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

interface RosterRecordsFilterProps {
  stuN?: string;
  netId?: string;
  stuName?: string;
  academicLevel?: string;
  academicProgram?: string;
}

const baseUrl = getStrapiURL();
// console.log(baseUrl);

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

// ########################### Summaries ########################

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

// ########################### Inventory ########################

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

// ########################### Checkout ########################

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
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (!value.from) {
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
              { username: { $containsi: queryString } },
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
  const url = new URL("/api/checkout-sessions", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}

// ########################### Booking ########################

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

    if (key === "startTime" || key === "endTime") {
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (!value.from) {
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
      continue;
    } else {
      filterArr.push({ [key]: { $containsi: value } });
      continue;
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
  // console.log(filterArr);
  // console.log(url.href);
  return fetchData(url.href);
}

export async function getBookingById(bookingId: string) {
  // console.log(
  //   `${baseUrl}/api/bookings/${bookingId}?populate=[user][populate]=role`,
  // );
  const query = qs.stringify({
    populate: {
      user: { populate: "role" },
      bookingCreator: { populate: "*" },
      inventory_items: { populate: "*" },
    },
  });
  const url = new URL(`/api/bookings/${bookingId}`, baseUrl);
  url.search = query;

  // console.log(url.href);

  return fetchData(url.href);
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
              { username: { $containsi: queryString } },
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
  // const start = startOfDay(subDays(startOfWeek(newDate), 7)).toISOString();
  // const end = startOfDay(addDays(endOfWeek(newDate), 1)).toISOString();
  const start = startOfDay(subMonths(startOfMonth(newDate), 1)).toISOString();
  const end = startOfDay(addDays(endOfMonth(newDate), 1)).toISOString();

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

// ########################### Users ########################

export async function getUsers(
  sort: string,
  page: string,
  pageSize: string,
  filter: UsersFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === "" || value === false || value === "false") continue;

    if (key === "role") {
      filterArr.push({ [key]: { name: { $eq: value } } });
      continue;
    }

    if (key === "academicLevel") {
      filterArr.push({ [key]: { $eq: value } });
      continue;
    }

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
  const url = new URL("/api/users", baseUrl);
  url.search = query;
  // console.log(url.href);
  return fetchData(url.href);
}

export async function getUserById(userId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  return fetchData(`${baseUrl}/api/users/${userId}?populate=role`);
}

export async function getUsersByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { username: { $containsi: queryString } },
        { stuId: { $containsi: queryString } },
        { firstName: { $containsi: queryString } },
        { lastName: { $containsi: queryString } },
        { email: { $containsi: queryString } },
        { academicLevel: { $containsi: queryString } },
        { bio: { $containsi: queryString } },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/users", baseUrl);
  url.search = query;
  return fetchData(url.href);
}

// ########################### Inventory Reports ########################

export async function getInventoryReports(
  sort: string,
  page: string,
  pageSize: string,
  filter: InventoryReportsFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || value === "") continue;

    if (key === "createdAt") {
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { $gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (!value.from) {
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

  // console.log(filterArr);

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
  const url = new URL("/api/inventory-reports", baseUrl);
  url.search = query;
  // console.log(url.href);

  return fetchData(url.href);
}

export async function getInventoryReportById(reportId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${reportId}`);
  return fetchData(`${baseUrl}/api/inventory-reports/${reportId}?populate=*`);
}

export async function getInventoryReportsByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    populate: "*",
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { notes: { $containsi: queryString } },
        {
          creator: {
            $or: [
              { username: { $containsi: queryString } },
              { firstName: { $containsi: queryString } },
              { lastName: { $containsi: queryString } },
              { stuId: { $containsi: queryString } },
              { email: { $containsi: queryString } },
            ],
          },
        },
        {
          itemsChecked: {
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
  const url = new URL("/api/inventory-reports", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}

// ########################### Roster Permissions ########################

export async function getRosterPermissions(
  sort: string,
  page: string,
  pageSize: string,
  filter: RosterPermissionsFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    // if (value === "All" || value === "") continue;

    // if (key === "createdAt") {
    //   if (!value.from && !value.to) {
    //     continue;
    //   } else if (!value.to) {
    //     filterArr.push({
    //       [key]: { $gte: `${new Date(value.from).toISOString()}` },
    //     });
    //     continue;
    //   } else if (!value.from) {
    //     filterArr.push({
    //       [key]: {
    //         $lte: `${new Date(value.to).toISOString()}`,
    //       },
    //     });
    //     continue;
    //   } else {
    //     filterArr.push({
    //       [key]: { $gte: `${new Date(value.from).toISOString()}` },
    //     });
    //     filterArr.push({
    //       [key]: {
    //         $lte: `${new Date(value.to).toISOString()}`,
    //       },
    //     });
    //     continue;
    //   }
    // }

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

  // console.log(filterArr);

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
  const url = new URL("/api/roster-permissions", baseUrl);
  url.search = query;
  // console.log(url.href);

  return fetchData(url.href);
}

export async function getRosterPermissionById(reportId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${reportId}`);
  return fetchData(`${baseUrl}/api/roster-permissions/${reportId}?populate=*`);
}

export async function getRosterPermissionsByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    populate: "*",
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { permissionCode: { $containsi: queryString } },
        { permissionTitle: { $containsi: queryString } },
        { instructor: { $containsi: queryString } },
        { permissionDetails: { $containsi: queryString } },
        { permittedStudios: { $containsi: queryString } },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/roster-permissions", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}

// ########################### Roster Recordss ########################

export async function getRosters(
  sort: string,
  page: string,
  pageSize: string,
  filter: RosterRecordsFilterProps,
) {
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    // if (value === "All" || value === "") continue;

    // if (key === "createdAt") {
    //   if (!value.from && !value.to) {
    //     continue;
    //   } else if (!value.to) {
    //     filterArr.push({
    //       [key]: { $gte: `${new Date(value.from).toISOString()}` },
    //     });
    //     continue;
    //   } else if (!value.from) {
    //     filterArr.push({
    //       [key]: {
    //         $lte: `${new Date(value.to).toISOString()}`,
    //       },
    //     });
    //     continue;
    //   } else {
    //     filterArr.push({
    //       [key]: { $gte: `${new Date(value.from).toISOString()}` },
    //     });
    //     filterArr.push({
    //       [key]: {
    //         $lte: `${new Date(value.to).toISOString()}`,
    //       },
    //     });
    //     continue;
    //   }
    // }

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

  // console.log(filterArr);

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
  const url = new URL("/api/rosters", baseUrl);
  url.search = query;
  // console.log(url.href);

  return fetchData(url.href);
}

export async function getRosterById(reportId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${reportId}`);
  return fetchData(`${baseUrl}/api/rosters/${reportId}?populate=*`);
}

export async function getRostersByQuery(
  queryString: string,
  page: string,
  pageSize: string,
) {
  const query = qs.stringify({
    populate: "*",
    sort: ["createdAt:desc"],
    filters: {
      $or: [
        { stuN: { $containsi: queryString } },
        { netId: { $containsi: queryString } },
        { stuName: { $containsi: queryString } },
        { academicLevel: { $containsi: queryString } },
        { academicProgram: { $containsi: queryString } },
        {
          roster_permissions: {
            $or: [
              { permissionCode: { $containsi: queryString } },
              { permissionTitle: { $containsi: queryString } },
              { instructor: { $containsi: queryString } },
              { permissionDetails: { $containsi: queryString } },
              { permittedStudios: { $containsi: queryString } },
            ],
          },
        },
        // { permittedStudios: { $containsi: queryString } },
      ],
    },
    pagination: {
      pageSize: pageSize,
      page: page,
    },
  });
  const url = new URL("/api/rosters", baseUrl);
  url.search = query;
  // console.log("query data", query)
  return fetchData(url.href);
}
