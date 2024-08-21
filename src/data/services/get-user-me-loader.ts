import { getAuthToken } from "./get-token";
import qs from "qs";
import { verifyUserService } from "./auth-services";

// const query = qs.stringify({
//   populate: {
//     image: { fields: ["url", "alternativeText"] },
//     role: { fields: ["name"] },
//   },
// });

export async function getUserMeLoader(authToken?: string) {
  authToken = authToken ?? (await getAuthToken());

  try {
    return await verifyUserService(authToken ?? "");
  } catch (error) {
    console.log(error);
    return { ok: false, data: null, error: error };
  }
}
