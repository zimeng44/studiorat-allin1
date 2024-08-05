"use client";
import React from "react";
import { useState } from "react";
import PaginationControls from "@/components/custom/PaginationControls";
import { RosterRecordType } from "@/data/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rosterColumnsDefault, TableColumnStatus } from "./rosterColumns";
// import RosterTable from "./RosterTable";
import TabHeader from "./TabHeader";
import { Grid, List } from "lucide-react";
import RosterTable from "./rosterTable";

interface ViewTabsProps {
  data: any[];
  meta: { pagination: { pageCount: number; total: number } };
  filter: {};
}

function LinkCard(item: Readonly<RosterRecordType>) {
  return (
    <Link href={`/dashboard/roster/${item.id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {item.stuName || "Student Name"}
            {/* {item.model || "Model"} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 w-full leading-7">{item.academicProgram ?? ""}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

const RosterPageTabs = ({ data, meta, filter }: ViewTabsProps) => {
  const [columnsStatus, setColumnsStatus] = useState<TableColumnStatus>(
    structuredClone(rosterColumnsDefault),
  );
  return (
    <div className="py-2">
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between">
          <h1 className="left-content text-lg font-bold">Roster</h1>
          <div className="right-content">
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-1 h-4 w-4" />
                {/* List */}
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="mr-1 h-4 w-4" />
                {/* Grid */}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabHeader
          columnsStatus={columnsStatus}
          filter={filter}
          setColumnsStatus={setColumnsStatus}
        />

        <TabsContent value="list">
          <RosterTable data={data} columnsStatus={columnsStatus} />
        </TabsContent>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: RosterRecordType) => (
              <LinkCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end space-x-2 py-2">
        <PaginationControls
          pageCount={meta.pagination.pageCount}
          totalEntries={meta.pagination.total}
        />
      </div>
    </div>
  );
};

export default RosterPageTabs;
