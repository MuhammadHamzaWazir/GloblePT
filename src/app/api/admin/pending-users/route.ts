import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    console.log('🔍 Pending users API - GET request received');
    
    // Authenticate and authorize user
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
    console.log('🔍 Authenticated user:', user ? `${user.name} (${user.role})` : 'None');

    if (!user) {
      console.log('❌ No authentication');
      return NextResponse.json({ 
        success: false,
        message: "Unauthorized" 
      }, { status: 401 });
    }

    if (user.role !== 'admin') {
      console.log('❌ Admin access required');
      return NextResponse.json({ 
        success: false,
        message: "Access denied. Admin only." 
      }, { status: 403 });
    }

    // Get all pending users
    console.log('🔍 Fetching pending users...');
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

    console.log('✅ Found pending users:', pendingUsers.length);

    return NextResponse.json({
      success: true,
      users: pendingUsers
    });

  } catch (error: any) {
    console.error('❌ Error fetching pending users:', error);
    return NextResponse.json({ 
      success: false,
      message: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('🔍 Pending users API - POST request received');
    const { userId, action, rejectionReason } = await req.json();
    console.log('🔍 Request data:', { userId, action, rejectionReason });

    // Authenticate and authorize user
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminUser = verifyToken(token);
    
    if (!adminUser) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    console.log('🔍 Authenticated user:', adminUser ? `${adminUser.name} (${adminUser.role})` : 'None');

    if (!adminUser) {
      console.log('❌ No authentication');
      return NextResponse.json({ 
        success: false,
        message: "Unauthorized" 
      }, { status: 401 });
    }

    if (adminUser.role !== 'admin') {
      console.log('❌ Admin access required');
      return NextResponse.json({ 
        success: false,
        message: "Access denied. Admin only." 
      }, { status: 403 });
    }

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        message: "Invalid request. userId and action (approve/reject) are required." 
      }, { status: 400 });
    }

    // Get the user to be updated
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        accountStatus: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (targetUser.accountStatus !== 'pending') {
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
        identityVerifiedBy: action === 'approve' ? parseInt(adminUser.id.toString()) : null,
      }
    });

    // Send email notification
    try {
      const { sendEmail } = await import('@/lib/email');
      
      if (action === 'approve') {
        await sendEmail({
          to: targetUser.email,
          subject: 'Account Approved - Global Pharma Trading',
          text: `Welcome to Global Pharma Trading! Your account has been approved and verified. You can now log in and access our pharmacy services.`,
          html: `
            <h2>Welcome to Global Pharma Trading!</h2>
            <p>Dear ${targetUser.name},</p>
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
          to: targetUser.email,
          subject: 'Account Application Update - Global Pharma Trading',
          text: `Your account application has not been approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''} Please contact customer service if you have questions.`,
          html: `
            <h2>Account Application Update</h2>
            <p>Dear ${targetUser.name},</p>
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

  } catch (error: any) {
    console.error('❌ Error updating user status:', error);
    return NextResponse.json({ 
      success: false,
      message: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}
