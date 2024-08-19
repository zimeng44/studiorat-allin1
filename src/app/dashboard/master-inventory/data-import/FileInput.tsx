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
import { useState } from "react";
import React from "react";
import * as XLSX from "xlsx";
import { Progress } from "@/components/ui/progress";
import {
  createInventoryItemAction,
  createManyInventoryItemAction,
} from "@/data/actions/inventory-actions";
import { inventory_items } from "@prisma/client";

function FileInput({ authToken }: { authToken: string }) {
  const [inventoryData, setInventoryData] = useState<inventory_items[]>();
  // const [rosterData, setRosterData] = useState<RosterRecordType[]>();
  const [permissionUploaded, setPermissionUploaded] = useState(false);
  // const [rosterUploaded, setRosterUploaded] = useState(false);
  const [permissionsProgress, setPermissionsProgress] = useState(0);
  // const [rosterProgress, setRosterProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Initialize state variables for both permissions and roster
    setPermissionUploaded(false);
    setPermissionsProgress(0);
    setInventoryData(undefined);
    // setRosterUploaded(false);
    // setRosterProgress(0);
    // setRosterData(undefined);

    // Get the file
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target?.result, {
        type: "binary",
      });

      // Process Permissions
      const sheetNameInventory = workbook.SheetNames[0];
      const sheetInventory = workbook.Sheets[sheetNameInventory];
      const sheetDataInventory: any[] = XLSX.utils.sheet_to_json(
        sheetInventory,
        {
          defval: "",
          raw: false,
          dateNF: "mm-dd-yyyy",
        },
      );

      // console.log(sheetDataInventory);

      const cleanedInventory: inventory_items[] = sheetDataInventory.map(
        (row) => {
          for (const [key, value] of Object.entries(row)) {
            if (value === "") row[key] = undefined;
          }
          return row;
        },
      );

      let currentPermissionsProgress = 0;

      // await Promise.all(
      //   cleanedInventory.map(async (row) => {
      //     await createInventoryItemAction(JSON.parse(JSON.stringify(row)));
      //     currentPermissionsProgress += 1;
      //     setPermissionsProgress(
      //       (currentPermissionsProgress / cleanedInventory.length) * 100,
      //     );
      //   }),
      // );
      await createManyInventoryItemAction(cleanedInventory);

      setInventoryData(cleanedInventory);
      setPermissionUploaded(true);
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
      {permissionsProgress > 0 ? (
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
        </div>
      ) : (
        ``
      )}
      <input className="flex-1 p-2" type="file" onChange={handleFileUpload} />

      {inventoryData && (
        <div className="flex-1 p-2">
          <h2 className="p2">Sample From Imported Permission:</h2>
          {/* <pre>{JSON.stringify(inventoryData, null, 2)}</pre> */}
          <Table className="max-w-xl">
            <TableHeader>
              <TableRow>
                {inventoryData.length
                  ? Object.keys(inventoryData[0]).map((field) => (
                      <TableHead>{field}</TableHead>
                    ))
                  : ``}
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.length
                ? inventoryData.length > 5
                  ? inventoryData
                      .slice(0, 5)
                      .map((row) => Object.values(row))
                      .map((fields) => (
                        <TableRow>
                          {fields.map((field) => (
                            <TableCell>{field as string}</TableCell>
                          ))}
                        </TableRow>
                      ))
                  : inventoryData
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
    </div>
  );
}

export default FileInput;
