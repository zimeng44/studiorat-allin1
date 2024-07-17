import { InventoryItem } from "./definitions";
import connection from "strapi";

const getData = async (
  pageIndex: number,
  pageSize: number,
  sort: string,
  desc: boolean,
) => {
  const dataUrl =
    sort === ""
      ? `http://localhost:1337/api/inventory-items?pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}`
      : desc
        ? `http://localhost:1337/api/inventory-items?pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}&sort=${sort}:desc`
        : `http://localhost:1337/api/inventory-items?pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}&sort=${sort}`;

  fetch(dataUrl, { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      if (data.data.length !== 0) {
        return data;

        // {
        //   data: data.data,
        //   pageIndex: data.meta.pagination.page,
        //   pageSize: data.meta.pagination.pageSize,
        //   pageCount: data.meta.pagination.pageCount,
        //   totalEntries: data.meta.pagination.total,
        // };
        // console.log("Data Length: ", data.data.length);
      }
    })
    .catch((err) => {
      console.error(err);
    });

  // const res = await fetch("http://localhost:1337/api/inventory-items", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(newItem),
  // });
  // toast.success("Item Added Successfully!");
};

const addItem = async (newItem: InventoryItem) => {
  const res = await fetch("http://localhost:1337/api/inventory-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newItem),
    cache: "no-store",
  });
  // toast.success("Item Added Successfully!");
  return;
};

const updateItem = async (updatedItem: InventoryItem, id: number) => {
  const res = await fetch(`http://localhost:1337/api/inventory-items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedItem),
    cache: "no-store",
  });
  console.log(res.url);
  return;
};

const deleteItem1 = async (id: number) => {
  const res = await fetch(`http://localhost:1337/api/inventory-items/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return;
};

const findCustom1 = async () => {
  const rawBuilder = connection.context.raw(
    "select * from inventroy-items",
  );

  const resp = await rawBuilder.then();

  return resp.rows;
  // return "yes";
};
export {findCustom1};
export default getData;
