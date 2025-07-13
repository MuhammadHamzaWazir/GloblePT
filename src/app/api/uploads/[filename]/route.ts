import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Get the JWT token from cookies
    const token = request.cookies.get('pharmacy_auth')?.value;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Only allow admin users to view uploaded documents
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: "Access denied. Admin only." }, { status: 403 });
    }

    // Construct file path
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    try {
      // Read the file
      const fileBuffer = await readFile(filePath);
      
      // Determine content type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
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
        case 'webp':
          contentType = 'image/webp';
          break;
      }
      
      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour but only privately
        },
      });
      
    } catch (fileError) {
      console.error('File not found:', filename);
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
