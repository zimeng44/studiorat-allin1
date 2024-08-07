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
import { Progress } from "@/components/ui/progress";

function FileInput({ authToken }: { authToken: string }) {
  const [permissionData, setPermissionData] =
    useState<RosterPermissionTypePost[]>();
  const [rosterData, setRosterData] = useState<RosterRecordTypePost[]>();
  const [permissionUploaded, setPermissionUploaded] = useState(false);
  const [rosterUploaded, setRosterUploaded] = useState(false);
  const [permissionsProgress, setPermissionsProgress] = useState(0);
  const [rosterProgress, setRosterProgress] = useState(0);

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

  async function getPermissionByPermissionCode(permissionCode: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ permissionCode: { $containsi: permissionCode } }],
      },
    });
    const url = new URL("/api/roster-permissions", baseUrl);
    url.search = query;
    // console.log("query data", url.href);
    return fetchData(url.href);
  }

  const uploadPermission = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermissionUploaded(false);
    setPermissionsProgress(0);
    setPermissionData(undefined);
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, {
        type: "binary",
        // cellText: false,
        // cellDates: true,
      });
      const sheetName = workbook.SheetNames[1];
      const sheet = workbook.Sheets[sheetName];
      const sheetData: any[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        // header: 1,
        raw: false,
        dateNF: "mm-dd-yyyy",
      });

      const convertedData: RosterPermissionTypePost[] = sheetData.map(
        (item) => {
          item.permittedStudios = item.permittedStudios?.split(",");
          if (item.startDate === "") item.startDate = undefined;
          if (item.endDate === "") item.endDate = undefined;
          if (item.startDate)
            item.startDate = new Date(item.startDate).toISOString();
          if (item.endDate) item.endDate = new Date(item.endDate).toISOString();
          // console.log(item);
          return item;
        },
      );

      // console.log(convertedData);

      let currentProgress = 0;

      await Promise.all(
        convertedData?.map(async (row) => {
          const res = await createRosterPermissionAction(
            JSON.parse(JSON.stringify(row)),
          );
          // console.log(res);
          currentProgress += 1;
          setPermissionsProgress(
            (currentProgress / convertedData.length) * 100,
          );
        }),
      );
      // console.log(convertedData);
      setPermissionData(convertedData);
      setPermissionUploaded(true);
    };

    // reader.readAsBinaryString(file);
    if (file) reader.readAsArrayBuffer(file);
  };

  const uploadRoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRosterUploaded(false);
    setRosterProgress(0);
    setRosterData(undefined);
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, { type: "binary" });
      const sheetName2 = workbook.SheetNames[0];
      const sheet2 = workbook.Sheets[sheetName2];
      const sheetData2: any[] = XLSX.utils.sheet_to_json(sheet2, {
        defval: "",
      });

      const convertedData2 = await Promise.all(
        // find id for each roster record's related permission
        sheetData2.map(async (item) => {
          // Fetch the roster permissions that are related to the permissionCode
          const { data: permissions, meta } =
            await getPermissionByPermissionCode(item.permissionCode);

          // console.log(permissions);
          // Check the result and modify the item accordingly
          if (permissions?.length === 1) {
            // if only one permission found for the permissionCode we give its id to the roster record
            item.roster_permissions = [permissions[0].id];
          } else {
            item.roster_permissions = [];
            console.log("permissionCode Not Found in Permissions for");
          }
          return item;
        }),
      );

      // console.log(convertedData2);

      // combine multiple roster records of the same student into one
      const combinedRecords: RosterRecordTypePost[] = [];

      convertedData2.map((item) => {
        if (
          item.stuN === "" ||
          combinedRecords.map((item) => item.stuN).includes(item.stuN)
        ) {
          return;
        }
        let consolidatedPermissions: any[] = [];
        const dupeRecords = convertedData2.filter(
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

      // console.log(combinedRecords);
      let currentProgress = 0;

      await Promise.all(
        combinedRecords?.map(async (row) => {
          await createRosterAction(JSON.parse(JSON.stringify(row)));

          currentProgress += 1;
          setRosterProgress((currentProgress / combinedRecords.length) * 100);
        }),
      );
      setRosterData(combinedRecords);
      setRosterUploaded(true);
    };

    // reader.readAsBinaryString(file);
    if (file) reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadPermission(e);
    await uploadRoster(e);
  };

  // const handleFileUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <div className="flex-col py-2">
      <h1 className="left-content flex-1 py-2 text-lg font-bold">Import</h1>
      <p className="text-xs text-muted-foreground">
        (DO NOT close browser before uploads complete)
      </p>
      {permissionsProgress > 0 || rosterProgress > 0 ? (
        <div className="flex-1">
          <div className="flex flex-row items-center">
            Permission:
            {permissionUploaded ? (
              <h2 className="flex-1 p-1 text-sm italic text-green-400">
                Complete
              </h2>
            ) : (
              ``
            )}
          </div>
          <Progress
            value={permissionsProgress}
            className="m-2 h-2 w-[60%] flex-1"
          />
          <div className="flex flex-1 items-center">
            Roster:
            {rosterUploaded ? (
              <h2 className="flex-1 p-1 text-sm italic text-green-400">
                Complete
              </h2>
            ) : (
              ``
            )}
          </div>
          <Progress value={rosterProgress} className="m-2 h-2 w-[60%] flex-1" />
        </div>
      ) : (
        ``
      )}
      <input className="flex-1 p-2" type="file" onChange={handleFileUpload} />

      {permissionData && (
        <div className="flex-1 p-2">
          <h2 className="p2">Sample From Imported Permission:</h2>
          {/* <pre>{JSON.stringify(permissionData, null, 2)}</pre> */}
          <Table className="max-w-xl">
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
                ? permissionData.length > 5
                  ? permissionData
                      .slice(0, 5)
                      .map((row) => Object.values(row))
                      .map((fields) => (
                        <TableRow>
                          {fields.map((field) => (
                            <TableCell>{field as string}</TableCell>
                          ))}
                        </TableRow>
                      ))
                  : permissionData
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
      {/* <input type="file" onChange={handleFileUpload2} /> */}

      {rosterData && (
        <div className="max-w-xl flex-1 overflow-scroll p-2">
          <h2 className="p2">Sample From Imported Roster:</h2>
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
                ? rosterData.length > 5
                  ? rosterData
                      .slice(0, 5)
                      .map((row) => Object.values(row))
                      .map((fields) => (
                        <TableRow>
                          {fields.map((field) => (
                            <TableCell>{field as string}</TableCell>
                          ))}
                        </TableRow>
                      ))
                  : rosterData
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
