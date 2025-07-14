import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Prescription Upload API - POST request received');
    
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;
    
    console.log('🔍 Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ No authentication token found');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid authentication token');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid authentication token' 
      }, { status: 401 });
    }
    const userId = parseInt(decoded.id);
    
    console.log('🔍 Decoded user ID:', userId);    console.log('🔍 Decoded user ID:', userId);

    const formData = await request.formData();
    console.log('🔍 FormData keys:', Array.from(formData.keys()));
    
    // Get all uploaded files
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('prescription_') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: "No files uploaded" 
      }, { status: 400 });
    }

    console.log('🔍 Number of files received:', files.length);

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ 
          success: false,
          message: `Invalid file type: ${file.type}. Please upload only images (JPG, PNG, GIF) or PDF files.` 
        }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({ 
          success: false,
          message: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 });
      }
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'prescriptions');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const savedPrescriptions = [];

    // Get user data for delivery address
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { address: true }
    });

    // Save files and create database records
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${userId}_${timestamp}_${originalName}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      await writeFile(filepath, buffer);
      console.log('✅ File saved to:', filepath);

      // Create database record
      const prescription = await prisma.prescription.create({
        data: {
          userId: userId,
          medicine: 'Prescription Upload', // Will be filled by pharmacist
          quantity: 1,
          amount: 0, // Will be set after review
          deliveryAddress: userData?.address || '',
          status: 'pending',
          paymentStatus: 'unpaid',
          prescriptionText: `Uploaded file: ${originalName} - File path: /uploads/prescriptions/${filename}`,
          medicineType: 'POM', // Assume prescription only medicine for uploaded prescriptions
          requiresPrescription: true,
          pharmacistApprovalRequired: true
        }
      });

      savedPrescriptions.push({
        id: prescription.id,
        filename: originalName,
        status: 'pending'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} prescription(s)`,
      prescriptions: savedPrescriptions
    });

  } catch (error) {
    console.error('Prescription upload error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Upload failed. Please try again." 
    }, { status: 500 });
  }
}
