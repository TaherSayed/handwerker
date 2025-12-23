import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from './supabase.service.js';
import { databaseService } from './database.service.js';

interface PDFGenerationResult {
  publicUrl: string;
  visitId: string;
}

export class PDFService {
  /**
   * Generate a professional PDF for a visit and store it in Supabase Storage
   */
  async generateVisitPDF(visitId: string, userId: string): Promise<PDFGenerationResult> {
    // 1. Fetch visit data
    const visit = await databaseService.getVisitById(visitId, userId);
    if (!visit) {
      throw new Error('Visit not found');
    }

    // 2. Generate PDF
    const pdfBytes = await this.createPDF(visit);

    // 3. Upload to Supabase Storage
    const fileName = `visit_${visitId}_${Date.now()}.pdf`;
    const { data, error } = await supabase.storage
      .from('visit-pdfs')
      .upload(`${userId}/${fileName}`, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    // 4. Get public URL
    const { data: urlData } = supabase.storage
      .from('visit-pdfs')
      .getPublicUrl(`${userId}/${fileName}`);

    // 5. Update visit with PDF URL
    await databaseService.updateVisit(visitId, {
      pdf_url: urlData.publicUrl,
      pdf_generated_at: new Date().toISOString()
    }, userId);

    return {
      publicUrl: urlData.publicUrl,
      visitId
    };
  }

  /**
   * Create a professional PDF document
   */
  private async createPDF(visit: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;

    // Title
    page.drawText('Besuchsbericht', {
      x: margin,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0.29, 0.61) // #007AFF
    });

    yPosition -= 40;

    // Visit Info
    page.drawText(`Besuch-ID: ${visit.id}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4)
    });

    yPosition -= lineHeight;

    page.drawText(`Datum: ${new Date(visit.created_at).toLocaleDateString('de-DE')}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4)
    });

    yPosition -= 30;

    // Customer Info Section
    page.drawText('Kunde', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });

    yPosition -= lineHeight;

    const customer = visit.contact_data || {};
    page.drawText(`Name: ${customer.name || 'N/A'}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: regularFont
    });

    yPosition -= lineHeight;

    if (customer.phone) {
      page.drawText(`Telefon: ${customer.phone}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: regularFont
      });
      yPosition -= lineHeight;
    }

    if (customer.email) {
      page.drawText(`E-Mail: ${customer.email}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: regularFont
      });
      yPosition -= lineHeight;
    }

    if (customer.address) {
      page.drawText(`Adresse: ${customer.address}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: regularFont
      });
      yPosition -= lineHeight;
    }

    yPosition -= 20;

    // Form Data Section
    page.drawText('Formular Daten', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });

    yPosition -= lineHeight;

    const formData = visit.form_data || {};
    for (const [key, value] of Object.entries(formData)) {
      if (yPosition < 80) {
        // Add new page if we're running out of space
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
        
        newPage.drawText(`${key}: ${value}`, {
          x: margin,
          y: yPosition,
          size: 12,
          font: regularFont
        });
      } else {
        page.drawText(`${key}: ${value}`, {
          x: margin,
          y: yPosition,
          size: 12,
          font: regularFont
        });
      }
      
      yPosition -= lineHeight;
    }

    // Footer
    page.drawText(`Erstellt am ${new Date().toLocaleString('de-DE')}`, {
      x: margin,
      y: 30,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5)
    });

    return pdfDoc.save();
  }
}

export const pdfService = new PDFService();

