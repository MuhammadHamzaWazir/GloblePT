import { NextResponse } from "next/server";
import { readFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  try {
    // Verify authentication
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const filename = params.filename;
    
    // Security check: verify user owns this file
    const userId = filename.split('_')[0];
    if (parseInt(userId) !== user.id) {
      // Also check if user is admin/staff
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      });
      
      if (!userRecord || !['admin', 'staff'].includes(userRecord.role)) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }
    }

    // Read and serve the file
    const filePath = join(process.cwd(), 'public', 'uploads', 'prescriptions', filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'pdf':
          contentType = 'application/pdf';
          break;
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'private, no-cache'
        }
      });

    } catch (fileError) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ 
      message: "Failed to serve file" 
    }, { status: 500 });
  }
}
