import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  // alert("Login request received:", { email, password });
  // Validate input
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "Invalid input." }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  // Find user and include their role
  console.log("Attempting to log in user:");
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
  //console.log("User found:", user ? { id: user.id, role: user.role?.name } : "No user found");

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  // Prevent admin login from this endpoint (optional, remove if not needed)
  if (user.role?.name === "admin") {
    return NextResponse.json({ message: "Access denied." }, { status: 403 });
  }

  // Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
  // console.log("User authenticated:");
  // Set a simple session cookie (replace with secure JWT/session logic in production)
  cookies().set("session", JSON.stringify({ id: user.id, role: user.role?.name }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ message: "Login successful" });
}