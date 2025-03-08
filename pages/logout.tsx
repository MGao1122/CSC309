import Router from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function Logout() {
    const { logout } = useAuth();

    logout();

    Router.push("/login");
}