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
    const margin = 15; // More compact margin

    const primaryColor = '#1e3a8a';
    const secondaryColor = '#64748b';

    let currentY = 15;

    // --- Header ---
    if (companySettings?.company_logo_url) {
        try {
            let imgData = companySettings.company_logo_url;
            if (imgData.startsWith('http')) {
                const response = await fetch(imgData);
                const blob = await response.blob();
                imgData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }
            if (imgData && imgData.startsWith('data:')) {
                const format = imgData.includes('image/png') ? 'PNG' : 'JPEG';
                doc.addImage(imgData, format, margin, currentY, 20, 20);
            }
        } catch (e) { }
    }

    doc.setFontSize(10).setTextColor(secondaryColor).setFont('helvetica', 'bold');
    doc.text(companySettings?.company_name || 'Handwerksbetrieb', pageWidth - margin, currentY + 5, { align: 'right' });

    doc.setFontSize(7).setFont('helvetica', 'normal');
    let headerY = currentY + 10;
    const details = [
        companySettings?.company_address,
        [companySettings?.company_zip, companySettings?.company_city].filter(Boolean).join(' '),
        companySettings?.company_phone,
        companySettings?.company_website
    ].filter(Boolean);

    details.forEach(line => {
        doc.text(line || '', pageWidth - margin, headerY, { align: 'right' });
        headerY += 4;
    });

    currentY = Math.max(currentY + 25, headerY + 5);
    doc.setDrawColor(226, 232, 240).line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // --- Title ---
    doc.setFontSize(18).setTextColor(primaryColor).setFont('helvetica', 'bold');
    doc.text('Einsatzbericht', margin, currentY);
    doc.setFontSize(9).setTextColor(secondaryColor).setFont('helvetica', 'normal');
    doc.text(submission.form_templates?.name || 'Bericht', margin, currentY + 6);

    const reportId = submission.id ? submission.id.slice(0, 8).toUpperCase() : 'N/A';
    doc.setFontSize(8).text(`#${reportId}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 15;

    // --- Customer Box ---
    doc.setFillColor(248, 250, 252).rect(margin, currentY, pageWidth - (margin * 2), 25, 'F');
    doc.setFontSize(7).setTextColor(secondaryColor).setFont('helvetica', 'bold').text('KUNDE', margin + 5, currentY + 6);
    doc.setFontSize(9).setTextColor('#334155').text(submission.customer_name || '-', margin + 5, currentY + 14);

    const customerInfo = [submission.customer_address, submission.customer_phone, submission.customer_email].filter(Boolean).join('  •  ');
    doc.setFontSize(8).setFont('helvetica', 'normal').text(customerInfo || '-', margin + 5, currentY + 20);

    doc.text(`Datum: ${format(new Date(submission.created_at), 'dd.MM.yyyy')}`, pageWidth - margin - 5, currentY + 14, { align: 'right' });
    currentY += 30;

    // --- Table ---
    const fields = submission.form_templates?.fields || [];
    const tableBody = fields.map(field => {
        const value = submission.field_values?.[field.id];
        if (field.type === 'section') return [{ content: field.label.toUpperCase(), colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8 } }];

        let display = value === true ? 'Ja' : value === false ? 'Nein' : (value || '-');
        if (field.type === 'date' && value) display = format(new Date(value), 'dd.MM.yyyy', { locale: de });
        return [field.label, display];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Bezeichnung', 'Details']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8, cellPadding: 2 },
        styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240] },
        margin: { left: margin, right: margin, bottom: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Photos
    const photos = fields.filter(f => f.type === 'photo' && submission.field_values?.[f.id]);
    if (photos.length > 0) {
        if (currentY + 30 > pageHeight) { doc.addPage(); currentY = 15; }
        doc.setFontSize(10).setTextColor(primaryColor).setFont('helvetica', 'bold').text('Dokumentation', margin, currentY);
        currentY += 8;
        let x = margin;
        photos.forEach(f => {
            const base64 = submission.field_values[f.id];
            if (base64?.startsWith('data:')) {
                if (currentY + 40 > pageHeight) { doc.addPage(); currentY = 15; x = margin; }
                try { doc.addImage(base64, 'JPEG', x, currentY, 35, 35); x += 40; if (x + 35 > pageWidth) { x = margin; currentY += 40; } } catch (e) { }
            }
        });
        currentY += 45;
    }

    // Signatures
    if (currentY + 30 > pageHeight) { doc.addPage(); currentY = 15; }
    doc.setFontSize(9).setTextColor(primaryColor).setFont('helvetica', 'bold').text('Unterschriften', margin, currentY);
    currentY += 5;

    doc.setDrawColor(203, 213, 225).rect(margin, currentY, 60, 20);
    doc.setFontSize(6).text('Kunde', margin + 2, currentY + 4);

    const sigUrl = submission.signature_url || submission.field_values?.['signature_customer'];
    if (sigUrl?.startsWith('data:')) doc.addImage(sigUrl, 'PNG', margin + 5, currentY + 5, 50, 12);

    doc.rect(pageWidth - margin - 60, currentY, 60, 20);
    doc.text('Techniker', pageWidth - margin - 58, currentY + 4);

    // Footer all pages
    const total = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(6).setTextColor(148, 163, 184).text(
            `Generiert mit OnSite  |  ${format(new Date(), 'dd.MM.yyyy HH:mm')}  |  Seite ${i} von ${total}`,
            pageWidth / 2, pageHeight - 10, { align: 'center' }
        );
    }

    doc.save(`Bericht_${submission.customer_name.replace(/\s+/g, '_')}.pdf`);
};
