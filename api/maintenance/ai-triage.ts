import { z } from 'zod';
import { defineHandler } from '../_handler';

const Body = z.object({
  tenantId: z.string().min(1),
  description: z.string().min(5),
});

function analyzeText(desc: string) {
  const d = desc.toLowerCase();
  const has = (xs: string[]) => xs.some((x) => d.includes(x));

  let category: string = 'general';
  let vendor: string = 'Handyman';
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let slaHours = 72;

  if (has(['gas leak', 'gas smell', 'carbon monoxide'])) {
    category = 'life_safety'; vendor = 'Emergency'; priority = 'Critical'; slaHours = 1;
  } else if (has(['fire', 'smoke'])) {
    category = 'life_safety'; vendor = 'Emergency'; priority = 'Critical'; slaHours = 1;
  } else if (has(['flood', 'burst', 'pipe burst', 'water everywhere'])) {
    category = 'plumbing'; vendor = 'Plumber'; priority = 'High'; slaHours = 4;
  } else if (has(['no heat', 'heater not working', 'furnace', 'hvac'])) {
    category = 'hvac'; vendor = 'HVAC'; priority = 'High'; slaHours = 8;
  } else if (has(['no ac', 'ac not working', 'air conditioner'])) {
    category = 'hvac'; vendor = 'HVAC'; priority = 'High'; slaHours = 12;
  } else if (has(['toilet', 'leak', 'drip', 'sink leaking', 'shower leaking'])) {
    category = 'plumbing'; vendor = 'Plumber'; priority = 'High'; slaHours = 24;
  } else if (has(['electrical', 'outlet spark', 'sparking', 'breaker', 'no power'])) {
    category = 'electrical'; vendor = 'Electrician'; priority = 'High'; slaHours = 8;
  } else if (has(['lock', 'lost key', 'door won\'t lock', 'locked out'])) {
    category = 'locks'; vendor = 'Locksmith'; priority = 'High'; slaHours = 4;
  } else if (has(['roach', 'pest', 'mice', 'ants', 'bed bug'])) {
    category = 'pest_control'; vendor = 'Pest Control'; priority = 'Medium'; slaHours = 48;
  } else if (has(['fridge', 'refrigerator', 'stove', 'oven', 'dishwasher', 'washer', 'dryer'])) {
    category = 'appliance'; vendor = 'Appliance Repair'; priority = 'Medium'; slaHours = 48;
  } else if (has(['mold'])) {
    category = 'environmental'; vendor = 'Environmental'; priority = 'High'; slaHours = 24;
  } else if (has(['window broken', 'glass broken', 'door broken'])) {
    category = 'glazing'; vendor = 'Glazier'; priority = 'High'; slaHours = 24;
  }

  // Seasonality tweaks
  if (has(['no heat']) && has(['winter'])) { priority = 'Critical'; slaHours = 4; }
  if (has(['no ac']) && has(['heatwave'])) { priority = 'High'; slaHours = 8; }

  return { category, vendor, priority, slaHours };
}

export default defineHandler({
  methods: ['POST'],
  roles: ['TENANT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  bodySchema: Body,
  limitKey: 'maintenance:ai-triage',
  fn: async ({ res, body }) => {
    const result = analyzeText(body.description);
    return res.status(200).json(result);
  },
});
