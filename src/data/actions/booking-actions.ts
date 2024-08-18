"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookingTypePost } from "@/data/definitions";
import { inventory_items, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type BookingWithUserAndItems = Prisma.bookingsGetPayload<{
  include: {
    user: { include: { user_role: true } };
    created_by: true;
    inventory_items: true;
    // user_role: true;
  };
}>;
type UserWithRole = Prisma.UserGetPayload<{
  include: { user_role: true };
}>;

async function itemConflictCheck(booking: any) {
  // console.log(booking.inventory_items);

  if (!booking.inventory_items) return new Array();
  if (booking.inventory_items.length === 0) return new Array();

  let inventoryItems = [];

  if (booking.inventory_items.connect)
    inventoryItems = booking.inventory_items.connect;

  if (booking.inventory_items.set) inventoryItems = booking.inventory_items.set;

  const itemList = inventoryItems.map((item: any) => item.id);

  // console.log(itemList);

  const query = {
    // sort: ["createdAt:desc"],
    // populate: "*",
    // include: { inventory_items: true },
    where: {
      AND: [
        {
          OR: [
            {
              start_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              end_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              AND: [
                { start_time: { lte: booking.start_time as Date } },
                { end_time: { gte: booking.end_time as Date } },
              ],
            },
          ],
        },
        {
          inventory_items: {
            some: {
              id: {
                in: [...itemList],
              },
            },
          },
        },
      ],
    },
  };
  // const url = new URL("/api/bookings", baseUrl);
  // url.search = query;
  // console.log("query data", query)
  // return fetchData(url.href);
  return await prisma.bookings.findMany(query);
}

async function locationConflictCheck(booking: any) {
  const query = {
    where: {
      AND: [
        {
          OR: [
            {
              start_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              end_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              AND: [
                { start_time: { lte: booking.start_time as Date } },
                { end_time: { gte: booking.end_time as Date } },
              ],
            },
          ],
        },
        {
          use_location: { equals: booking.use_location },
        },
      ],
    },
  };

  return await prisma.bookings.findMany(query);
}

export async function createBookingAction(newBooking: any) {
  // const newBooking = JSON.parse()
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const payload = {
      data: newBooking,
      include: { user: true, inventory_items: true, created_by: true },
    };

    const data = await itemConflictCheck(newBooking);

    // console.log(data);

    if (data.length !== 0) {
      return { res: null, error: "Item Conflict Found." };
    }
    if (newBooking.use_location === "Outside") {
      const res = await prisma.bookings.create(payload);
      return { res: res, error: null };
    } else {
      const data = await locationConflictCheck(newBooking);
      if (data.length !== 0) {
        return { res: null, error: "Location Conflict Found." };
      }

      const res = await prisma.bookings.create(payload);
      return { res: res, error: null };
    }
  } catch (error) {
    console.log(error);
    return { res: null, error: error };
  }

  // console.log(newBooking.finishTime);
  // if (newBooking.startTime)
  //   newBooking.startTime = new Date(newBooking.startTime).toISOString();
  // if (newBooking.endTime)
  //   newBooking.endTime = new Date(newBooking.endTime).toISOString();

  // const payload = {
  //   data: newBooking,
  // };

  // const data = await mutateData("POST", "/api/bookings", payload);
  // const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/booking/" + flattenedData.id);
  // redirect("/dashboard/booking");
}

export const updateBookingAction = async (
  updatedBooking: Prisma.bookingsUncheckedUpdateInput,
  id: number,
) => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const payload = {
      where: { id: id },
      data: updatedBooking,
    };

    const data = await itemConflictCheck(updatedBooking);

    // console.log(data);

    if (data.length > 1) {
      return { res: null, error: "Item Conflict Found." };
    }
    if (updatedBooking.use_location === "Outside") {
      const res = await prisma.bookings.update(payload);
      revalidatePath("/dashboard/booking");
      return { res: res, error: null };
    } else {
      const bookingForCheck = { ...updatedBooking };
      const data = await locationConflictCheck(bookingForCheck);

      if (data.length > 1) {
        return { res: null, error: "Location Conflict Found." };
      }

      const res = await prisma.bookings.update(payload);
      // console.log(res);
      revalidatePath("/dashboard/booking");
      return { res: res, error: null };
    }
  } catch (error) {
    console.log(error);
    return { res: null, error: "Error updateing booking" };
  }
};

export async function deleteBookingAction(id: string) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const res = await prisma.bookings.delete({ where: { id: parseInt(id) } });

    // console.log(res);
    // revalidatePath("/dashboard/booking");
    return { res: res, error: null };
  } catch (error: any) {
    // console.log(error);
    return { res: null, error: error.toString() };
  }
}
