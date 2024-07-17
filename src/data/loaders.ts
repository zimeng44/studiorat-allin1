import qs from "qs";
import { getAuthToken } from "./services/get-token";
// import { unstable_noStore as noStore } from "next/cache";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { boolean } from "zod";

interface FilterProps {
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
  filter: FilterProps,
) {
  // const filters = {
  //   $and: [
  //     { mTechBarcode: "" },
  //     { make: "" },
  //     { model: "" },
  //     { category: "" },
  //     { description: "" },
  //     { accessories: "" },
  //     { storageLocation: "All" },
  //     { comments: "" },
  //     { out: false },
  //     { broken: false },
  //   ],
  // };

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
