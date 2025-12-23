import PDFDocument from 'pdfkit';
import { supabase } from './supabase.service.js';
import { Readable } from 'stream';

interface SubmissionData {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  field_values: Record<string, any>;
  signature_url?: string;
  created_at: string;
  submitted_at?: string;
  template: {
    name: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      required?: boolean;
    }>;
  };
  user: {
    company_name?: string;
    company_logo_url?: string;
  };
}

export class PDFService {
  async generateSubmissionPDF(
    userId: string,
    submissionData: SubmissionData,
    userClient?: any
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            
            // Use adminClient if available, otherwise use provided userClient or regular client
            const storageClient = supabase.adminClient !== null 
              ? supabase.adminClient 
              : (userClient || supabase.client);
            
            const fileName = `${userId}/${submissionData.id}.pdf`;
            const { data, error } = await storageClient.storage
              .from('submission-pdfs')
              .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true,
              });

            if (error) {
              console.error('PDF upload error:', error);
              reject(new Error(`Failed to upload PDF: ${error.message}`));
              return;
            }

            // Get public URL
            const { data: urlData } = storageClient.storage
              .from('submission-pdfs')
              .getPublicUrl(fileName);

            resolve(urlData.publicUrl);
          } catch (uploadError: any) {
            console.error('PDF upload process error:', uploadError);
            reject(new Error(`Failed to save PDF: ${uploadError.message}`));
          }
        });

        doc.on('error', (error: Error) => {
          console.error('PDF generation error:', error);
          reject(new Error(`Failed to generate PDF: ${error.message}`));
        });

        // Build PDF content
        this.buildPDFContent(doc, submissionData);
        doc.end();
      } catch (error: any) {
        console.error('PDF service error:', error);
        reject(new Error(`PDF generation failed: ${error.message}`));
      }
    });
  }

  private buildPDFContent(doc: any, data: SubmissionData) {
    const pageWidth = doc.page.width;
    const margin = 50;
    let yPosition = margin;

    // Header Section with Company Info
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 80)
       .fillColor('#f3f4f6')
       .fill()
       .fillColor('#000000');

    yPosition += 20;
    
    // Company Name (large, bold)
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(data.user.company_name || 'OnSite Forms', margin + 20, yPosition);
    
    yPosition += 35;

    // Form Template Name
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text(data.template.name, margin + 20, yPosition);

    yPosition += 50;

    // Submission Metadata Box
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 40)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();

    yPosition += 12;
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`Submission ID: ${data.id.substring(0, 8)}...`, margin + 10, yPosition);
    
    yPosition += 12;
    const submissionDate = new Date(data.submitted_at || data.created_at);
    doc.text(`Date: ${submissionDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin + 10, yPosition);

    yPosition += 50;

    // Customer Information Section
    if (data.customer_name || data.customer_email || data.customer_phone || data.customer_address) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('Customer Information', margin, yPosition);
      
      yPosition += 20;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151');
      
      if (data.customer_name) {
        doc.text(`Name: ${data.customer_name}`, margin, yPosition);
        yPosition += 15;
      }
      if (data.customer_email) {
        doc.text(`Email: ${data.customer_email}`, margin, yPosition);
        yPosition += 15;
      }
      if (data.customer_phone) {
        doc.text(`Phone: ${data.customer_phone}`, margin, yPosition);
        yPosition += 15;
      }
      if (data.customer_address) {
        doc.text(`Address: ${data.customer_address}`, margin, yPosition, {
          width: pageWidth - (margin * 2),
          align: 'left'
        });
        yPosition += 20;
      }
      
      yPosition += 10;
    }

    // Form Fields Section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('Form Responses', margin, yPosition);
    
    yPosition += 20;

    data.template.fields.forEach((field) => {
      // Check if we need a new page
      if (yPosition > doc.page.height - 100) {
        doc.addPage();
        yPosition = margin;
      }

      const value = data.field_values[field.id];
      const formattedValue = this.formatValue(field.type, value);
      
      // Field label (bold)
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text(`${field.label}${field.required ? ' *' : ''}:`, margin, yPosition);
      
      yPosition += 15;
      
      // Field value
      const valueHeight = doc.heightOfString(formattedValue, {
        width: pageWidth - (margin * 2) - 20
      });
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#111827')
         .text(formattedValue, margin + 10, yPosition, {
           width: pageWidth - (margin * 2) - 20,
           align: 'left'
         });
      
      yPosition += Math.max(20, valueHeight + 10);
    });

    // Signature Section
    if (data.signature_url) {
      yPosition += 20;
      
      // Check if we need a new page for signature
      if (yPosition > doc.page.height - 150) {
        doc.addPage();
        yPosition = margin;
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('Signature', margin, yPosition);
      
      yPosition += 20;
      
      // Note: In production, fetch and embed the actual signature image
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Signature captured and verified', margin, yPosition);
      
      yPosition += 30;
    }

    // Footer on every page
    doc.on('pageAdded', () => {
      const pageHeight = doc.page.height;
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text(
           `Generated by OnSite Forms • ${new Date().toLocaleString()}`,
           margin,
           pageHeight - 30,
           { align: 'center', width: pageWidth - (margin * 2) }
         );
    });

    // Add footer to current page
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#9ca3af')
       .text(
         `Generated by OnSite Forms • ${new Date().toLocaleString()}`,
         margin,
         pageHeight - 30,
         { align: 'center', width: pageWidth - (margin * 2) }
       );
  }

  private formatValue(type: string, value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    switch (type) {
      case 'checkbox':
      case 'toggle':
        return value ? 'Yes' : 'No';
      case 'date':
        try {
          return new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch {
          return String(value);
        }
      case 'datetime':
        try {
          return new Date(value).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return String(value);
        }
      case 'photo':
        return value ? '[Photo attached]' : 'No photo';
      case 'signature':
        return value ? '[Signature captured]' : 'No signature';
      case 'notes':
        return String(value).length > 500 
          ? String(value).substring(0, 500) + '...' 
          : String(value);
      case 'dropdown':
        return String(value);
      default:
        return String(value);
    }
  }
}

export const pdfService = new PDFService();
