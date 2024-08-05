// src/FileInput.js
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createRosterPermissionAction } from "@/data/actions/rosterPermission-actions";
import { createRosterAction } from "@/data/actions/roster-actions";
import {
  RosterPermissionType,
  RosterPermissionTypePost,
  RosterRecordTypePost,
} from "@/data/definitions";
import {
  getRosterPermissions,
  getRosterPermissionsByQuery,
} from "@/data/loaders";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import { useState } from "react";
import React from "react";
import * as XLSX from "xlsx";

function FileInput({ authToken }: { authToken: string }) {
  const [permissionData, setPermissionData] =
    useState<RosterPermissionTypePost[]>();
  const [rosterData, setRosterData] = useState<RosterRecordTypePost[]>();
  const [permissionUploaded, setPermissionUploaded] = useState(false);
  const [rosterUploaded, setRosterUploaded] = useState(false);

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
      // console.log(url);
      return flattenAttributes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  async function getPermissionByCourseN(courseN: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ courseN: { $containsi: courseN } }],
      },
    });
    const url = new URL("/api/roster-permissions", baseUrl);
    url.search = query;
    // console.log("query data", url.href);
    return fetchData(url.href);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, { type: "binary" });
      const sheetName = workbook.SheetNames[1];
      const sheet = workbook.Sheets[sheetName];
      const sheetData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // #########################

      const convertedData: RosterPermissionTypePost[] = sheetData.map(
        (item) => {
          item.permittedStudios = item.permittedStudios?.split(",");
          return item;
        },
      );
      // setPermissionData(convertedData);

      convertedData?.map(async (row) => {
        await createRosterPermissionAction(row);
      });

      setPermissionUploaded(true);

      // #########################

      // const convertedData = await Promise.all(
      //   // find id for each roster record's related permission
      //   sheetData.map(async (item) => {
      //     // find courseNumber related permission

      //     // Fetch the roster permissions
      //     const { data: resPermissions, meta } = await getPermissionByCourseN(
      //       item.courseNumber,
      //     );

      //     console.log(resPermissions);

      //     // Check the result and modify the item accordingly
      //     if (resPermissions?.length > 1) {
      //       return "error: multiple records found";
      //     }

      //     // if only one permission found for the courseNumber we give its id to the roster record
      //     item.roster_permissions = [resPermissions[0].id];

      //     return item;
      //   }),
      // );

      // console.log(convertedData);

      //combine multiple roster records of the same student into one
      // const combinedRecords: RosterRecordTypePost[] = [];
      // convertedData.map((item) => {
      //   if (
      //     item.stuN === "" ||
      //     combinedRecords.map((item) => item.stuN).includes(item.stuN)
      //   ) {
      //     return;
      //   }
      //   let consolidatedPermissions: any[] = [];
      //   const dupeRecords = convertedData.filter(
      //     (itemDupe) => itemDupe.stuN !== "" && itemDupe.stuN === item.stuN,
      //   );
      //   // console.log(dupeRecords);

      //   if (dupeRecords.length >= 1) {
      //     consolidatedPermissions = consolidatedPermissions.concat(
      //       dupeRecords.map((dupeItem) => dupeItem.roster_permissions[0]),
      //     );
      //   }
      //   item.roster_permissions = consolidatedPermissions;

      //   if (!combinedRecords.map((i) => i.stuN).includes(item.stuN)) {
      //     combinedRecords.push(item);
      //   }
      //   // return item;
      // });

      // console.log(combinedRecords);
      // combinedRecords?.map(async (row) => {
      //   await createRosterAction(row);
      // });
      // ###################################################
    };

    // reader.readAsBinaryString(file);
    if (file) reader.readAsArrayBuffer(file);
  };

  const handleFileUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // #########################

      // const convertedData: RosterPermissionTypePost[] = sheetData.map(
      //   (item) => {
      //     item.permittedStudios = item.permittedStudios?.split(",");
      //     return item;
      //   },
      // );
      // setPermissionData(convertedData);

      // convertedData?.map(async (row) => {
      //   await createRosterPermissionAction(row);
      // });

      // #########################

      const convertedData = await Promise.all(
        // find id for each roster record's related permission
        sheetData.map(async (item) => {
          // find courseNumber related permission

          // Fetch the roster permissions
          const { data: resPermissions, meta } = await getPermissionByCourseN(
            item.courseNumber,
          );

          console.log(resPermissions);

          // Check the result and modify the item accordingly
          if (resPermissions?.length > 1) {
            return "error: multiple records found";
          }

          // if only one permission found for the courseNumber we give its id to the roster record
          item.roster_permissions = [resPermissions[0].id];

          return item;
        }),
      );

      console.log(convertedData);

      // combine multiple roster records of the same student into one

      const combinedRecords: RosterRecordTypePost[] = [];
      convertedData.map((item) => {
        if (
          item.stuN === "" ||
          combinedRecords.map((item) => item.stuN).includes(item.stuN)
        ) {
          return;
        }
        let consolidatedPermissions: any[] = [];
        const dupeRecords = convertedData.filter(
          (itemDupe) => itemDupe.stuN !== "" && itemDupe.stuN === item.stuN,
        );
        // console.log(dupeRecords);

        if (dupeRecords.length >= 1) {
          consolidatedPermissions = consolidatedPermissions.concat(
            dupeRecords.map((dupeItem) => dupeItem.roster_permissions[0]),
          );
        }
        item.roster_permissions = consolidatedPermissions;

        if (!combinedRecords.map((i) => i.stuN).includes(item.stuN)) {
          combinedRecords.push(item);
        }
        // return item;
      });

      // setRosterData(combinedRecords);
      console.log(combinedRecords);

      combinedRecords?.map(async (row) => {
        await createRosterAction(row);
      });

      setRosterUploaded(true);
      // ###################################################
    };

    // reader.readAsBinaryString(file);
    if (file) reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {permissionUploaded ? (
        <h2 className="text-lg font-bold">Permission Uploaded</h2>
      ) : (
        ``
      )}
      {permissionData && (
        <div>
          <h2>Imported PermissionData:</h2>
          {/* <pre>{JSON.stringify(permissionData, null, 2)}</pre> */}
          <Table>
            <TableHeader>
              <TableRow>
                {permissionData.length
                  ? Object.keys(permissionData[0]).map((field) => (
                      <TableHead>{field}</TableHead>
                    ))
                  : ``}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionData.length
                ? permissionData
                    .map((row) => Object.values(row))
                    .map((fields) => (
                      <TableRow>
                        {fields.map((field) => (
                          <TableCell>{field as string}</TableCell>
                        ))}
                      </TableRow>
                    ))
                : ``}
            </TableBody>
          </Table>
        </div>
      )}

      <input type="file" onChange={handleFileUpload2} />
      {rosterUploaded ? (
        <h2 className="text-lg font-bold">Roster Uploaded</h2>
      ) : (
        ``
      )}
      {rosterData && (
        <div>
          <h2>Imported PermissionData:</h2>
          {/* <pre>{JSON.stringify(rosterData, null, 2)}</pre> */}
          <Table>
            <TableHeader>
              <TableRow>
                {rosterData.length
                  ? Object.keys(rosterData[0]).map((field) => (
                      <TableHead>{field}</TableHead>
                    ))
                  : ``}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rosterData.length
                ? rosterData
                    .map((row) => Object.values(row))
                    .map((fields) => (
                      <TableRow>
                        {fields.map((field) => (
                          <TableCell>{field as string}</TableCell>
                        ))}
                      </TableRow>
                    ))
                : ``}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default FileInput;
