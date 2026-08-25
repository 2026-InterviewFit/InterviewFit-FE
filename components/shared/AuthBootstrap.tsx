// components/shared/AuthBootstrap.tsx

"use client";

import {
  useEffect,
} from "react";

import {
  initializeAuth,
} from "@/lib/auth";


export default function AuthBootstrap() {

  useEffect(() => {

    void initializeAuth();

  }, []);


  return null;
}