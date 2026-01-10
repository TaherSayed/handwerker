import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CompanySettings {
    company_name?: string;
    company_logo_url?: string;
    company_address?: string;
    company_city?: string;
    company_zip?: string;
    company_country?: string;
    company_website?: string;
    email?: string;
    company_phone?: string;
}

interface Submission {
    id: string;
    created_at: string;
    customer_name: string;
    customer_address?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_company?: string;
    customer_notes?: string;
    form_templates: {
        name: string;
        fields: any[];
    };
    field_values: Record<string, any>;
    signature_url?: string;
}

export const generatePDF = async (submission: Submission, companySettings?: CompanySettings): Promise<void> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Color Palette (Professional Blue/Grey)
    const primaryColor = '#1e3a8a'; // Blue 900
    const secondaryColor = '#64748b'; // Slate 500
    const lightGrey = '#f8fafc'; // Slate 50

    let currentY = 20;

    // --- Header Section ---

    // Company Logo (Left)
    // Company Logo (Left)
    if (companySettings?.company_logo_url) {
        try {
            let imgData = companySettings.company_logo_url;

            // If it's a remote URL, fetch it and convert to DataURI
            if (imgData.startsWith('http')) {
                try {
                    const response = await fetch(imgData);
                    const blob = await response.blob();
                    imgData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                } catch (fetchErr) {
                    console.warn('Failed to fetch remote logo for PDF', fetchErr);
                    // Fallback: don't loop or retry, just proceed with original if possible or skip
                }
            }

            if (imgData && imgData.startsWith('data:')) {
                // Determine format
                const format = imgData.includes('image/png') ? 'PNG' : 'JPEG';
                doc.addImage(imgData, format, margin, currentY, 25, 25);
            }
        } catch (e) {
            console.warn('Could not add logo to PDF', e);
        }
    }

    // Company Info removed as per user request (Only logo)

    // Title & Subject
    currentY += 40;
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Einsatzbericht', margin, currentY);

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(submission.form_templates?.name || 'Einsatzbericht', margin, currentY + 7);

    // Meta Data Ticket Badge
    doc.setFillColor(lightGrey);
    doc.setDrawColor(secondaryColor);
    doc.roundedRect(pageWidth - margin - 60, currentY - 5, 60, 20, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    doc.text('Bericht Nr.', pageWidth - margin - 55, currentY + 2);
    doc.setFontSize(11);
    doc.setTextColor('#0f172a'); // Slate 900
    doc.setFont('helvetica', 'bold');
    const reportId = submission.id ? submission.id.slice(0, 8).toUpperCase() : 'UNKNOWN';
    doc.text(`#${reportId}`, pageWidth - margin - 55, currentY + 8);

    currentY += 25;

    // --- Customer Block ---
    doc.setFillColor('#f1f5f9'); // Slate 100
    doc.rect(margin, currentY, pageWidth - (margin * 2), 35, 'F');

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Kundeninformationen', margin + 5, currentY + 8);

    doc.setFontSize(11);
    doc.setTextColor('#334155');
    doc.setFont('helvetica', 'bold');
    let customerName = submission.customer_name;
    if (submission.customer_company) customerName += ` (${submission.customer_company})`;
    doc.text(customerName, margin + 5, currentY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let addressLine = submission.customer_address || '';
    if (submission.customer_address) doc.text(addressLine, margin + 5, currentY + 22);

    let contactInfo = [];
    if (submission.customer_phone) contactInfo.push(submission.customer_phone);
    if (submission.customer_email) contactInfo.push(submission.customer_email);
    if (contactInfo.length > 0) doc.text(contactInfo.join('  •  '), margin + 5, currentY + 28);

    // Notes if present
    if (submission.customer_notes) {
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);
        doc.text(`Notiz: ${submission.customer_notes}`, margin + 5, currentY + 33);
    }

    // Date
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text(`Datum: ${format(new Date(submission.created_at), 'dd.MM.yyyy')}`, pageWidth - margin - 5, currentY + 16, { align: 'right' });

    currentY += 45;

    // --- Content Table ---
    const fields = submission.form_templates?.fields || [];
    const tableBody = fields.map(field => {
        const value = submission.field_values?.[field.id];

        // Skip sections in table body effectively, or render them as headers
        if (field.type === 'section') {
            return [{ content: field.label.toUpperCase(), colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 58, 138] } }];
        }

        let displayValue = value;
        if (value === true) displayValue = 'Ja';
        if (value === false) displayValue = 'Nein';
        if (field.type === 'date' && value) displayValue = format(new Date(value), 'dd.MM.yyyy', { locale: de });
        if (field.type === 'photo') displayValue = value ? 'Foto im Anhang' : '-';
        if (field.type === 'signature') displayValue = value ? 'Unterschrieben' : '-';
        if (!value) displayValue = '-';

        return [field.label, displayValue];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Beschreibung', 'Wert / Details']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: '#ffffff', fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5, lineColor: [226, 232, 240] },
        alternateRowStyles: { fillColor: '#ffffff' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
        margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // --- Photos Section ---
    const photoFields = fields.filter(f => f.type === 'photo' && submission.field_values?.[f.id]);

    if (photoFields.length > 0) {
        if (currentY + 60 > pageHeight) { doc.addPage(); currentY = 20; }

        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Foto-Dokumentation', margin, currentY);
        currentY += 10;

        let xOffset = margin;
        photoFields.forEach((field) => {
            const base64Img = submission.field_values[field.id];
            if (base64Img && base64Img.startsWith('data:')) {
                // Check fit
                if (currentY + 50 > pageHeight) { doc.addPage(); currentY = 20; xOffset = margin; }

                try {
                    doc.addImage(base64Img, 'JPEG', xOffset, currentY, 45, 45, undefined, 'FAST');
                    doc.setFontSize(8);
                    doc.text(field.label, xOffset, currentY + 50);

                    xOffset += 55;
                    if (xOffset + 45 > pageWidth) {
                        xOffset = margin;
                        currentY += 60;
                    }
                } catch (e) {
                    console.error('Error adding image to PDF', e);
                }
            }
        });
        currentY += 60;
    }

    // --- Signatures Section ---
    if (currentY + 60 > pageHeight) { doc.addPage(); currentY = 20; }

    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Unterschriften', margin, currentY);
    currentY += 10;

    // Technician Signature (Placeholder or User Profile Sig if we had it)
    // For now just a line

    // Customer Signature
    const signatureField = fields.find(f => f.type === 'signature' && submission.field_values?.[f.id]);
    const customerSigUrl = submission.signature_url || submission.field_values?.['signature_customer'] ||
        (signatureField ? submission.field_values?.[signatureField.id] : null);

    const sigBoxY = currentY;

    // Box 1: Auftraggeber / Kunde
    doc.setDrawColor('#cbd5e1');
    doc.rect(margin, sigBoxY, 80, 40);
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text('Auftraggeber / Kunde', margin + 2, sigBoxY + 5);

    if (customerSigUrl && customerSigUrl.startsWith('data:')) {
        doc.addImage(customerSigUrl, 'PNG', margin + 5, sigBoxY + 10, 70, 25);
    }

    // Box 2: Auftragnehmer
    const leftX = pageWidth - margin - 80;
    doc.rect(leftX, sigBoxY, 80, 40);
    doc.text('Auftragnehmer / Monteur', leftX + 2, sigBoxY + 5);

    // Footer Stuff
    currentY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor('#94a3b8');
    doc.text(`Generiert mit OnSite Formulare am ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, margin, currentY);
    doc.text('Seite 1/1', pageWidth - margin, currentY, { align: 'right' }); // Todo simple page count

    // Save
    doc.save(`Einsatzbericht_${submission.customer_name.replace(/\s+/g, '_')}_${format(new Date(submission.created_at), 'yyyyMMdd')}.pdf`);
};
