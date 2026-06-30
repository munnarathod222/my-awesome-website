import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Generate a unique 32-character URL-safe random token
 */
function generateInvitationToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * POST /send-invitation
 * Send an invitation to a new user
 * Body: { email, role }
 * Auth: Required (admin or super_admin role)
 */
router.post('/send-invitation', async (req, res) => {
  const { email, role } = req.body;

  // Validate authentication
  if (!req.auth || !req.auth.id) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  // Validate required fields
  if (!email || !role) {
    return res.status(400).json({
      error: 'email and role are required',
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
    });
  }

  try {
    // Check user role (admin or super_admin)
    const user = await pb.collection('users').getOne(req.auth.id);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions to send invitations' });
    }

    // Check if user already exists in users collection
    let existingUser = null;
    try {
      existingUser = await pb.collection('users').getFirstListItem(`email="${email}"`);
    } catch (error) {
      // User not found is expected, continue
      if (!error.message.includes('Failed to find')) {
        throw error;
      }
    }

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
      });
    }

    // Generate unique invitation token
    const invitationToken = generateInvitationToken();

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation record in PocketBase
    const invitation = await pb.collection('invitations').create({
      email,
      role,
      invitation_token: invitationToken,
      status: 'pending',
      invited_by: req.auth.id,
      expires_at: expiresAt.toISOString(),
    });

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${invitationToken}`;

    // Send invitation email via SMTP
    const emailSubject = 'You have been invited to join Jaibhavani Cargo';
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { margin-bottom: 20px; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            .expiry-notice { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>You're Invited!</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have been invited to join our platform with the role: <strong>${role}</strong></p>
              <p>Click the button below to accept your invitation and create your account:</p>
              <a href="${invitationLink}" class="button">Accept Invitation</a>
              <p>Or copy and paste this link in your browser:</p>
              <p><code>${invitationLink}</code></p>
              <div class="expiry-notice">
                <strong>Note:</strong> This invitation will expire on ${expiresAt.toLocaleDateString()}. Please accept it before then.
              </div>
            </div>
            <div class="footer">
              <p>If you did not expect this invitation, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Local development bypass if SMTP credentials are not configured
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      logger.warn(`No SMTP mail credentials found in .env. Skipping email delivery and logging link for local testing:`);
      logger.warn(`👉 ${invitationLink}`);
      
      return res.status(200).json({
        success: true,
        message: 'Local testing mode: Invitation created (email delivery skipped)',
        invitationId: invitation.id,
        debugLink: invitationLink
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.MAIL_PORT || '465'),
        secure: process.env.MAIL_SECURE !== 'false', // default to true (SSL/TLS)
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'Jaibhavani Cargo'}" <${process.env.MAIL_USER}>`,
        to: email,
        subject: emailSubject,
        html: emailBody,
      });

      logger.info(`Invitation created and sent to ${email} with token ${invitationToken} by user ${req.auth.id}`);

      return res.status(200).json({
        success: true,
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
      });
    } catch (emailError) {
      logger.error('Failed to send invitation email via SMTP:', emailError);
      
      // Rollback database transaction: delete invitation record
      try {
        await pb.collection('invitations').delete(invitation.id);
      } catch (deleteError) {
        logger.error('Failed to delete failed invitation record:', deleteError);
      }

      return res.status(500).json({
        error: `Failed to send invitation email: ${emailError.message || emailError}`,
      });
    }
  } catch (error) {
    logger.error('Error in send-invitation route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;