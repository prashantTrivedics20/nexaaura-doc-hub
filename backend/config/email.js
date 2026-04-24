const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Use Gmail or configured email service
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App password for Gmail
      },
    });
  } else {
    // Development mode without email - return mock transporter
    console.log('⚠️  Email not configured - using mock transporter (emails will not be sent)');
    return {
      sendMail: async (mailOptions) => {
        // Extract OTP from subject or text
        const otpMatch = mailOptions.subject?.match(/\d{6}/) || mailOptions.text?.match(/\d{6}/);
        const otp = otpMatch ? otpMatch[0] : 'N/A';
        
        console.log('\n' + '='.repeat(60));
        console.log('📧 MOCK EMAIL - OTP CODE FOR TESTING');
        console.log('='.repeat(60));
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('\n🔑 YOUR OTP CODE:', otp);
        console.log('='.repeat(60) + '\n');
        
        return { messageId: 'mock-' + Date.now() };
      }
    };
  }
};

// Email templates
const emailTemplates = {
  otpVerification: (otp, purpose) => ({
    subject: `DocHub - Your verification code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DocHub - Email Verification</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #0F0F23; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: 700; margin: 0; }
          .content { padding: 40px 30px; color: #FFFFFF; }
          .otp-container { background: #16213E; border: 2px solid #8B5CF6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp { font-size: 36px; font-weight: 700; color: #8B5CF6; letter-spacing: 8px; margin: 20px 0; }
          .footer { padding: 30px; text-align: center; color: #B4B4B8; font-size: 14px; border-top: 1px solid #2D3748; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">DocHub</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Premium Document Platform</p>
          </div>
          
          <div class="content">
            <h2 style="color: #FFFFFF; margin-bottom: 20px;">Email Verification Required</h2>
            <p style="color: #B4B4B8; line-height: 1.6;">
              Please use the following verification code to ${purpose === 'registration' ? 'complete your registration' : purpose === 'login' ? 'sign in to your account' : 'reset your password'}:
            </p>
            
            <div class="otp-container">
              <p style="color: #B4B4B8; margin: 0 0 10px 0;">Your verification code:</p>
              <div class="otp">${otp}</div>
              <p style="color: #B4B4B8; margin: 10px 0 0 0; font-size: 14px;">This code expires in 10 minutes</p>
            </div>
            
            <p style="color: #B4B4B8; line-height: 1.6;">
              If you didn't request this verification code, please ignore this email or contact our support team.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2D3748;">
              <p style="color: #B4B4B8; font-size: 14px; margin: 0;">
                <strong>Security Tips:</strong><br>
                • Never share your verification code with anyone<br>
                • DocHub will never ask for your code via phone or email<br>
                • This code is only valid for 10 minutes
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 DocHub. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      DocHub - Email Verification
      
      Your verification code: ${otp}
      
      Please use this code to ${purpose === 'registration' ? 'complete your registration' : purpose === 'login' ? 'sign in to your account' : 'reset your password'}.
      
      This code expires in 10 minutes.
      
      If you didn't request this code, please ignore this email.
      
      © 2024 DocHub. All rights reserved.
    `
  }),

  welcomeEmail: (username) => ({
    subject: 'Welcome to DocHub - Your Premium Learning Journey Starts Now!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DocHub</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #0F0F23; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 30px; text-align: center; }
          .logo { color: white; font-size: 32px; font-weight: 700; margin: 0; }
          .content { padding: 40px 30px; color: #FFFFFF; }
          .feature-list { list-style: none; padding: 0; }
          .feature-list li { padding: 10px 0; color: #B4B4B8; }
          .feature-list li:before { content: "✓"; color: #10B981; font-weight: bold; margin-right: 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 30px; text-align: center; color: #B4B4B8; font-size: 14px; border-top: 1px solid #2D3748; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">DocHub</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Welcome to Premium Learning</p>
          </div>
          
          <div class="content">
            <h2 style="color: #FFFFFF; margin-bottom: 20px;">Welcome, ${username}! 🎉</h2>
            <p style="color: #B4B4B8; line-height: 1.6;">
              Thank you for joining DocHub! You now have access to our premium document library with cutting-edge programming resources.
            </p>
            
            <h3 style="color: #8B5CF6; margin: 30px 0 20px 0;">What you get with DocHub:</h3>
            <ul class="feature-list">
              <li>Access to premium programming documents</li>
              <li>Latest tutorials on React, Node.js, MongoDB & more</li>
              <li>Data Structures & Algorithms resources</li>
              <li>Regular updates with new content</li>
              <li>Download documents for offline learning</li>
              <li>Priority support from our team</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                Start Learning Now
              </a>
            </div>
            
            <p style="color: #B4B4B8; line-height: 1.6;">
              Ready to master Full Stack development? Explore our comprehensive library and take your skills to the next level!
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 DocHub. All rights reserved.</p>
            <p>Need help? Contact us at support@dochub.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data.otp || data.username, data.purpose);
    
    const mailOptions = {
      from: {
        name: 'DocHub',
        address: process.env.EMAIL_USER || 'noreply@dochub.com'
      },
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};