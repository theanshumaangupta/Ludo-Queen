import { getServerSession } from "next-auth";
import authConfig from "../auth-config";
export default async function AuthProtected(params:any) {
    const session = await getServerSession(authConfig)
        
}