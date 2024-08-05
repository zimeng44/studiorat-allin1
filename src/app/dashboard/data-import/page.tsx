import React from "react";
import FileInput from "./FileInput";
import { cookies } from "next/headers";

const page = () => {
  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) {
    console.error("JWT cookie not found");
    return <p>You're not authorized.</p>;
  }

  return (
    <div>
      <h1>Import Excel Data in React.js</h1>
      <FileInput authToken={jwtCookie?.value ?? ""} />
    </div>
  );
};

export default page;
