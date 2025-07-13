import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Get the JWT token from cookies
    const cookieHeader = req.headers.get('cookie');
    const token = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('pharmacy_auth='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: "Access denied. Admin only." }, { status: 403 });
    }

    // Get all pending users
    const pendingUsers = await prisma.user.findMany({
      where: {
        accountStatus: 'pending'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        photoIdUrl: true,
        addressProofUrl: true,
        createdAt: true,
        identityVerified: true,
        ageVerified: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users: pendingUsers
    });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, action, rejectionReason } = await req.json();

    // Get the JWT token from cookies
    const cookieHeader = req.headers.get('cookie');
    const token = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('pharmacy_auth='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: "Access denied. Admin only." }, { status: 403 });
    }

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        message: "Invalid request. userId and action (approve/reject) are required." 
      }, { status: 400 });
    }

    // Get the user to be updated
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        accountStatus: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.accountStatus !== 'pending') {
      return NextResponse.json({ 
        message: "User is not in pending status" 
      }, { status: 400 });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        accountStatus: action === 'approve' ? 'verified' : 'blocked',
        identityVerified: action === 'approve',
        identityVerifiedAt: action === 'approve' ? new Date() : null,
        identityVerifiedBy: action === 'approve' ? parseInt(decoded.id) : null,
      }
    });

    // Send email notification
    try {
      const { sendEmail } = await import('@/lib/email');
      
      if (action === 'approve') {
        await sendEmail({
          to: user.email,
          subject: 'Account Approved - Global Pharma Trading',
          text: `Welcome to Global Pharma Trading! Your account has been approved and verified. You can now log in and access our pharmacy services.`,
          html: `
            <h2>Welcome to Global Pharma Trading!</h2>
            <p>Dear ${user.name},</p>
            <p>Great news! Your account has been approved and verified.</p>
            <p><strong>You can now:</strong></p>
            <ul>
              <li>Log in to your account</li>
              <li>Browse our pharmacy services</li>
              <li>Place prescription orders</li>
              <li>Access your customer dashboard</li>
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/login" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
            <p>If you have any questions, please contact our customer service team.</p>
            <p>Best regards,<br>Global Pharma Trading Team</p>
          `
        });
      } else {
        await sendEmail({
          to: user.email,
          subject: 'Account Application Update - Global Pharma Trading',
          text: `Your account application has not been approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''} Please contact customer service if you have questions.`,
          html: `
            <h2>Account Application Update</h2>
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that your account application has not been approved at this time.</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            <p>If you believe this is an error or would like to resubmit your application, please contact our customer service team.</p>
            <p>Best regards,<br>Global Pharma Trading Team</p>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
