import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = parseInt(decoded.userId || decoded.id);

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid authentication' 
      }, { status: 401 });
    }

    const filename = params.filename;
    
    // Security: Check if the file belongs to the user's complaints
    const complaint = await prisma.complaint.findFirst({
      where: {
        userId,
        fileUrl: `/uploads/complaints/${filename}`
      }
    });

    if (!complaint) {
      return NextResponse.json({ 
        success: false, 
        message: 'File not found or access denied' 
      }, { status: 404 });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'complaints', filename);

    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.txt':
          contentType = 'text/plain';
          break;
      }

      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'private, max-age=3600'
        }
      });

    } catch (fileError) {
      console.error('File access error:', fileError);
      return NextResponse.json({ 
        success: false, 
        message: 'File not found' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error serving complaint file:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
