import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

// Simple stub generator: computes a few mock insights based on recent data
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    // load some data to base predictions on
    const properties = await prisma.property.findMany({ where: { accountId: (user as any).accountId || undefined } });

    const created: any[] = [];

    for (const p of properties) {
      // Mock occupancy insight
      const occupancy = Math.round(80 + Math.random() * 20);
      const occInsight = await prisma.aIInsight.create({
        data: {
          userId: (user as any).sub || (user as any).id,
          propertyId: p.id,
          category: 'occupancy_forecast',
          insight: `Predicted occupancy for ${p.name || p.title || p.id}: ${occupancy}% next month`,
          confidence: Math.round((50 + Math.random() * 50) * 100) / 100 as any,
        },
      });
      created.push(occInsight);

      // Mock delinquency risk insight
      const riskVal = Math.round(Math.random() * 100);
      const delinqlvl = riskVal > 75 ? 'high' : riskVal > 40 ? 'medium' : 'low';
      const delInsight = await prisma.aIInsight.create({
        data: {
          userId: (user as any).sub || (user as any).id,
          propertyId: p.id,
          category: 'delinquency_risk',
          insight: `Estimated delinquency risk for ${p.name || p.title || p.id}: ${delinqlvl} (${riskVal}%)`,
          confidence: Math.round((40 + Math.random() * 60) * 100) / 100 as any,
        },
      });
      created.push(delInsight);

      // Mock expense projection
      const expense = Math.round(500 + Math.random() * 5000);
      const expInsight = await prisma.aIInsight.create({
        data: {
          userId: (user as any).sub || (user as any).id,
          propertyId: p.id,
          category: 'expense_projection',
          insight: `Projected maintenance & vendor costs for next 6 months: $${expense}`,
          confidence: Math.round((30 + Math.random() * 70) * 100) / 100 as any,
        },
      });
      created.push(expInsight);
    }

    return res.status(200).json({ success: true, created: created.length });
  } catch (e: any) {
    console.error('ai-insights/generate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
