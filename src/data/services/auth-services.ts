"use server";
import { getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./get-token";
import { SignJWT, jwtVerify } from "jose";
import { getUserByIdentifier } from "../loaders";

interface JwtPayload {
  data: {
    net_id: string; // Replace with actual fields in your payload
    [key: string]: any; // Allow additional properties if needed
  };
}

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);
// const EXPIRE = new Date(Date.now() + 60 * 1000 * 60 * 24 * 7); // 1 week

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7 days")
    .sign(key);
}

export async function decrypt(input?: string): Promise<any> {
  if (!input || input === "") return { data: null, EXPIRE: null };
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

interface RegisterUserProps {
  username: string;
  password: string;
  email: string;
}

interface LoginUserProps {
  identifier: string;
  password: string;
}

const baseUrl = getStrapiURL();

export async function registerUserService(userData: RegisterUserProps) {
  const url = new URL("/api/auth/local/register", baseUrl);
  const authToken = await getAuthToken();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    return response.json();
  } catch (error) {
    console.error("Registration Service Error:", error);
  }
}

export async function loginUserService(userData: LoginUserProps) {
  const url = new URL("/api/users/auth", baseUrl);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    const { data, error } = await response.json();

    if (error) return { user: null, jwt: null, error: error };

    const jwt = await encrypt({ data });
    return { jwt: jwt, user: data, error: null };
  } catch (error) {
    console.error("Login User Service Error:", error);
    return { user: null, jwt: null, error: "Error at Login" };
  }
}

export async function verifyUserService(jwt: string) {
  // Refresh the session so it doesn't expire
  if (!jwt || jwt === "")
    return { ok: false, data: null, error: "jwt not found" };

  try {
    const { payload } = (await jwtVerify(jwt, key, {
      algorithms: ["HS256"],
    })) as { payload: JwtPayload };
    const { data: user } = payload;

    if (!user || !user.net_id) {
      return { ok: false, data: null, error: "Invalid user data in token" };
    }

    const { data: userInDb, error } = await getUserByIdentifier(user.net_id);

    if (userInDb) {
      return {
        ok: true,
        data: { ...userInDb, password: null },
        error: null,
      };
    } else {
      return {
        ok: false,
        data: null,
        error: "Error getting user from database: " + error,
      };
    }
  } catch (error) {
    return { ok: false, data: null, error: "Error verifying user: " + error };
  }
}
