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
    submissionData: SubmissionData
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Upload to Supabase Storage (use adminClient if available, otherwise regular client)
          const storageClient = supabase.adminClient || supabase.client;
          const fileName = `${userId}/${submissionData.id}.pdf`;
          const { data, error } = await storageClient.storage
            .from('submission-pdfs')
            .upload(fileName, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            });

          if (error) {
            reject(error);
            return;
          }

          // Get public URL
          const { data: urlData } = storageClient.storage
            .from('submission-pdfs')
            .getPublicUrl(fileName);

          resolve(urlData.publicUrl);
        });

        // Build PDF content
        this.buildPDFContent(doc, submissionData);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildPDFContent(doc: PDFKit.PDFDocument, data: SubmissionData) {
    // Header - Company Info
    if (data.user.company_logo_url) {
      // Logo would be added here if we fetch it
      doc.fontSize(20).text(data.user.company_name || 'OnSite Forms', 50, 50);
    } else {
      doc.fontSize(20).text(data.user.company_name || 'OnSite Forms', 50, 50);
    }

    doc.moveDown();
    doc.fontSize(16).text(data.template.name, { underline: true });
    doc.moveDown();

    // Submission Info
    doc.fontSize(10).text(`Submission ID: ${data.id}`, { continued: false });
    doc.text(
      `Date: ${new Date(data.submitted_at || data.created_at).toLocaleDateString()}`
    );
    doc.moveDown();

    // Customer Info
    if (data.customer_name) {
      doc.fontSize(12).text('Customer Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${data.customer_name}`);
      if (data.customer_email) doc.text(`Email: ${data.customer_email}`);
      if (data.customer_phone) doc.text(`Phone: ${data.customer_phone}`);
      if (data.customer_address) doc.text(`Address: ${data.customer_address}`);
      doc.moveDown();
    }

    // Form Fields
    doc.fontSize(12).text('Form Data', { underline: true });
    doc.moveDown(0.5);

    data.template.fields.forEach((field) => {
      const value = data.field_values[field.id];
      doc.fontSize(10).font('Helvetica-Bold').text(`${field.label}:`, {
        continued: true,
      });
      doc.font('Helvetica').text(` ${this.formatValue(field.type, value)}`);
      doc.moveDown(0.3);
    });

    // Signature
    if (data.signature_url) {
      doc.moveDown();
      doc.fontSize(10).text('Signature:');
      doc.text('(Signature image URL: ' + data.signature_url + ')');
      // In production, you'd fetch and embed the actual signature image
    }

    // Footer
    doc
      .fontSize(8)
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
  }

  private formatValue(type: string, value: any): string {
    if (value === null || value === undefined) return 'N/A';

    switch (type) {
      case 'checkbox':
      case 'toggle':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'photo':
        return value ? '[Photo attached]' : 'N/A';
      default:
        return String(value);
    }
  }
}

export const pdfService = new PDFService();
