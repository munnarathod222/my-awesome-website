/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const email = e.record.get("email");
  const invitationToken = e.record.get("invitation_token");
  const expiresAt = e.record.get("expires_at");
  const role = e.record.get("role");
  const invitedByName = e.record.get("invited_by_name") || e.record.get("invited_by") || "Administrator";
  
  // Generate invitation link with token
  const appDomain = "https://yourdomain.com"; // Replace with your actual domain
  const invitationLink = appDomain + "/accept-invitation?token=" + invitationToken;
  
  // Format expiration date for display
  const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  // Create email message
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: email }],
    subject: "You've been invited to join our platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You've been invited!</h2>
        <p>Hello,</p>
        <p><strong>${invitedByName}</strong> has invited you to join our transportation management platform with the role of <strong>${role}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0;">Click the button below to accept your invitation:</p>
          <a href="${invitationLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">Or copy this link: <br/><span style="word-break: break-all;">${invitationLink}</span></p>
        </div>
        
        <p><strong>Invitation Details:</strong></p>
        <ul style="color: #666;">
          <li>Role: ${role}</li>
          <li>Expires: ${expirationDate}</li>
        </ul>
        
        <p style="color: #666; font-size: 14px;">If you have any questions or need assistance, please contact our support team at support@yourdomain.com</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `
  });
  
  try {
    $app.newMailClient().send(message);
  } catch (error) {
    throw new BadRequestError("Failed to send invitation email: " + error.message);
  }
  
  e.next();
}, "invitations");