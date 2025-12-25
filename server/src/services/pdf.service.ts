import PDFDocument from 'pdfkit';
import { supabase } from './supabase.service.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

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
    company_address?: string;
    company_phone?: string;
    company_website?: string;
    primary_color?: string;
    accent_color?: string;
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
    const primaryColor = data.user.primary_color || '#111827'; // Default slate-900
    const accentColor = data.user.accent_color || '#3b82f6';  // Default blue-500

    let y = 50;

    // --- Header Section ---
    if (data.user.company_logo_url) {
      const logoBuffer = await this.fetchImageBuffer(data.user.company_logo_url);
      if (logoBuffer) {
        // Logo on the left
        doc.image(logoBuffer, margin, y, { height: 60 });
      }
    } else {
      try {
        // Attempt to load default logo from server assets
        // Try multiple paths to be robust (dev vs prod)
        let logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.jpg');

        try {
          await fs.access(logoPath);
        } catch {
          // Fallback for production/dist structure if needed
          logoPath = path.join(process.cwd(), 'assets', 'logo.jpg');
        }

        const logoBuffer = await fs.readFile(logoPath);
        doc.image(logoBuffer, margin, y, { height: 60 });
      } catch (error) {
        console.warn('Could not load default logo:', error);
      }
    }

    // Company Info (Right Aligned)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(data.user.company_name || 'OnSite Forms', margin, y, { align: 'right' });
    y += 15;

    doc.fontSize(8).font('Helvetica').fillColor('#6b7280'); // Slate-500

    if (data.user.company_address) {
      doc.text(data.user.company_address, margin, y, { align: 'right' });
      y += 12;
    }
    if (data.user.company_phone) {
      doc.text(data.user.company_phone, margin, y, { align: 'right' });
      y += 12;
    }
    if (data.user.company_website) {
      doc.text(data.user.company_website, margin, y, { align: 'right' });
      y += 12;
    }

    // Reset Y to below logo for main content (max of logo height or text height)
    y = Math.max(y, 130);

    // Document Title
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(accentColor).lineWidth(2).stroke();
    y += 20;

    doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text(data.template.name, margin, y);
    y += 30;

    // --- Customer Info ---
    doc.rect(margin, y, pageWidth - (margin * 2), 80).fillColor('#f9fafb').fill(); // Slate-50 background

    let infoY = y + 15;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('KUNDENDATEN', margin + 15, infoY);

    infoY += 20;
    doc.fontSize(10).font('Helvetica').fillColor('#374151'); // Slate-700

    const leftColX = margin + 15;
    const rightColX = pageWidth / 2 + 10;

    if (data.customer_name) doc.text(data.customer_name, leftColX, infoY);
    if (data.customer_email) doc.text(data.customer_email, rightColX, infoY);

    infoY += 15;
    if (data.customer_address) doc.text(data.customer_address, leftColX, infoY);
    if (data.customer_phone) doc.text(data.customer_phone, rightColX, infoY);

    y += 90; // Move past the box

    // --- Responses ---
    doc.fontSize(10);

    for (const field of data.template.fields) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      const value = data.field_values[field.id];

      if (field.type === 'section') {
        y += 15;
        doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text(field.label.toUpperCase(), margin, y);
        y += 18;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.5).strokeColor(primaryColor).stroke();
        y += 15;
        continue;
      }

      // Render Field Label
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b7280').text(field.label, margin, y); // Slate-500
      y += 12;

      // Render Field Value
      if (field.type === 'photo' && value) {
        const photoBuffer = await this.fetchImageBuffer(value);
        if (photoBuffer) {
          // Check page break
          if (y > doc.page.height - 220) {
            doc.addPage();
            y = 50;
          }
          doc.image(photoBuffer, margin, y, { fit: [200, 200], align: 'center' }); // Center usage via x,y logic? fit implies box
          // actually just place it
          y += 210;
        } else {
          doc.fontSize(10).font('Helvetica').fillColor('#ef4444').text('[Bild konnte nicht geladen werden]', margin, y);
          y += 20;
        }
      } else {
        const formatted = this.formatValue(field.type, value);
        doc.fontSize(11).font('Helvetica').fillColor('#111827').text(formatted, margin, y, {
          width: pageWidth - (margin * 2)
        });
        y += doc.heightOfString(formatted, { width: pageWidth - (margin * 2) }) + 15;
      }
    }

    // --- Footer / Signature ---
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
    }

    y += 30;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('Unterschrift', margin, y);
    y += 10;

    if (data.signature_url) {
      const sigBuffer = await this.fetchImageBuffer(data.signature_url);
      if (sigBuffer) {
        doc.image(sigBuffer, margin, y, { height: 50 });
      }
    } else {
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#9ca3af').text('Elektronisch erfasst', margin, y + 10);
    }

    // Page Numbers & Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#9ca3af').text(
        `Generiert durch OnSite Forms - ${new Date(data.created_at).toLocaleDateString()}`,
        margin,
        doc.page.height - 30,
        { align: 'center' }
      );
    }
  }

  private formatValue(type: string, value: any): string {
    if (value === undefined || value === null || value === '') return '-';
    if (type === 'checkbox' || type === 'toggle') return value ? 'Ja' : 'Nein';
    if (type === 'date' || type === 'datetime') return new Date(value).toLocaleString('de-DE');
    return String(value);
  }
}

export const pdfService = new PDFService();
