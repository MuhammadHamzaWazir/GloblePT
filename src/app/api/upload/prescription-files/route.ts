import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Get the form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No files uploaded' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log('Uploads directory already exists or created');
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size === 0) continue;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          success: false, 
          message: `File type ${file.type} is not allowed. Please upload images (JPG, PNG, GIF) or PDF files.` 
        }, { status: 400 });
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ 
          success: false, 
          message: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.name);
      const fileName = `${userId}_${timestamp}_${randomStr}${fileExtension}`;
      
      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadsDir, fileName);
      
      await writeFile(filePath, buffer);
      
      // Create file URL for database storage
      const fileUrl = `/uploads/prescriptions/${fileName}`;
      
      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size
      });
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to upload files" 
    }, { status: 500 });
  }
}
