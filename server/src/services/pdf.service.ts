import PDFDocument from 'pdfkit';
import { supabase } from './supabase.service.js';
import axios from 'axios';

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
  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Failed to fetch image from ${url}:`, error);
      return null;
    }
  }

  async generateSubmissionPDF(
    userId: string,
    submissionData: SubmissionData,
    userClient?: any
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            const storageClient = supabase.adminClient || (userClient || supabase.client);
            const fileName = `${userId}/${submissionData.id}.pdf`;

            const { error } = await storageClient.storage
              .from('submission-pdfs')
              .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true,
              });

            if (error) reject(new Error(`Failed to upload PDF: ${error.message}`));
            else {
              const { data: urlData } = storageClient.storage
                .from('submission-pdfs')
                .getPublicUrl(fileName);
              resolve(urlData.publicUrl);
            }
          } catch (err: any) {
            reject(new Error(`Failed to save PDF: ${err.message}`));
          }
        });

        // Headers & Content
        await this.buildPDFContent(doc, submissionData);
        doc.end();
      } catch (error: any) {
        reject(new Error(`PDF generation failed: ${error.message}`));
      }
    });
  }

  private async buildPDFContent(doc: any, data: SubmissionData) {
    const pageWidth = doc.page.width;
    const margin = 50;
    let y = 50;

    // Header
    if (data.user.company_logo_url) {
      const logoBuffer = await this.fetchImageBuffer(data.user.company_logo_url);
      if (logoBuffer) {
        doc.image(logoBuffer, margin, y, { height: 50 });
        y += 60;
      }
    }

    doc.fontSize(20).font('Helvetica-Bold').text(data.user.company_name || 'OnSite Forms', margin, y);
    y += 25;
    doc.fontSize(12).font('Helvetica').text(data.template.name, margin, y);
    y += 40;

    // Customer Info
    doc.fontSize(14).font('Helvetica-Bold').text('Customer Details', margin, y);
    y += 20;
    doc.fontSize(10).font('Helvetica');
    const custInfo = [
      data.customer_name && `Name: ${data.customer_name}`,
      data.customer_email && `Email: ${data.customer_email}`,
      data.customer_phone && `Phone: ${data.customer_phone}`,
      data.customer_address && `Address: ${data.customer_address}`
    ].filter(Boolean);

    custInfo.forEach(info => {
      doc.text(info, margin + 10, y);
      y += 15;
    });

    y += 20;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#e5e7eb');
    y += 30;

    // Responses
    for (const field of data.template.fields) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      if (field.type === 'section') {
        y += 10;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(field.label.toUpperCase(), margin, y);
        y += 20;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.5).stroke('#111827');
        y += 15;
        continue;
      }

      const value = data.field_values[field.id];
      const formatted = this.formatValue(field.type, value);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text(field.label, margin, y);
      y += 15;
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(formatted, margin + 10, y, {
        width: pageWidth - (margin * 2) - 10
      });
      y += doc.heightOfString(formatted, { width: pageWidth - (margin * 2) - 10 }) + 15;
    }

    // Signature
    if (data.signature_url) {
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 50;
      }
      y += 20;
      doc.fontSize(12).font('Helvetica-Bold').text('Signature', margin, y);
      y += 10;
      const sigBuffer = await this.fetchImageBuffer(data.signature_url);
      if (sigBuffer) {
        doc.image(sigBuffer, margin, y, { height: 60 });
      } else {
        doc.fontSize(10).font('Helvetica-Oblique').text('Captured electronically', margin, y + 10);
      }
    }
  }

  private formatValue(type: string, value: any): string {
    if (!value && value !== 0 && value !== false) return 'Not provided';
    if (type === 'checkbox' || type === 'toggle') return value ? 'Yes' : 'No';
    if (type === 'date' || type === 'datetime') return new Date(value).toLocaleString();
    return String(value);
  }
}

export const pdfService = new PDFService();
