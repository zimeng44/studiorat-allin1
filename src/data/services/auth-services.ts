import { getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./get-token";
import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);
const EXPIRE = new Date(Date.now() + 60 * 1000 * 60 * 24 * 7); // 1 week

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7 days")
    .sign(key);
}

export async function decrypt(input?: string): Promise<any> {
  if (!input || input === "") return { user: null, Expire: null };
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

async function getUserByIdentifier(identifier: string) {
  try {
    const user = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: identifier, mode: "insensitive" } },
          { net_id: { contains: identifier, mode: "insensitive" } },
        ],
      },
      include: { user_role: true },
    });
    // console.log(user);
    return user[0];
  } catch (error) {
    // console.log(error);
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
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
  try {
    const user = await getUserByIdentifier(userData.identifier);
    // const expires = new Date(Date.now() + 60 * 1000 * 60 * 24 * 7);
    const jwt = await encrypt({ user, EXPIRE });
    // console.log(jwt);

    return { jwt: jwt, user: user };
  } catch (error) {
    return { error: error };
  }

  // Create the session

  // const url = new URL("/api/auth/local", baseUrl);

  // console.log("user data is !!!!!!!!!!!!!!!", userData);

  // try {
  //   const response = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ ...userData }),
  //     cache: "no-cache",
  //   });

  //   return response.json();
  // } catch (error) {
  //   console.error("Login Service Error:", error);
  //   throw error;
  // }
}

export async function verifyUserService(jwt: string) {
  // Refresh the session so it doesn't expire
  if (!jwt || jwt === "")
    return { ok: false, data: null, error: "jwt not found" };

  try {
    const { user, EXPIRE: currentExpire } = await decrypt(jwt);
    // console.log(user);
    if (new Date(currentExpire).toISOString() <= new Date().toISOString())
      return { ok: false, data: null, error: "JWT expired" };

    // console.log(new Date(currentExpire).toISOString());

    const userInDb = await getUserByIdentifier(user.net_id);

    // const expires = new Date(Date.now() + 60 * 1000 * 60 * 24 * 7);
    // const jwtDb = await encrypt({ userInDb, EXPIRE });

    if (userInDb) return { ok: true, data: userInDb, error: null };

    return { ok: false, data: null, error: "jwt auth failed" };
  } catch (error) {
    return { ok: false, data: null, error: error };
  }

  // parsed.expires = new Date(Date.now() + 10 * 1000);
  // const res = NextResponse.next();
  // res.cookies.set({
  //   name: "session",
  //   value: await encrypt(parsed),
  //   httpOnly: true,
  //   expires: parsed.expires,
  // // });
  // return res;
}
