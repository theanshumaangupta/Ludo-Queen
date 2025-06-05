import { redirect } from "next/navigation"; // use this in app directory
import { getServerSession } from "next-auth";
import authConfig from "../auth-config";

export default async function AuthProtected(params: any) {
  const session = await getServerSession(authConfig);
  if (!session) {
    redirect("/api/auth/signin"); // or your custom sign-in route
  }

  return params.children; // allow rendering if session exists
}
