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
    const margin = 40;
    const primaryColor = data.user.primary_color || '#111827'; // Default slate-900
    const accentColor = data.user.accent_color || '#3b82f6';  // Default blue-500

    let y = 30;
    let lastContentPage = 0; // Track the last page with actual content

    // --- Compact Professional Header Section ---
    const headerHeight = 50;
    
    // Header background with accent color
    doc.rect(0, 0, pageWidth, headerHeight)
      .fillColor(primaryColor)
      .fill();
    
    // Logo (Left side) - smaller
    let logoX = margin;
    let logoY = 5;
    let logoHeight = 40;
    
    if (data.user.company_logo_url) {
      const logoBuffer = await this.fetchImageBuffer(data.user.company_logo_url);
      if (logoBuffer) {
        doc.image(logoBuffer, logoX, logoY, { height: logoHeight, fit: [logoHeight, logoHeight] });
        logoX += logoHeight + 15;
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
        logoX += logoHeight + 15;
      } catch (error) {
        console.warn('Could not load default logo:', error);
      }
    }

    // Company Name (Next to logo, white text) - smaller
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(data.user.company_name || 'OnSite', logoX, logoY + 8);
    
    // Company Info (Right Aligned, white text) - compact
    const companyInfoX = pageWidth - margin;
    let companyInfoY = logoY + 3;
    
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor('#ffffff');
    
    const companyAddress = [
      data.user.company_address,
      data.user.company_city && data.user.company_zip ? `${data.user.company_zip} ${data.user.company_city}` : (data.user.company_city || data.user.company_zip),
      data.user.company_country
    ].filter(Boolean).join(' • ');
    
    if (companyAddress) {
      doc.text(companyAddress, companyInfoX, companyInfoY, { align: 'right', width: 200 });
      companyInfoY += 10;
    }
    
    if (data.user.company_phone) {
      doc.text(data.user.company_phone, companyInfoX, companyInfoY, { align: 'right', width: 200 });
      companyInfoY += 10;
    }
    if (data.user.company_website) {
      doc.text(data.user.company_website, companyInfoX, companyInfoY, { align: 'right', width: 200 });
    }

    y = headerHeight + 20;

    // --- Compact Document Title Section ---
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(data.template.name, margin, y);
    y += 22;

    // Decorative line under title - thinner
    doc.moveTo(margin, y)
      .lineTo(pageWidth - margin, y)
      .strokeColor(accentColor)
      .lineWidth(2)
      .stroke();
    y += 15;

    // --- Compact Professional Customer Info Box ---
    const customerBoxHeight = 60;
    const customerBoxY = y;
    
    // Box with border and subtle background
    doc.rect(margin, customerBoxY, pageWidth - (margin * 2), customerBoxHeight)
      .fillColor('#f9fafb')
      .fill()
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();
    
    // Section label with accent background - smaller
    doc.rect(margin, customerBoxY, 120, 18)
      .fillColor(accentColor)
      .fill();
    
    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('KUNDENDATEN', margin + 8, customerBoxY + 5);
    
    let infoY = customerBoxY + 22;
    const leftColX = margin + 15;
    const rightColX = pageWidth / 2 + 10;
    
    // Customer Name (prominent but compact)
    if (data.customer_name) {
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(data.customer_name, leftColX, infoY);
      infoY += 14;
    }
    
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#4b5563');
    
    // Two column layout for contact info - compact
    if (data.customer_email) {
      doc.text(`E-Mail: ${data.customer_email}`, leftColX, infoY, { width: 200 });
    }
    if (data.customer_phone) {
      doc.text(`Telefon: ${data.customer_phone}`, rightColX, infoY, { width: 200 });
    }
    infoY += 12;
    
    if (data.customer_address) {
      doc.text(`Adresse: ${data.customer_address}`, leftColX, infoY, { width: pageWidth - (margin * 2) - 30 });
    }

    y = customerBoxY + customerBoxHeight + 15;

    // --- Compact Professional Field Responses ---
    // Use two-column layout for fields to save space
    const fieldWidth = (pageWidth - (margin * 2) - 10) / 2;
    let currentCol = 0;
    let colX = margin;
    
    for (const field of data.template.fields) {
      // Check if we need a new page before adding content
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 30;
        currentCol = 0;
        colX = margin;
      }
      // Track current page as having content
      lastContentPage = doc.page.number - 1;

      const value = data.field_values[field.id];

      if (field.type === 'section') {
        // Section takes full width
        currentCol = 0;
        colX = margin;
        y += 10;
        // Section header with background - compact
        doc.rect(margin, y, pageWidth - (margin * 2), 18)
          .fillColor('#f3f4f6')
          .fill();
        
        doc.fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(field.label.toUpperCase(), margin + 8, y + 4);
        y += 22;
        continue;
      }

      // Field container with subtle border - compact
      const fieldHeight = 28;
      
      // Use two columns for regular fields, full width for signature/photo
      if (field.type === 'signature' || field.type === 'photo') {
        colX = margin;
        currentCol = 0;
      }
      
      doc.rect(colX, y, field.type === 'signature' || field.type === 'photo' ? pageWidth - (margin * 2) : fieldWidth, fieldHeight)
        .fillColor('#ffffff')
        .fill()
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .stroke();

      // Field Label (top, smaller, gray) - compact
      doc.fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('#6b7280')
        .text(field.label, colX + 6, y + 4);
      
      // Field Value (below label, compact)
      const valueY = y + 12;
      const valueWidth = (field.type === 'signature' || field.type === 'photo') ? pageWidth - (margin * 2) - 12 : fieldWidth - 12;
      
      if (field.type === 'photo' && value) {
        const photoBuffer = await this.fetchImageBuffer(value);
        if (photoBuffer) {
          if (y > pageHeight - 150) {
            doc.addPage();
            y = 30;
          }
          doc.image(photoBuffer, colX + 6, valueY, { fit: [100, 100] });
          lastContentPage = doc.page.number - 1;
          y += 110;
          currentCol = 0;
          colX = margin;
          continue;
        } else {
          doc.fontSize(8)
            .font('Helvetica')
            .fillColor('#ef4444')
            .text('[Bild konnte nicht geladen werden]', colX + 6, valueY);
        }
      } else if (field.type === 'signature' && value) {
        const sigBuffer = await this.fetchImageBuffer(value);
        if (sigBuffer) {
          doc.image(sigBuffer, colX + 6, valueY, { height: 30 });
        } else {
          doc.fontSize(8)
            .font('Helvetica-Oblique')
            .fillColor('#9ca3af')
            .text('Unterschrift', colX + 6, valueY);
        }
      } else {
        const formatted = this.formatValue(field.type, value);
        doc.fontSize(9)
          .font('Helvetica')
          .fillColor('#111827')
          .text(formatted, colX + 6, valueY, {
            width: valueWidth
          });
      }

      // Move to next column or next row
      if (field.type === 'signature' || field.type === 'photo') {
        y += fieldHeight + 6;
        currentCol = 0;
        colX = margin;
      } else {
        if (currentCol === 0) {
          currentCol = 1;
          colX = margin + fieldWidth + 10;
        } else {
          currentCol = 0;
          colX = margin;
          y += fieldHeight + 6;
        }
      }
      
      // Track current page as having content
      lastContentPage = doc.page.number - 1;
    }
    
    // If we ended on the first column, move to next row
    if (currentCol === 1) {
      y += fieldHeight + 6;
    }

    // --- Compact Signature Section (if not already included in fields) ---
    const hasSignatureField = data.template.fields.some(f => f.type === 'signature');
    
    if (!hasSignatureField && data.signature_url) {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 30;
      }

      y += 10;
      
      // Compact signature box
      const signatureBoxHeight = 50;
      doc.rect(margin, y, pageWidth - (margin * 2), signatureBoxHeight)
        .fillColor('#ffffff')
        .fill()
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();
      
      doc.fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text('Unterschrift', margin + 8, y + 6);
      
      const sigBuffer = await this.fetchImageBuffer(data.signature_url);
      if (sigBuffer) {
        doc.image(sigBuffer, margin + 8, y + 15, { height: 30 });
      }
      
      y += signatureBoxHeight + 10;
    }

    // Update last content page to current page
    lastContentPage = doc.page.number - 1;

    // --- Professional Footer on all pages with content only ---
    // Use the tracked last content page to determine total pages
    // This ensures we only add footers to pages that actually have content
    const totalPages = lastContentPage + 1;
    
    // Only add footers to pages that have content (0-indexed)
    for (let i = 0; i < totalPages; i++) {
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
      
      // Page number - use actual total pages with content
      doc.text(`Seite ${i + 1} von ${totalPages}`, pageWidth - margin - 50, pageHeight - 25, { align: 'right' });
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
