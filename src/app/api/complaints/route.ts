import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import path from 'path';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

// GET - Fetch customer's complaints
export async function GET(request: NextRequest) {
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
    const userId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;

    // Fetch complaints
    const [complaints, totalComplaints] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.complaint.count({ where })
    ]);

    const totalPages = Math.ceil(totalComplaints / limit);

    return NextResponse.json({
      success: true,
      complaints,
      pagination: {
        currentPage: page,
        totalPages,
        totalComplaints,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch complaints' 
    }, { status: 500 });
  }
}

// POST - Create new complaint
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Complaint API - POST request received');
    
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = parseInt(decoded.id || decoded.userId);
    
    console.log('🔍 Decoded token:', { id: decoded.id, userId: decoded.userId, email: decoded.email });
    console.log('🔍 Using user ID:', userId);

    // Parse FormData
    const formData = await request.formData();
    console.log('🔍 FormData keys:', Array.from(formData.keys()));
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string || 'service';
    const priority = formData.get('priority') as string || 'medium';
    const affectedService = formData.get('affectedService') as string;
    const orderId = formData.get('orderId') as string;

    console.log('🔍 Parsed data:', { title, description, category, priority, affectedService, orderId });

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title and description are required' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['service', 'delivery', 'medication', 'billing', 'website', 'staff', 'other'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid category' 
      }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid priority' 
      }, { status: 400 });
    }

    // Handle file uploads (if any)
    let fileUrl = null;
    const files = formData.getAll('file_0') as File[];
    if (files.length > 0 && files[0].size > 0) {
      const file = files[0];
      console.log('🔍 File uploaded:', file.name, file.size);
      
      // Create safe filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      
      try {
        // Save file to public/uploads/complaints
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'complaints');
        const filePath = path.join(uploadDir, fileName);
        
        // Convert file to buffer and save
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        
        fileUrl = `/uploads/complaints/${fileName}`;
        console.log('✅ File saved to:', filePath);
      } catch (fileError) {
        console.error('❌ Error saving file:', fileError);
        // Continue without file if upload fails
      }
    }

    // Create complaint
    const complaintData: any = {
      userId,
      title: title.trim(),
      description: description.trim(),
      category: category || 'service',
      priority: priority || 'medium',
      status: 'pending'
    };

    // Add optional fields
    if (fileUrl) complaintData.fileUrl = fileUrl;
    if (affectedService) complaintData.affectedService = affectedService;
    if (orderId) complaintData.orderId = parseInt(orderId);

    console.log('🔍 Creating complaint with data:', complaintData);

    const complaint = await prisma.complaint.create({
      data: complaintData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint }
    });

  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit complaint' 
    }, { status: 500 });
  }
}
