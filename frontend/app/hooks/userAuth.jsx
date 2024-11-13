"use client";
import { useSelector } from "react-redux";

export default function userAuth() {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return true;
  } else {
    return false;
  }
}
