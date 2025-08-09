// Email service utility for proposal delivery
// This would integrate with Resend or similar email service

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface ProposalEmailData {
  proposalId: string;
  clientName: string;
  clientEmail: string;
  proposalTitle: string;
  opportunityName: string;
  customMessage?: string;
  companyName: string;
  portalUrl: string;
  expiresAt?: number;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'proposals@eventrunner.com';
  private static readonly FROM_NAME = 'EventRunner Proposals';

  static generateProposalEmail(data: ProposalEmailData): EmailTemplate {
    const {
      clientName,
      proposalTitle,
      opportunityName,
      customMessage,
      companyName,
      portalUrl,
      expiresAt
    } = data;

    const expirationText = expiresAt 
      ? `This proposal expires on ${new Date(expiresAt).toLocaleDateString()}.`
      : '';

    const subject = `Proposal for ${opportunityName} - ${companyName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #e2e8f0;
          }
          .header h1 {
            color: #1e293b;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: #64748b;
            margin: 0;
            font-size: 16px;
          }
          .greeting {
            margin-bottom: 30px;
          }
          .greeting h2 {
            color: #334155;
            margin: 0 0 15px 0;
            font-size: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .custom-message {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .cta {
            text-align: center;
            margin: 40px 0;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background: #2563eb;
          }
          .details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .details h3 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 16px;
          }
          .details p {
            margin: 5px 0;
            color: #475569;
          }
          .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
          .expiration {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
            <p>Professional Event Services</p>
          </div>

          <div class="greeting">
            <h2>Dear ${clientName},</h2>
          </div>

          <div class="content">
            <p>Thank you for considering <strong>${companyName}</strong> for your upcoming event. We're excited to present our proposal for <strong>${opportunityName}</strong>.</p>
            
            ${customMessage ? `
              <div class="custom-message">
                ${customMessage.replace(/\n/g, '<br>')}
              </div>
            ` : ''}

            <div class="details">
              <h3>Proposal Details</h3>
              <p><strong>Event:</strong> ${opportunityName}</p>
              <p><strong>Proposal:</strong> ${proposalTitle}</p>
              ${expirationText ? `<p><strong>Valid Until:</strong> ${new Date(expiresAt!).toLocaleDateString()}</p>` : ''}
            </div>

            <p>You can review the complete proposal, including detailed pricing and event specifications, through our secure client portal.</p>

            ${expirationText ? `
              <div class="expiration">
                ⏰ <strong>Time-Sensitive:</strong> ${expirationText}
              </div>
            ` : ''}
          </div>

          <div class="cta">
            <a href="${portalUrl}" class="cta-button">
              📋 View Proposal
            </a>
          </div>

          <div class="content">
            <p>If you have any questions about the proposal or would like to discuss any details, please don't hesitate to reach out to us directly.</p>
            
            <p>We look forward to working with you to create an exceptional event experience.</p>
            
            <p>Best regards,<br>
            The ${companyName} Team</p>
          </div>

          <div class="footer">
            <p>This email was sent regarding your inquiry about ${opportunityName}.</p>
            <p>If you didn't request this proposal, please ignore this email.</p>
            <p><strong>${companyName}</strong> | Professional Event Services</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Dear ${clientName},

Thank you for considering ${companyName} for your upcoming event. We're excited to present our proposal for ${opportunityName}.

${customMessage ? `\n${customMessage}\n` : ''}

Proposal Details:
- Event: ${opportunityName}
- Proposal: ${proposalTitle}
${expirationText ? `- Valid Until: ${new Date(expiresAt!).toLocaleDateString()}` : ''}

You can review the complete proposal through our secure client portal:
${portalUrl}

${expirationText ? `\n⏰ Time-Sensitive: ${expirationText}\n` : ''}

If you have any questions about the proposal or would like to discuss any details, please don't hesitate to reach out to us directly.

We look forward to working with you to create an exceptional event experience.

Best regards,
The ${companyName} Team

---
This email was sent regarding your inquiry about ${opportunityName}.
If you didn't request this proposal, please ignore this email.
${companyName} | Professional Event Services
    `.trim();

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  static generateFollowUpEmail(data: ProposalEmailData & { daysSinceSent: number }): EmailTemplate {
    const { clientName, proposalTitle, opportunityName, companyName, portalUrl, daysSinceSent } = data;
    
    const subject = `Follow-up: Proposal for ${opportunityName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
          </div>

          <h2>Dear ${clientName},</h2>

          <p>I wanted to follow up on the proposal we sent ${daysSinceSent} days ago for <strong>${opportunityName}</strong>.</p>

          <p>I hope you've had a chance to review our proposal. If you have any questions or would like to discuss any aspects of the event planning, I'd be happy to schedule a call or meeting at your convenience.</p>

          <div style="text-align: center;">
            <a href="${portalUrl}" class="cta-button">Review Proposal</a>
          </div>

          <p>We're committed to making your event exceptional and would love the opportunity to work with you.</p>

          <p>Best regards,<br>The ${companyName} Team</p>

          <div class="footer">
            <p>${companyName} | Professional Event Services</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Dear ${clientName},

I wanted to follow up on the proposal we sent ${daysSinceSent} days ago for ${opportunityName}.

I hope you've had a chance to review our proposal. If you have any questions or would like to discuss any aspects of the event planning, I'd be happy to schedule a call or meeting at your convenience.

You can review the proposal at: ${portalUrl}

We're committed to making your event exceptional and would love the opportunity to work with you.

Best regards,
The ${companyName} Team

${companyName} | Professional Event Services
    `.trim();

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  // This would integrate with Resend API in a real implementation
  static async sendEmail(
    to: string,
    template: EmailTemplate,
    from: string = this.FROM_EMAIL,
    fromName: string = this.FROM_NAME
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In a real implementation, this would use Resend SDK
      console.log('Sending email:', {
        to,
        from: `${fromName} <${from}>`,
        subject: template.subject,
        // Would send both HTML and text versions
      });

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate secure client portal URL
  static generatePortalUrl(clientAccessToken: string): string {
    // In a real implementation, this would point to your actual domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/portal/${clientAccessToken}`;
  }
}

// Email templates for different proposal statuses
export const EMAIL_TEMPLATES = {
  PROPOSAL_SENT: 'proposal_sent',
  FOLLOW_UP_3_DAYS: 'follow_up_3_days',
  FOLLOW_UP_7_DAYS: 'follow_up_7_days',
  FOLLOW_UP_14_DAYS: 'follow_up_14_days',
  EXPIRATION_WARNING: 'expiration_warning',
} as const;