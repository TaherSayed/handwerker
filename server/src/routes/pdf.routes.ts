import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { pdfService } from '../services/pdf.service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Generate PDF for a visit
router.post('/:visitId', async (req, res) => {
  try {
    const { visitId } = req.params;
    
    // Generate PDF and store in Supabase Storage
    const result = await pdfService.generateVisitPDF(visitId, req.userId!);
    
    res.json({
      success: true,
      pdfUrl: result.publicUrl,
      visitId: result.visitId
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF' });
  }
});

export default router;

