// src/components/Guard.tsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";
import type { ReactElement } from "react";

export default function Guard({ children }: { children: ReactElement }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
