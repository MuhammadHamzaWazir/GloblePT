import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
  // Fix: check single role, not roles array
  if (!user || user.role?.name !== "admin") {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
  // Set a simple session cookie (replace with secure JWT/session logic in production)
 // Set a simple session cookie (replace with secure JWT/session logic in production)
  const cookieStore = await cookies();
  cookieStore.set(
    "session",
    JSON.stringify({ id: user.id, role: "admin" }),
    { httpOnly: true, sameSite: "lax", path: "/" }
  );

  // Redirect to admin dashboard after successful login
  return NextResponse.json(
    { message: "Login successful", redirect: "/admin/dashboard" }
  );
}
