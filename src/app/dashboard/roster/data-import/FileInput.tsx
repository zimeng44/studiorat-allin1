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
import {
  createRosterPermissionAction,
  getPermissionByPermissionCode,
} from "@/data/actions/rosterPermission-actions";
import { createRosterAction } from "@/data/actions/roster-actions";
import { RosterPermissionTypePost, RosterRecordType } from "@/data/definitions";
import { useState } from "react";
import React from "react";
import * as XLSX from "xlsx";
import { Progress } from "@/components/ui/progress";

function FileInput({ authToken }: { authToken: string }) {
  const [permissionData, setPermissionData] =
    useState<RosterPermissionTypePost[]>();
  const [rosterData, setRosterData] = useState<RosterRecordType[]>();
  const [permissionUploaded, setPermissionUploaded] = useState(false);
  const [rosterUploaded, setRosterUploaded] = useState(false);
  const [permissionsProgress, setPermissionsProgress] = useState(0);
  const [rosterProgress, setRosterProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Initialize state variables for both permissions and roster
    setPermissionUploaded(false);
    setPermissionsProgress(0);
    setPermissionData(undefined);
    setRosterUploaded(false);
    setRosterProgress(0);
    setRosterData(undefined);

    // Get the file
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, {
        type: "binary",
      });

      // Process Permissions
      const sheetNamePermissions = workbook.SheetNames[1];
      const sheetPermissions = workbook.Sheets[sheetNamePermissions];
      const sheetDataPermissions: any[] = XLSX.utils.sheet_to_json(
        sheetPermissions,
        {
          defval: "",
          raw: false,
          dateNF: "mm-dd-yyyy",
        },
      );

      const cleanedPermissions: RosterPermissionTypePost[] =
        sheetDataPermissions.map((item) => {
          item.permitted_studios = item.permitted_studios?.split(",");
          if (item.start_date === "") item.start_date = undefined;
          if (item.end_date === "") item.end_date = undefined;
          if (item.start_date)
            item.start_date = new Date(item.start_date).toISOString();
          if (item.end_date)
            item.end_date = new Date(item.end_date).toISOString();
          return item;
        });

      let currentPermissionsProgress = 0;

      await Promise.all(
        cleanedPermissions.map(async (row) => {
          await createRosterPermissionAction(JSON.parse(JSON.stringify(row)));
          currentPermissionsProgress += 1;
          setPermissionsProgress(
            (currentPermissionsProgress / cleanedPermissions.length) * 100,
          );
        }),
      );

      setPermissionData(cleanedPermissions);
      setPermissionUploaded(true);

      const sheetNameRoster = workbook.SheetNames[0];
      const sheetRoster = workbook.Sheets[sheetNameRoster];
      const rawRosterWithoutPermissionId: any[] = XLSX.utils.sheet_to_json(
        sheetRoster,
        {
          defval: "",
        },
      );

      // console.log("roster length: ", rawRosterWithoutPermissionId.length);

      // get the permission IDs by permission code
      const rawRosterWithPermissionId = await Promise.all(
        rawRosterWithoutPermissionId.map(async (item) => {
          const { data: permissions, error } =
            await getPermissionByPermissionCode(item.permission_code);

          if (permissions?.length) {
            item.permissions = [permissions[0].id];
            // console.log(item.permissions);
          } else {
            item.permissions = [];
            // console.log(
            //   "permission_code Not Found in Permissions for",
            //   item.stuName,
            // );
          }
          return item;
        }),
      );

      // console.log(
      //   "entries that found a matched permission: ",
      //   rawRosterWithPermissionId.length,
      // );

      // Combine all records of the same person into one
      const rosterWithUniqueUsers: RosterRecordType[] = [];

      // loop through all roster entries
      rawRosterWithPermissionId.map((rawRosterEntry) => {
        // skip the entry if the student number is already in the unque list
        if (
          rawRosterEntry.permissions.length === 0 ||
          rawRosterEntry.stu_n === "" ||
          rosterWithUniqueUsers
            .map((uniqueRoster) => uniqueRoster.stu_n)
            .includes(rawRosterEntry.stu_n)
        ) {
          return;
        }

        let permissionIdsOfOnePerson: number[] = [];

        // Get all roster entries with non-empty permission id lists of the current student number
        const rosterEntriesOfTheSamePerson = rawRosterWithPermissionId.filter(
          (notUniqueRosterEntry) =>
            // notUniqueRosterEntry.permissions.length !== 0 &&
            // notUniqueRosterEntry.stu_n &&
            notUniqueRosterEntry.stu_n === rawRosterEntry.stu_n,
        );

        // if multiple entries of the same person found, combine the entries' permission into one
        if (rosterEntriesOfTheSamePerson.length > 0) {
          permissionIdsOfOnePerson = permissionIdsOfOnePerson.concat(
            rosterEntriesOfTheSamePerson.map(
              (rosterEntry) => rosterEntry.permissions[0],
            ),
          );
        }

        const newUniqueRosterEntry = {
          ...rawRosterEntry,
          permissions: [...permissionIdsOfOnePerson],
        };

        //double check if the student number is already in the unique list
        if (
          !rosterWithUniqueUsers
            .map((i) => i.stu_n)
            .includes(newUniqueRosterEntry.stu_n)
        ) {
          rosterWithUniqueUsers.push(newUniqueRosterEntry);
        }
      });

      let currentRosterProgress = 0;

      await Promise.all(
        rosterWithUniqueUsers.map(async (uniqueUserRosterEntry) => {
          delete uniqueUserRosterEntry.permission_code;
          const { res, error } = await createRosterAction(
            JSON.parse(JSON.stringify(uniqueUserRosterEntry)),
          );
          // console.log("res is ", res);
          if (error) {
            throw Error("Error creating roster");
          }
          currentRosterProgress += 1;
          setRosterProgress(
            (currentRosterProgress / rosterWithUniqueUsers.length) * 100,
          );
        }),
      );

      // const cleanedRoseter = rosterWithUniqueUsers.map(
      //   (uniqueUserRosterEntry as Prisma.rostersCreateInput) => {
      //     delete uniqueUserRosterEntry.permission_code;
      //     if (
      //       uniqueUserRosterEntry.permissions &&
      //       uniqueUserRosterEntry.permissions[0]
      //     ) {
      //       uniqueUserRosterEntry.permissions =
      //         uniqueUserRosterEntry.permissions.map((i) => ({ id: i }));
      //     }
      //     return JSON.parse(JSON.stringify(uniqueUserRosterEntry));
      //   },
      // );

      // const { res, error } = await createManyRosterAction(cleanedRoseter);

      setRosterData(rosterWithUniqueUsers);
      setRosterUploaded(true);
    };

    if (file) reader.readAsArrayBuffer(file);
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
