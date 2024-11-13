import { redirect } from "next/navigation";
import userAuth from "./userAuth";

export default function Protected({ children }) {
  const isAuthenticated = userAuth();

  return isAuthenticated ? children : redirect("/");
}
