import { Router } from 'express';
import { validateQuery } from '../middleware/validation';
import { z } from 'zod';
import { GOVERNMENT_SCHEMES, schemeUtils } from '@shared/government-schemes';

const router = Router();

// Validation schema for scheme queries
const schemeQuerySchema = z.object({
  category: z.enum(['income_support', 'credit', 'insurance', 'subsidy', 'training']).optional(),
  search: z.string().optional(),
  active: z.string().transform(val => val === 'true').default('true'),
});

// Get all government schemes
router.get('/', validateQuery(schemeQuerySchema), (req, res) => {
  try {
    const { category, search, active } = req.query as any;
    
    let schemes = GOVERNMENT_SCHEMES;

    // Filter by active status
    if (active) {
      schemes = schemes.filter(scheme => scheme.isActive);
    }

    // Filter by category
    if (category) {
      schemes = schemeUtils.getSchemesByCategory(category);
    }

    // Filter by search query
    if (search) {
      schemes = schemeUtils.searchSchemes(search);
    }

    // Add summary statistics
    const summary = {
      total: schemes.length,
      byCategory: {
        income_support: schemeUtils.getSchemesByCategory('income_support').filter(s => s.isActive).length,
        credit: schemeUtils.getSchemesByCategory('credit').filter(s => s.isActive).length,
        insurance: schemeUtils.getSchemesByCategory('insurance').filter(s => s.isActive).length,
        subsidy: schemeUtils.getSchemesByCategory('subsidy').filter(s => s.isActive).length,
        training: schemeUtils.getSchemesByCategory('training').filter(s => s.isActive).length,
      }
    };

    res.json({
      schemes,
      summary,
      filters: {
        category: category || null,
        search: search || null,
        active,
      }
    });

  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch schemes',
      error: error.message 
    });
  }
});

// Get scheme by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scheme = schemeUtils.getSchemeById(id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json(scheme);

  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch scheme details',
      error: error.message 
    });
  }
});

// Get schemes by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['income_support', 'credit', 'insurance', 'subsidy', 'training'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const schemes = schemeUtils.getSchemesByCategory(category as any)
      .filter(scheme => scheme.isActive);

    res.json({
      category,
      categoryName: schemeUtils.getCategoryName(category as any),
      schemes,
      count: schemes.length,
    });

  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch schemes by category',
      error: error.message 
    });
  }
});

export default router;