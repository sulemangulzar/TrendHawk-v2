import { getEmailLayout } from './layout';

/**
 * Email Verification Template
 * @param {string} verificationLink - The link for user to confirm email (e.g., Supabase token link)
 * @returns {string} - The full HTML for the email
 */
export const getVerifyEmailHtml = (verificationLink) => {
  const contentHtml = `
    <h1>Verify Your Identity</h1>
    <p>Welcome to the threshold of market intelligence. To activate your TrendHawk account and begin tracking, please confirm your email address by clicking the button below.</p>
    
    <div style="margin: 32px 0;">
      <a href="${verificationLink}" class="btn">Verify Account</a>
    </div>
    
    <p>If you did not initiate this request, you can safely ignore this communication. The link will remain active for 24 hours.</p>
    
    <p style="margin-top: 32px; font-weight: bold; color: #ffffff;">Standing by,</p>
    <p style="margin-top: -12px;">TrendHawk Operations</p>
  `;

  return getEmailLayout({ 
    title: 'Verify Your Email - TrendHawk', 
    contentHtml 
  });
};

/**
 * Password Reset Template
 */
export const getResetPasswordHtml = (resetLink) => {
  const contentHtml = `
    <h1>Lost Key Recovery</h1>
    <p>We received a request to bypass existing security protocols for your TrendHawk access. Click the link below to initialize a new secure key.</p>
    
    <div style="margin: 32px 0;">
      <a href="${resetLink}" class="btn">Reset Secure Key</a>
    </div>
    
    <p>Unauthorized request? Change your primary account password immediately or contact operations support.</p>
  `;

  return getEmailLayout({ 
    title: 'Identity Recovery - TrendHawk', 
    contentHtml 
  });
};
