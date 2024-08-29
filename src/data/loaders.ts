// import qs from "qs";
// import { getAuthToken } from "./services/get-token";
// // import { unstable_noStore as noStore } from "next/cache";
// import { flattenAttributes, getStrapiURL } from "@/lib/utils";

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
import prisma from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";
import { UserWithRole } from "./definitions";

interface InventoryFilterProps {
  m_tech_barcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storage_location?: string;
  comments?: string;
  out?: string;
  broken?: string;
}

interface CheckoutSessionsFilterProps {
  id?: number | null;
  creation_time?: { from?: string | null; to?: string | null } | null;
  finish_time?: { from?: string | null; to?: string | null } | null;
  checkout_id?: string | null;
  return_id?: string | null;
  studio?: string | null;
  other_location?: string | null;
  finished_by?: string | null;
  finished?: string | null;
  notes?: string | null;
}

interface BookingsFilterProps {
  id?: number | null;
  start_time: { from: Date | null; to: Date | null };
  // startTimeTo: string|null;
  end_time: { from: Date | null; to: Date | null };
  // endTimeTo: string|null;
  user?: string | null;
  use_location: string | null;
  type: string | null;
  created_by?: string | null;
  notes?: string | null;
  // inventory_items?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}
interface UsersFilterProps {
  net_id?: string | null;
  stu_id?: string | null;
  fullName?: string | null;
  academic_level?: string | null;
  email?: string | null;
  bio?: string | null;
  blocked?: boolean;
}

interface InventoryReportsFilterProps {
  created_at?: { from?: string; to?: string };
  created_by?: string;
  is_finished?: string;
  notes?: string;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

interface RosterPermissionsFilterProps {
  permission_code?: string | null;
  permission_title?: string | null;
  instructor?: string | null;
  permission_details?: string | null;
  permitted_studios?: string | null;
  start_date?: { from?: string | null; to?: string | null } | null;
  end_date?: { from?: string | null; to?: string | null } | null;
  // inventory_items?: InventoryItem[];
  // studioUser?: UserType[];
}

interface RosterRecordsFilterProps {
  stu_n?: string | null;
  net_id?: string | null;
  stu_name?: string | null;
  academic_level?: string | null;
  academic_program?: string | null;
}

// const baseUrl = getStrapiURL();

// async function fetchData(url: string) {
//   // console.log(url);
//   const authToken = await getAuthToken();
//   // we will implement this later getAuthToken() later
//   const headers = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${authToken}`,
//     },
//   };

//   try {
//     const response = await fetch(url, authToken ? headers : {});
//     const data = await response.json();
//     // console.log(data);
//     return flattenAttributes(data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     throw error; // or return null;
//   }
// }

// export async function getHomePageData() {
//   // noStore();

//   // throw new Error("Test error");

//   const url = new URL("/api/home-page", baseUrl);

//   url.search = qs.stringify({
//     populate: {
//       blocks: {
//         populate: {
//           image: {
//             fields: ["url", "alternativeText"],
//           },
//           link: {
//             populate: true,
//           },
//           feature: {
//             populate: true,
//           },
//         },
//       },
//     },
//   });

//   return await fetchData(url.href);
// }

// export async function getGlobalPageData() {
//   // noStore();
//   const url = new URL("/api/global", baseUrl);

//   url.search = qs.stringify({
//     populate: [
//       "header.logoText",
//       "header.ctaButton",
//       "footer.logoText",
//       "footer.socialLink",
//     ],
//   });

//   return await fetchData(url.href);
// }

// export async function getGlobalPageMetadata() {
//   // noStore();
//   const url = new URL("/api/global", baseUrl);
//   url.search = qs.stringify({
//     fields: ["title", "description"],
//   });
//   return await fetchData(url.href);
// }

// ########################### Inventory ########################

export async function getInventoryItems(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: InventoryFilterProps,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === "" || value === null || value === "All") continue;
    if (key === "storage_location" && value === "All") continue;

    if (
      value === true ||
      value === "true" ||
      value === false ||
      value === "false"
    ) {
      filterArr.push({ [key]: { equals: value === "true" } });
    } else {
      filterArr.push({
        [key]: { contains: value, mode: Prisma.QueryMode.insensitive },
      });
    }
  }

  // console.log(filterArr);

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    include: { image: true },
    where: {
      AND: [...filterArr],
    },
  };
  const countQuery = {
    where: query.where,
  };

  try {
    const data = await prisma.inventory_items.findMany(query);
    const count = await prisma.inventory_items.count(countQuery);
    return { data: data, count: count };
  } catch (error) {
    console.log(error);
    return { data: null, count: null };
  }
}

export async function getInventoryItemById(itemId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  // return fetchData(`${baseUrl}/api/inventory-items/${itemId}`);
  try {
    const data = await prisma.inventory_items.findUnique({
      where: { id: parseInt(itemId) },
      include: { image: true },
    });
    return { data: data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error fetching item by ID" };
  }
}

export async function getInventoryItemByBarcode(barcode: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  // return fetchData(`${baseUrl}/api/inventory-items/${itemId}`);
  try {
    const data = await prisma.inventory_items.findFirst({
      where: { m_tech_barcode: { equals: barcode } },
    });
    return { data: data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error fetching item by barcode" };
  }
}

export async function getItemsByQuery(
  sort: string,
  queryString: string,
  pageIndex: string,
  pageSize: string,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    include: { image: true },
    where: {
      OR: [
        {
          m_tech_barcode: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        { make: { contains: queryString, mode: Prisma.QueryMode.insensitive } },
        {
          model: { contains: queryString, mode: Prisma.QueryMode.insensitive },
        },
        {
          category: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          accessories: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          storage_location: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          comments: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    },
  };
  const countQuery = {
    where: query.where,
  };

  const data = await prisma.inventory_items.findMany(query);
  const count = await prisma.inventory_items.count(countQuery);
  return { data: data, count: count };
}

// ########################### Checkout ########################

export async function getCheckoutSessions(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: CheckoutSessionsFilterProps,
) {
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || value === null) continue;

    if (key === "creation_time" || key === "finish_time") {
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { gte: value.from },
        });
        continue;
      } else if (!value.from) {
        filterArr.push({
          [key]: {
            lte: value.to,
          },
        });
        continue;
      } else {
        // console.log(new Date(value.to).toISOString());
        // console.log("Value to is ", value.to);
        filterArr.push({
          [key]: { gte: value.from },
        });
        filterArr.push({
          [key]: {
            lte: value.to,
          },
        });
        continue;
      }
    }

    if (value === "finished") {
      filterArr.push({ [key]: { equals: true } });
      continue;
    } else if (value === "unfinished") {
      filterArr.push({ [key]: { equals: false } });
      continue;
    }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
    } else {
      if (key === "studio") {
        filterArr.push({ [key]: { equals: value } });
        continue;
      }
      filterArr.push({
        [key]: { contains: value, mode: Prisma.QueryMode.insensitive },
      });
    }
  }

  const query = {
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    orderBy: order_by,
    where: {
      AND: [...filterArr],
    },
    include: {
      inventory_items: { include: { image: true } },
      user: { include: { user_role: true } },
      created_by: true,
    },
  };

  const countQuery = {
    where: {
      AND: [...filterArr],
    },
  };

  const data = await prisma.checkout_sessions.findMany(query);
  const count = await prisma.checkout_sessions.count(countQuery);
  return { data, count };
}

export async function getCheckoutSessionById(itemId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  // return fetchData(`${baseUrl}/api/checkout-sessions/${itemId}?populate=*`);
  return prisma.checkout_sessions.findUnique({
    where: { id: parseInt(itemId) },
    include: {
      user: { include: { user_role: true } },
      inventory_items: { include: { image: true } },
      created_by: true,
    },
  });
}

export async function getCheckoutSessionsByQuery(
  queryString: string,
  pageIndex: string,
  pageSize: string,
) {
  const queryList = queryString.split(" ");

  const query = {
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    orderBy: { created_at: "desc" as Prisma.SortOrder },
    include: { user: true, inventory_items: true, created_by: true },
    where: {
      OR: [
        {
          studio: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          other_location: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        // { creation: { in:queryList,mode:Prisma.QueryMode.insensitive } },
        {
          finished_by: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        // {
        //   notes: {
        //     contains: queryString,
        //     mode: Prisma.QueryMode.insensitive,
        //   },
        // },
        {
          user: {
            OR: queryString.includes(" ")
              ? [
                  {
                    net_id: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    AND: [
                      {
                        first_name: {
                          in: queryList,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        last_name: {
                          in: queryList,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    ],
                  },
                  {
                    stu_id: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    email: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ]
              : [
                  {
                    net_id: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    first_name: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    last_name: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    stu_id: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    email: {
                      contains: queryString,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
          },
        },

        {
          created_by: {
            OR: [
              {
                net_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                AND: [
                  {
                    first_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    last_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          },
        },

        {
          inventory_items: {
            some: {
              OR: [
                {
                  m_tech_barcode: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  make: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  model: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  category: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  description: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  accessories: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  storage_location: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  comments: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };
  const countQuery = {
    where: query.where,
  };

  // console.log("query data", query)
  const data = await prisma.checkout_sessions.findMany(query);
  const count = await prisma.checkout_sessions.count(countQuery);
  return { data, count };
}

// ########################### Booking ########################

export async function getBookings(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: BookingsFilterProps,
  user: UserWithRole | null,
) {
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  // console.log("skip is ", pageIndex);
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || !value) continue;

    if (key === "start_time" || key === "end_time") {
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (!value.from) {
        filterArr.push({
          [key]: {
            lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      } else {
        // console.log(new Date(value.to).toISOString());
        // console.log("Value to is ", value.to);
        filterArr.push({
          [key]: { gte: `${new Date(value.from).toISOString()}` },
        });
        filterArr.push({
          [key]: {
            lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      }
    }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
      continue;
    } else {
      filterArr.push({
        [key]: { contains: value, mode: Prisma.QueryMode.insensitive },
      });
      continue;
    }
  }
  // console.log("Filter Array is",filterArr)

  const query = {
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    orderBy: order_by,
    include: {
      inventory_items: { include: { image: true } },
      user: { include: { user_role: true } },
      created_by: { include: { user_role: true } },
    },
    where: {
      AND:
        user?.user_role.name === "Admin" || user?.user_role.name === "Monitor"
          ? [...filterArr]
          : [...filterArr, { user: { id: user?.id } }],
    },
  };

  const countQuery = {
    where: query.where,
  };

  const data = await prisma.bookings.findMany(query);
  const count = await prisma.bookings.count(countQuery);
  return { data, count };
}

export async function getBookingById(
  bookingId: string,
  user: UserWithRole | null,
) {
  if (!user) return { data: null, count: null };

  const query = {
    where:
      user?.user_role.name === "Admin" || user?.user_role.name === "Monitor"
        ? { id: parseInt(bookingId) }
        : {
            AND: [{ id: parseInt(bookingId) }, { user: { id: user?.id } }],
          },
    include: {
      user: { include: { user_role: true } },
      created_by: { include: { user_role: true } },
      inventory_items: { include: { image: true } },
    },
  };
  return { data: await prisma.bookings.findFirst(query), count: 1 };
  // console.log(url.href);

  // return fetchData(url.href);
}

export async function getBookingsByQuery(
  queryString: string,
  pageIndex: string,
  pageSize: string,
  user: UserWithRole | null,
) {
  if (!user) return { data: null, count: null };
  // const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  const queryList = queryString.split(" ");
  const isAuthorized =
    user?.user_role.name === "Admin" || user?.user_role.name === "Monitor";

  const orList = [
    {
      type: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      use_location: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      notes: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      user: {
        OR: queryString.includes(" ")
          ? [
              {
                net_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                AND: [
                  {
                    first_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    last_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ]
          : [
              {
                net_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                first_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                last_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
      },
    },
    {
      created_by: {
        OR: queryString.includes(" ")
          ? [
              {
                AND: [
                  {
                    first_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    last_name: {
                      in: queryList,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ]
          : [
              {
                first_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                last_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
      },
    },
    {
      inventory_items: {
        some: {
          OR: [
            {
              m_tech_barcode: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              make: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              model: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              category: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              accessories: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              storage_location: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              comments: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        },
      },
    },
  ];

  const query = {
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    orderBy: { created_at: "desc" as Prisma.SortOrder },
    include: { inventory_items: true, user: true, created_by: true },
    where: isAuthorized
      ? { OR: orList }
      : {
          AND: [
            {
              OR: orList,
            },
            { user: { id: user.id } },
          ],
        },
  };

  const countQuery = {
    where: query.where,
  };

  const data = await prisma.bookings.findMany(query);
  const count = await prisma.bookings.count(countQuery);
  return { data: data, count: count };
}

export async function getBookingByDateWeek(
  newDate: Date,
  user: UserWithRole | null,
) {
  // const start = startOfDay(subDays(startOfWeek(newDate), 7)).toISOString();
  // const end = startOfDay(addDays(endOfWeek(newDate), 1)).toISOString();
  const start = startOfDay(subMonths(startOfMonth(newDate), 1)).toISOString();
  const end = startOfDay(addDays(endOfMonth(newDate), 1)).toISOString();

  const query = {
    orderBy: { created_at: "desc" as Prisma.SortOrder },
    where: {
      AND:
        user?.user_role.name === "Admin" || user?.user_role.name === "Monitor"
          ? [{ start_time: { gte: start } }, { start_time: { lte: end } }]
          : [
              { start_time: { gte: start } },
              { start_time: { lte: end } },
              { user: { id: user?.id } },
            ],
    },
    include: { inventory_items: true, user: true, created_by: true },
  };

  return await prisma.bookings.findMany(query);
}

// ########################### Users ########################

export async function getUsers(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: UsersFilterProps,
  currentUser: UserWithRole,
) {
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === null || value === false || value === "false") continue;

    if (key === "user_role") {
      filterArr.push({ user_role: { name: value } });
      continue;
    }

    if (key === "academic_level") {
      filterArr.push({ [key]: { equals: value } });
      continue;
    }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
    } else {
      filterArr.push({ [key]: { contains: value, model: "insenstive" } });
    }
  }

  // console.log(filterArr);

  const query = {
    orderBy: order_by,
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    where: {
      AND:
        currentUser.user_role.name === "Admin"
          ? [...filterArr]
          : [...filterArr, { user_role: { id: 2 } }],
    },
    include: { user_role: true, image: true },
  };

  const countQuery = {
    where: query.where,
  };

  const data = await prisma.user.findMany(query);
  const count = await prisma.user.count(countQuery);
  return { data, count };
}

export async function getUserById(userId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${itemId}`);
  // return fetchData(`${baseUrl}/api/users/${userId}?populate=role`);
  return prisma.user.findUnique({
    where: { id: userId },
    include: { user_role: true, image: true },
  });
}

export async function getUsersByQuery(
  queryString: string,
  pageIndex: string,
  pageSize: string,
  currentUser: UserWithRole,
) {
  // const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);

  const orClause = [
    {
      user_role:
        currentUser.user_role.name === "Admin"
          ? {
              name: {
                contains: queryString,
                mode: Prisma.QueryMode.insensitive,
              },
            }
          : undefined,
    },

    {
      net_id: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      stu_id: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      first_name: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      last_name: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      email: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      academic_level: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    {
      bio: {
        contains: queryString,
        mode: Prisma.QueryMode.insensitive,
      },
    },
  ];

  const query = {
    orderBy: { created_at: "desc" as Prisma.SortOrder },
    skip: skipValue,
    take: pageSizeNumber,
    where:
      currentUser.user_role.name === "Admin"
        ? { OR: orClause }
        : {
            AND: [{ OR: orClause }, { user_role: { id: 2 } }],
          },
    include: { user_role: true, image: true },
  };

  const countQuery = {
    where:
      currentUser.user_role.name === "Admin"
        ? { OR: orClause }
        : {
            AND: [{ OR: orClause }, { user_role: { id: 2 } }],
          },
  };
  const data = await prisma.user.findMany(query);
  const count = await prisma.user.count(countQuery);
  return { data, count };
}

export async function getUserByIdentifier(identifier: string) {
  try {
    const user = await prisma.user.findMany({
      omit: {
        password: false, // The password field is now selected.
      },
      include: { user_role: true, image: true },
      where: {
        OR: [
          { email: { equals: identifier } },
          { net_id: { equals: identifier } },
        ],
      },
    });
    // console.log(user);
    return { data: user[0], error: null };
  } catch (error) {
    // console.log(error);
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Unknown Error Happened" };
  }
}

// ########################### Inventory Reports ########################

export async function getInventoryReports(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: InventoryReportsFilterProps,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    // if (value === "" || value === false || value === "false") continue;
    if (value === "All" || value === "" || !value) continue;

    if (key === "created_at") {
      if (!value.from && !value.to) {
        continue;
      } else if (!value.to) {
        filterArr.push({
          [key]: { gte: `${new Date(value.from).toISOString()}` },
        });
        continue;
      } else if (!value.from) {
        filterArr.push({
          [key]: {
            lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      } else {
        // console.log(new Date(value.to).toISOString());
        // console.log("Value to is ", value.to);
        filterArr.push({
          [key]: { gte: `${new Date(value.from).toISOString()}` },
        });
        filterArr.push({
          [key]: {
            lte: `${new Date(value.to).toISOString()}`,
          },
        });
        continue;
      }
    }

    if (value === "finished") {
      filterArr.push({ [key]: { equals: true } });
      continue;
    } else if (value === "unfinished") {
      filterArr.push({ [key]: { equals: false } });
      continue;
    }

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
    } else {
      filterArr.push({
        [key]: { contains: value },
        mode: Prisma.QueryMode.insensitive,
      });
    }
  }

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    include: { created_by: true, inventory_items: true },
    where: {
      AND: [...filterArr],
    },
  };
  const countQuery = {
    where: query.where,
  };

  const data = await prisma.inventory_reports.findMany(query);
  const count = await prisma.inventory_reports.count(countQuery);
  return { data: data, count: count };
}

export async function getInventoryReportById(reportId: string) {
  try {
    const data = await prisma.inventory_reports.findUnique({
      include: { created_by: true, inventory_items: true },
      where: { id: parseInt(reportId) },
    });
    return { data: data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error fetching data by ID" };
  }
}

export async function getInventoryReportsByQuery(
  sort: string,
  queryString: string,
  pageIndex: string,
  pageSize: string,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    include: { created_by: true, inventory_items: true },
    where: {
      OR: [
        {
          notes: { contains: queryString, mode: Prisma.QueryMode.insensitive },
        },
        {
          created_by: {
            OR: [
              {
                net_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                first_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                last_name: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                stu_id: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: queryString,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          },
        },
        {
          inventory_items: {
            some: {
              OR: [
                {
                  m_tech_barcode: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  make: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  model: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  category: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  description: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  accessories: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  storage_location: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  comments: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };
  const countQuery = {
    where: query.where,
  };

  const data = await prisma.inventory_reports.findMany(query);
  const count = await prisma.inventory_reports.count(countQuery);
  return { data: data, count: count };
}

// ########################### Roster Permissions ########################

export async function getRosterPermissions(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: RosterPermissionsFilterProps,
) {
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === null || value === false || value === "false") continue;
    if (value === "All" || value === "") continue;

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
    } else {
      filterArr.push({ [key]: { contains: value, mode: "insensitive" } });
    }
  }

  const query = {
    orderBy: order_by,
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    where: {
      AND: [...filterArr],
    },
  };
  const countQuery = {
    where: query.where,
  };

  try {
    const data = await prisma.roster_permissions.findMany(query);
    const count = await prisma.roster_permissions.count(countQuery);
    return { data: data, count: count };
  } catch (error) {
    console.log(error);
    return { data: null, count: null };
  }
}

export async function getRosterPermissionById(permissionId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${reportId}`);
  try {
    const data = await prisma.roster_permissions.findUnique({
      where: { id: parseInt(permissionId) },
    });
    return { data: data, error: null };
  } catch (error) {
    return { data: null, error: JSON.stringify(error) };
  }
}

export async function getRosterPermissionsByQuery(
  sort: string,
  queryString: string,
  pageIndex: string,
  pageSize: string,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    where: {
      OR: [
        {
          permission_code: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          permission_title: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          instructor: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          permission_details: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        // {
        //   permitted_studios: {
        //     has: queryString,
        //   },
        // },
      ],
    },
  };

  const countQuery = {
    where: query.where,
  };

  try {
    const data = await prisma.roster_permissions.findMany(query);
    const count = await prisma.roster_permissions.count(countQuery);
    return { data: data, count: count };
  } catch (error) {
    console.log(error);
    return { data: null, count: null };
  }
}

// ########################### Roster Recordss ########################

export async function getRosters(
  sort: string,
  pageIndex: string,
  pageSize: string,
  filter: RosterRecordsFilterProps,
) {
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };
  let filterArr = [];
  for (const [key, value] of Object.entries(filter)) {
    // console.log(`${key}: ${value}`);
    if (value === null || value === false || value === "false") continue;
    if (value === "All" || value === "") continue;

    if (value === true || value === "true") {
      filterArr.push({ [key]: { equals: value } });
    } else {
      filterArr.push({ [key]: { contains: value, mode: "insensitive" } });
    }
  }

  const query = {
    orderBy: order_by,
    skip: parseInt(pageSize) * (parseInt(pageIndex) - 1),
    take: parseInt(pageSize),
    include: { permissions: true },
    where: {
      AND: filterArr,
    },
  };
  // console.log(query);
  const countQuery = {
    where: query.where,
  };
  try {
    const data = await prisma.rosters.findMany(query);
    const count = await prisma.rosters.count(countQuery);
    return { data: data, count: count };
  } catch (error) {
    console.log(error);
    return { data: null, count: null };
  }
}

export async function getRosterById(rosterId: string) {
  // console.log(`${baseUrl}/api/inventory-items/${reportId}`);
  try {
    const data = await prisma.rosters.findUnique({
      where: { id: parseInt(rosterId) },
      include: { permissions: true },
    });
    return { data: data, error: null };
  } catch (error) {
    return { data: null, error: JSON.stringify(error) };
  }
  // return fetchData(`${baseUrl}/api/rosters/${reportId}?populate=*`);
}

export async function getRostersByQuery(
  sort: string,
  queryString: string,
  pageIndex: string,
  pageSize: string,
) {
  const pageSizeNumber = parseInt(pageSize);
  const pageIndexNumber = parseInt(pageIndex);
  const skipValue = pageSizeNumber * (pageIndexNumber - 1);
  const order_by = { [sort.split(":")[0]]: sort.split(":")[1] };

  const query = {
    orderBy: order_by,
    skip: skipValue,
    take: pageSizeNumber,
    include: { permissions: true },
    where: {
      OR: [
        {
          stu_n: { contains: queryString, mode: Prisma.QueryMode.insensitive },
        },
        {
          net_id: { contains: queryString, mode: Prisma.QueryMode.insensitive },
        },
        {
          stu_name: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          academic_level: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          academic_program: {
            contains: queryString,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          permissions: {
            some: {
              OR: [
                {
                  permission_code: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  permission_title: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  instructor: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  permission_details: {
                    contains: queryString,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                // {
                //   permitted_studios: {
                //     has: queryString,
                //   },
                // },
              ],
            },
          },
        },
      ],
    },
  };

  const countQuery = {
    where: query.where,
  };

  try {
    const data = await prisma.rosters.findMany(query);
    const count = await prisma.rosters.count(countQuery);
    // console.log(data, query.where.OR[5].permissions?.some.OR)
    return { data: data, count: count };
  } catch (error) {
    console.log(error);
    return { data: null, count: null };
  }
}
