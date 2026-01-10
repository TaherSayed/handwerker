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
  customer_company?: string;
  customer_notes?: string;
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
        const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
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
        console.warn(`[PDF] Storage upload failed: ${error.message}`);
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
    const margin = 30; // Reduced margin from 50 to 30
    const primaryColor = data.user.primary_color || '#111827';
    const accentColor = data.user.accent_color || '#0FB2C9';

    let y = 30;

    // --- Compact Header ---
    if (data.user.company_logo_url) {
      const logoBuffer = await this.fetchImageBuffer(data.user.company_logo_url);
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, margin, y, { fit: [50, 50] });
        } catch (e) { }
      }
    }

    doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor)
      .text(data.user.company_name || 'OnSite', margin, y + 5, { align: 'right', width: pageWidth - (margin * 2) });

    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    const companyDetails = [
      data.user.company_address,
      [data.user.company_zip, data.user.company_city].filter(Boolean).join(' '),
      data.user.company_phone,
      data.user.company_website
    ].filter(Boolean);

    let detailsY = y + 18;
    companyDetails.forEach(detail => {
      doc.text(detail || '', margin, detailsY, { align: 'right', width: pageWidth - (margin * 2) });
      detailsY += 9;
    });

    y = Math.max(y + 55, detailsY + 10);
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    y += 15;

    // --- Title & Meta ---
    doc.fontSize(20).font('Helvetica-Bold').fillColor(primaryColor).text(data.template.name, margin, y);
    doc.fontSize(9).font('Helvetica').fillColor(accentColor)
      .text(`BELEGDATUM: ${new Date(data.submitted_at || data.created_at).toLocaleDateString('de-DE')}`, margin, y + 25);
    y += 45;

    // --- Compact Customer Block ---
    const hasKundenSection = data.template.fields.some(f => f.type === 'section' && f.label.toLowerCase().includes('kunden'));
    if (!hasKundenSection) {
      doc.rect(margin, y, pageWidth - (margin * 2), 50).fillColor('#f8fafc').fill().strokeColor('#e2e8f0').stroke();
      doc.fontSize(7).font('Helvetica-Bold').fillColor(accentColor).text('KUNDE / AUFTRAGGEBER', margin + 15, y + 8);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(data.customer_name || '-', margin + 15, y + 18);

      const customerDetails = [data.customer_address, data.customer_email, data.customer_phone].filter(Boolean).join('  |  ');
      doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(customerDetails || '-', margin + 15, y + 32);
      y += 65;
    }

    // --- Content Loop ---
    const fieldGap = 10;
    const fieldWidth = (pageWidth - (margin * 2) - fieldGap) / 2;
    let currentCol = 0;
    let rowMaxY = y;

    for (const field of data.template.fields) {
      const value = data.field_values[field.id];
      const isFullWidth = field.type === 'section' || field.type === 'notes' || field.type === 'photo' || field.type === 'signature';

      if (isFullWidth && currentCol === 1) {
        y = rowMaxY + 10;
        currentCol = 0;
      }

      const x = margin + (currentCol * (fieldWidth + fieldGap));
      const currentWidth = isFullWidth ? pageWidth - (margin * 2) : fieldWidth;

      if (field.type === 'section') {
        if (y > pageHeight - 50) { doc.addPage(); y = margin; }
        y += 5;
        doc.rect(margin, y, pageWidth - (margin * 2), 20).fillColor(primaryColor).fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff').text(field.label.toUpperCase(), margin + 10, y + 6);
        y += 28; rowMaxY = y; currentCol = 0; continue;
      }

      const formatted = this.formatValue(field.type, value, field.label);
      const labelHeight = 8;
      let contentHeight = 0;
      if (field.type === 'signature' && value) contentHeight = 40;
      else if (field.type === 'photo' && value) contentHeight = 100;
      else contentHeight = doc.heightOfString(formatted, { width: currentWidth - 15, size: 9 });

      const fieldHeight = Math.max(25, labelHeight + contentHeight + 12);

      if (y + fieldHeight > pageHeight - 40) { doc.addPage(); y = margin; rowMaxY = y; currentCol = 0; }

      doc.rect(x, y, currentWidth, fieldHeight).fillColor('#ffffff').fill().strokeColor('#f1f5f9').stroke();
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#94a3b8').text(field.label.toUpperCase(), x + 8, y + 6);

      const contentY = y + 16;
      if (field.type === 'signature' && value) {
        const sigBuffer = await this.fetchImageBuffer(value);
        if (sigBuffer) doc.image(sigBuffer, x + 8, contentY, { height: 35 });
      } else if (field.type === 'photo' && value) {
        const imgBuffer = await this.fetchImageBuffer(value);
        if (imgBuffer) doc.image(imgBuffer, x + 8, contentY, { fit: [currentWidth - 16, 85] });
      } else {
        doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(formatted || '-', x + 8, contentY, { width: currentWidth - 16 });
      }

      if (isFullWidth) { y += fieldHeight + 8; rowMaxY = y; currentCol = 0; }
      else { rowMaxY = Math.max(rowMaxY, y + fieldHeight); if (currentCol === 1) { y = rowMaxY + 8; currentCol = 0; } else { currentCol = 1; } }
    }

    if (!data.template.fields.some(f => f.type === 'signature') && data.signature_url) {
      if (y > pageHeight - 80) { doc.addPage(); y = margin; }
      y += 15;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('UNTERSCHRIFT', margin, y);
      const sigBuffer = await this.fetchImageBuffer(data.signature_url);
      if (sigBuffer) doc.image(sigBuffer, margin, y + 12, { height: 40 });
    }

    // Footers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).font('Helvetica').fillColor('#94a3b8')
        .text(`${data.user.company_name || 'OnSite'}  |  Seite ${i + 1} von ${totalPages}`, margin, pageHeight - 25, { align: 'center', width: pageWidth - (margin * 2) });
    }
  }

  private formatValue(type: string, value: any, label?: string): string {
    if (value === undefined || value === null || value === '') return '-';
    if (type === 'checkbox' || type === 'toggle') return value ? 'Ja' : 'Nein';
    if (type === 'starrating') return `${value} / 5 ★`;
    if (type === 'scalerating') return `${value} / 10`;
    if (typeof value === 'object') return JSON.stringify(value);
    const str = String(value);
    const l = label?.toLowerCase() || '';
    if (l.includes('preis') || l.includes('price')) return `${str} €`;
    return str;
  }
}

export const pdfService = new PDFService();
