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
    company_city?: string;
    company_zip?: string;
    company_country?: string;
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

  async generateSubmissionPDFBuffer(
    submissionData: SubmissionData
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            resolve(pdfBuffer);
          } catch (err: any) {
            reject(new Error(`Failed to create PDF buffer: ${err.message}`));
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

  async generateSubmissionPDF(
    userId: string,
    submissionData: SubmissionData,
    userClient?: any
  ): Promise<string> {
    try {
      const pdfBuffer = await this.generateSubmissionPDFBuffer(submissionData);
      const storageClient = supabase.adminClient || (userClient || supabase.client);
      const fileName = `${userId}/${submissionData.id}.pdf`;

      // Try to upload to storage
      const { error } = await storageClient.storage
        .from('submission-pdfs')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) {
        // If bucket doesn't exist or upload fails, log warning but don't fail
        console.warn(`[PDF] Storage upload failed (bucket may not exist): ${error.message}`);
        // Return a data URL as fallback - client will handle it
        const base64 = pdfBuffer.toString('base64');
        return `data:application/pdf;base64,${base64}`;
      }

      const { data: urlData } = storageClient.storage
        .from('submission-pdfs')
        .getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('[PDF] Generation error:', err);
      throw new Error(`Failed to generate PDF: ${err.message}`);
    }
  }

  private async buildPDFContent(doc: any, data: SubmissionData) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const primaryColor = data.user.primary_color || '#111827'; // Default slate-900
    const accentColor = data.user.accent_color || '#3b82f6';  // Default blue-500

    let y = 50;

    // --- Professional Header Section ---
    const headerHeight = 100;
    
    // Header background with accent color
    doc.rect(0, 0, pageWidth, headerHeight)
      .fillColor(primaryColor)
      .fill();
    
    // Logo (Left side)
    let logoX = margin;
    let logoY = 20;
    let logoHeight = 60;
    
    if (data.user.company_logo_url) {
      const logoBuffer = await this.fetchImageBuffer(data.user.company_logo_url);
      if (logoBuffer) {
        doc.image(logoBuffer, logoX, logoY, { height: logoHeight, fit: [logoHeight, logoHeight] });
        logoX += logoHeight + 20;
      }
    } else {
      try {
        let logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.jpg');
        try {
          await fs.access(logoPath);
        } catch {
          logoPath = path.join(process.cwd(), 'assets', 'logo.jpg');
        }
        const logoBuffer = await fs.readFile(logoPath);
        doc.image(logoBuffer, logoX, logoY, { height: logoHeight, fit: [logoHeight, logoHeight] });
        logoX += logoHeight + 20;
      } catch (error) {
        console.warn('Could not load default logo:', error);
      }
    }

    // Company Name (Next to logo, white text)
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(data.user.company_name || 'OnSite', logoX, logoY + 10);
    
    // Company Info (Right Aligned, white text)
    const companyInfoX = pageWidth - margin;
    let companyInfoY = logoY + 5;
    
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#ffffff');
    
    const companyAddress = [
      data.user.company_address,
      data.user.company_city && data.user.company_zip ? `${data.user.company_zip} ${data.user.company_city}` : (data.user.company_city || data.user.company_zip),
      data.user.company_country
    ].filter(Boolean).join('\n');
    
    if (companyAddress) {
      doc.text(companyAddress, companyInfoX, companyInfoY, { align: 'right' });
      companyInfoY += 30;
    }
    
    if (data.user.company_phone) {
      doc.text(data.user.company_phone, companyInfoX, companyInfoY, { align: 'right' });
      companyInfoY += 12;
    }
    if (data.user.company_website) {
      doc.text(data.user.company_website, companyInfoX, companyInfoY, { align: 'right' });
    }

    y = headerHeight + 30;

    // --- Document Title Section ---
    doc.fontSize(28)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(data.template.name, margin, y);
    y += 35;

    // Decorative line under title
    doc.moveTo(margin, y)
      .lineTo(pageWidth - margin, y)
      .strokeColor(accentColor)
      .lineWidth(3)
      .stroke();
    y += 25;

    // --- Professional Customer Info Box ---
    const customerBoxHeight = 100;
    const customerBoxY = y;
    
    // Box with border and subtle background
    doc.rect(margin, customerBoxY, pageWidth - (margin * 2), customerBoxHeight)
      .fillColor('#f9fafb')
      .fill()
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();
    
    // Section label with accent background
    doc.rect(margin, customerBoxY, 150, 25)
      .fillColor(accentColor)
      .fill();
    
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('KUNDENDATEN', margin + 10, customerBoxY + 7);
    
    let infoY = customerBoxY + 35;
    const leftColX = margin + 20;
    const rightColX = pageWidth / 2 + 20;
    
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#374151');
    
    // Customer Name (prominent)
    if (data.customer_name) {
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(data.customer_name, leftColX, infoY);
      infoY += 18;
    }
    
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#4b5563');
    
    // Two column layout for contact info
    if (data.customer_email) {
      doc.text(`E-Mail: ${data.customer_email}`, leftColX, infoY);
    }
    if (data.customer_phone) {
      doc.text(`Telefon: ${data.customer_phone}`, rightColX, infoY);
    }
    infoY += 15;
    
    if (data.customer_address) {
      doc.text(`Adresse: ${data.customer_address}`, leftColX, infoY);
    }

    y = customerBoxY + customerBoxHeight + 30;

    // --- Professional Field Responses ---
    for (const field of data.template.fields) {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 50;
      }

      const value = data.field_values[field.id];

      if (field.type === 'section') {
        y += 20;
        // Section header with background
        doc.rect(margin, y - 5, pageWidth - (margin * 2), 25)
          .fillColor('#f3f4f6')
          .fill();
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(field.label.toUpperCase(), margin + 10, y);
        y += 30;
        continue;
      }

      // Field container with subtle border
      const fieldHeight = 35;
      doc.rect(margin, y, pageWidth - (margin * 2), fieldHeight)
        .fillColor('#ffffff')
        .fill()
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .stroke();

      // Field Label (left side, smaller, gray)
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#6b7280')
        .text(field.label, margin + 10, y + 8);
      
      // Field Value (right side, larger, dark)
      const valueX = margin + 200;
      const valueWidth = pageWidth - margin - valueX - 10;
      
      if (field.type === 'photo' && value) {
        const photoBuffer = await this.fetchImageBuffer(value);
        if (photoBuffer) {
          if (y > pageHeight - 220) {
            doc.addPage();
            y = 50;
          }
          doc.image(photoBuffer, valueX, y + 5, { fit: [150, 150] });
          y += 160;
          continue;
        } else {
          doc.fontSize(10)
            .font('Helvetica')
            .fillColor('#ef4444')
            .text('[Bild konnte nicht geladen werden]', valueX, y + 12);
        }
      } else {
        const formatted = this.formatValue(field.type, value);
        doc.fontSize(11)
          .font('Helvetica')
          .fillColor('#111827')
          .text(formatted, valueX, y + 8, {
            width: valueWidth
          });
      }

      y += fieldHeight + 8;
    }

    // --- Professional Signature Section ---
    if (y > pageHeight - 150) {
      doc.addPage();
      y = 50;
    }

    y += 20;
    
    // Signature box
    const signatureBoxHeight = 80;
    doc.rect(margin, y, pageWidth - (margin * 2), signatureBoxHeight)
      .fillColor('#ffffff')
      .fill()
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();
    
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Unterschrift', margin + 10, y + 10);
    
    if (data.signature_url) {
      const sigBuffer = await this.fetchImageBuffer(data.signature_url);
      if (sigBuffer) {
        doc.image(sigBuffer, margin + 10, y + 25, { height: 40 });
      }
    } else {
      doc.fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor('#9ca3af')
        .text('Elektronisch erfasst', margin + 10, y + 40);
    }

    // --- Professional Footer on all pages ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Footer background
      doc.rect(0, pageHeight - 40, pageWidth, 40)
        .fillColor('#f9fafb')
        .fill();
      
      // Footer text
      const footerText = `Generiert durch ${data.user.company_name || 'OnSite'} - ${new Date(data.created_at).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })}`;
      
      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(footerText, margin, pageHeight - 25, { align: 'center' });
      
      // Page number
      doc.text(`Seite ${i + 1} von ${range.count}`, pageWidth - margin - 50, pageHeight - 25, { align: 'right' });
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
