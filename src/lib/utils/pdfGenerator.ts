// PDF Generation utility for proposals
// Using html2canvas and jsPDF for client-side PDF generation

export interface PdfGenerationOptions {
  filename?: string;
  title?: string;
  margin?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export interface ProposalPdfData {
  templateContent: any;
  opportunityData: any;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };
}

export class PdfGenerator {
  private static async loadDependencies() {
    // Dynamic import to avoid loading PDF libraries unless needed
    const [jsPDF, html2canvas] = await Promise.all([
      import('jspdf').then(m => m.default),
      import('html2canvas').then(m => m.default)
    ]);
    return { jsPDF, html2canvas };
  }

  static async generateFromHtml(
    htmlElement: HTMLElement,
    options: PdfGenerationOptions = {}
  ): Promise<Blob> {
    try {
      const { jsPDF, html2canvas } = await this.loadDependencies();
      
      const {
        filename = 'proposal.pdf',
        margin = 20,
        format = 'a4',
        orientation = 'portrait'
      } = options;

      // Capture the HTML element as canvas
      const canvas = await html2canvas(htmlElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = format === 'a4' ? 210 - (margin * 2) : 216 - (margin * 2);
      const pageHeight = format === 'a4' ? 297 : 279;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - (margin * 2);

      // Add additional pages if content is tall
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - (margin * 2);
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static async generateProposalPdf(
    data: ProposalPdfData,
    options: PdfGenerationOptions = {}
  ): Promise<Blob> {
    // Create temporary HTML element for PDF generation
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';

    // Generate HTML content
    tempDiv.innerHTML = this.generateProposalHtml(data);
    
    document.body.appendChild(tempDiv);

    try {
      const pdfBlob = await this.generateFromHtml(tempDiv, options);
      return pdfBlob;
    } finally {
      // Clean up
      document.body.removeChild(tempDiv);
    }
  }

  private static generateProposalHtml(data: ProposalPdfData): string {
    const { templateContent, opportunityData, companyInfo } = data;
    
    return `
      <div style="max-width: 100%; margin: 0 auto;">
        ${companyInfo ? this.generateHeaderHtml(companyInfo) : ''}
        
        <div style="margin: 40px 0;">
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #1f2937;">
            Event Proposal
          </h1>
          <p style="color: #6b7280; margin-bottom: 30px;">
            Prepared for ${opportunityData.contact?.name || 'Valued Client'}
          </p>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 18px; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
            Event Details
          </h2>
          ${this.generateEventDetailsHtml(opportunityData)}
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 18px; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
            Proposal Content
          </h2>
          ${this.generateTemplateContentHtml(templateContent, opportunityData)}
        </div>

        <div style="margin-top: 60px;">
          <h2 style="font-size: 18px; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
            Investment
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #059669;">
              €${opportunityData.value?.toLocaleString() || '0'}
            </div>
            <div style="color: #6b7280; margin-top: 5px;">
              Total Investment
            </div>
          </div>
        </div>

        ${this.generateFooterHtml(companyInfo)}
      </div>
    `;
  }

  private static generateHeaderHtml(companyInfo: any): string {
    return `
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        ${companyInfo.logo ? `<img src="${companyInfo.logo}" alt="${companyInfo.name}" style="max-height: 60px; margin-bottom: 20px;" />` : ''}
        <h1 style="font-size: 24px; margin: 0; color: #1f2937;">${companyInfo.name}</h1>
        ${companyInfo.address ? `<p style="margin: 5px 0; color: #6b7280;">${companyInfo.address}</p>` : ''}
        <div style="margin-top: 10px;">
          ${companyInfo.phone ? `<span style="color: #6b7280; margin-right: 20px;">📞 ${companyInfo.phone}</span>` : ''}
          ${companyInfo.email ? `<span style="color: #6b7280;">📧 ${companyInfo.email}</span>` : ''}
        </div>
      </div>
    `;
  }

  private static generateEventDetailsHtml(opportunityData: any): string {
    const eventDate = opportunityData.eventDate ? new Date(opportunityData.eventDate).toLocaleDateString() : 'TBD';
    
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <strong>Event Type:</strong> ${opportunityData.eventType || 'Not specified'}<br>
          <strong>Date:</strong> ${eventDate}<br>
          <strong>Guest Count:</strong> ${opportunityData.guestCount || 'TBD'}
        </div>
        <div>
          <strong>Venue:</strong> ${opportunityData.roomAssignment || 'TBD'}<br>
          <strong>Catering:</strong> ${opportunityData.requiresCatering ? 'Yes' : 'No'}<br>
          <strong>Contact:</strong> ${opportunityData.contact?.name || 'N/A'}
        </div>
      </div>
      ${opportunityData.venueRequirements ? `
        <div style="margin-top: 15px;">
          <strong>Special Requirements:</strong><br>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 5px;">
            ${opportunityData.venueRequirements}
          </div>
        </div>
      ` : ''}
    `;
  }

  private static generateTemplateContentHtml(templateContent: any, opportunityData: any): string {
    if (!templateContent || !templateContent.sections) {
      return '<p>Template content not available.</p>';
    }

    return templateContent.sections.map((section: any) => `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 10px; color: #374151;">
          ${section.title || 'Section'}
        </h3>
        <div style="color: #4b5563;">
          ${this.processTemplateContent(section.content || '', opportunityData)}
        </div>
      </div>
    `).join('');
  }

  private static generateFooterHtml(companyInfo: any): string {
    return `
      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This proposal is valid for 30 days from the date of generation.</p>
        <p>Thank you for considering our services for your special event.</p>
        ${companyInfo ? `<p style="margin-top: 20px;">${companyInfo.name} | ${companyInfo.email || ''}</p>` : ''}
      </div>
    `;
  }

  private static processTemplateContent(content: string, opportunityData: any): string {
    // Replace dynamic fields in template content
    const replacements: Record<string, string> = {
      '{{opportunity.name}}': opportunityData.name || '',
      '{{opportunity.eventType}}': opportunityData.eventType || '',
      '{{opportunity.guestCount}}': opportunityData.guestCount?.toString() || '',
      '{{opportunity.value}}': opportunityData.value ? `€${opportunityData.value.toLocaleString()}` : '',
      '{{opportunity.eventDate}}': opportunityData.eventDate ? new Date(opportunityData.eventDate).toLocaleDateString() : '',
      '{{contact.name}}': opportunityData.contact?.name || '',
      '{{contact.company}}': opportunityData.contact?.company || '',
      '{{contact.email}}': opportunityData.contact?.email || '',
      '{{venue.room}}': opportunityData.roomAssignment || '',
      '{{venue.requirements}}': opportunityData.venueRequirements || '',
    };

    let processedContent = content;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedContent;
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}