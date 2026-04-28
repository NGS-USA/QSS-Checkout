// src/services-config.ts

export interface Service {
  id: string;
  name: string;
  description: string;
  level: 1 | 2;
}

export const services: Service[] = [

  // ── Level 1 ──────────────────────────────────────────────────────────────

  {
    id: 'l1-scoping-gap-summary',
    name: 'Scoping Interview & Gap Summary',
    description:
      'Structured scoping interview, Level 1 requirement review, targeted evidence review, stakeholder interviews, gap summary, and an executive readout.',
    level: 1,
  },
  {
    id: 'l1-upload-input-worksheet',
    name: 'Upload-Input Worksheet Draft',
    description:
      'A completed worksheet draft that organises your self-assessment inputs so they are ready to submit.',
    level: 1,
  },
  {
    id: 'l1-working-sessions-evidence',
    name: 'Working Sessions & Evidence Cleanup',
    description:
      'Hands-on working sessions to clean up evidence, build out your evidence index, tailor templates, and run a remediation check-back.',
    level: 1,
  },
  {
    id: 'l1-leadership-debrief',
    name: 'Leadership Debrief',
    description:
      'A structured leadership debrief that walks decision-makers through findings, priorities, and next steps.',
    level: 1,
  },
  {
    id: 'l1-policy-drafting',
    name: 'Policy & Procedure Tailoring',
    description:
      'Tailoring of existing policies and procedures to align with Level 1 requirements, including assessment narrative support.',
    level: 1,
  },
  {
    id: 'l1-evidence-packaging',
    name: 'Evidence Packaging & Upload-Prep Workshop',
    description:
      'Full evidence packaging, an upload-prep workshop, and a management review package ready for submission.',
    level: 1,
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────

  {
    id: 'l2-scoping-doc-review',
    name: 'Scoping Sessions & Document Review',
    description:
      'Scoping sessions, document and evidence review, a requirement-level status worksheet covering all 110 requirements, a prioritised gap list, and an executive briefing.',
    level: 2,
  },
  {
    id: 'l2-artifact-analysis-poam',
    name: 'Deep Artifact Analysis & POA&M',
    description:
      'In-depth artifact analysis, a detailed findings workbook, a prioritised Plan of Action & Milestones (POA&M), an evidence roadmap, and remediation workshops.',
    level: 2,
  },
  {
    id: 'l2-ssp-policy-tailoring',
    name: 'SSP & Policy Tailoring',
    description:
      'System Security Plan (SSP) authoring and policy tailoring aligned to your environment and all 110 requirements.',
    level: 2,
  },
  {
    id: 'l2-evidence-packaging',
    name: 'Evidence Packaging & Upload Narrative',
    description:
      'Full evidence packaging, upload narrative support, and one structured validation pass before submission.',
    level: 2,
  },
  {
    id: 'l2-mock-interview-prep',
    name: 'Mock Interview & Assessor-Response Prep',
    description:
      'Structured mock interview sessions that prepare your team to respond confidently to assessor questions.',
    level: 2,
  },
];

// ── Package matching logic ────────────────────────────────────────────────
//
// Each Stripe price ID corresponds to a package that covers a specific set
// of services. We pick the smallest (cheapest) package that covers ALL of
// what the customer selected.

const L1_PRE_ASSESSMENT_SERVICES   = new Set(['l1-scoping-gap-summary', 'l1-upload-input-worksheet']);
const L1_GUIDED_READINESS_SERVICES = new Set([...L1_PRE_ASSESSMENT_SERVICES, 'l1-working-sessions-evidence', 'l1-leadership-debrief']);
const L1_BUILD_OUT_SERVICES        = new Set([...L1_GUIDED_READINESS_SERVICES, 'l1-policy-drafting', 'l1-evidence-packaging']);

const L2_READINESS_REVIEW_SERVICES = new Set(['l2-scoping-doc-review']);
const L2_GAP_ASSESSMENT_SERVICES   = new Set([...L2_READINESS_REVIEW_SERVICES, 'l2-artifact-analysis-poam']);
const L2_BUILD_OUT_SERVICES        = new Set([...L2_GAP_ASSESSMENT_SERVICES, 'l2-ssp-policy-tailoring', 'l2-evidence-packaging', 'l2-mock-interview-prep']);

function setContainsAll(superset: Set<string>, subset: Set<string>): boolean {
  for (const item of subset) {
    if (!superset.has(item)) return false;
  }
  return true;
}

export function getSelectedPriceIds(selectedServiceIds: string[]): string[] {
  const selected = new Set(selectedServiceIds);

  const l1Selected = new Set([...selected].filter(id => id.startsWith('l1-')));
  const l2Selected = new Set([...selected].filter(id => id.startsWith('l2-')));

  const priceIds: string[] = [];

  // Level 1 — pick the smallest package that covers what was selected
  if (l1Selected.size > 0) {
    if (setContainsAll(L1_BUILD_OUT_SERVICES, l1Selected)) {
      // Build-Out covers everything — check if a smaller package is enough
      if (setContainsAll(L1_GUIDED_READINESS_SERVICES, l1Selected)) {
        if (setContainsAll(L1_PRE_ASSESSMENT_SERVICES, l1Selected)) {
          priceIds.push('price_1TMSWQGgFLISItFODtMv7CDz'); // Pre-Assessment Review $7,500
        } else {
          priceIds.push('price_1TMSbKGgFLISItFO94D6jQsT'); // Guided Readiness $12,500
        }
      } else {
        priceIds.push('price_1TMSf6GgFLISItFOagQCQd5j'); // Build-Out $18,500
      }
    } else {
      priceIds.push('price_1TMSf6GgFLISItFOagQCQd5j'); // Build-Out — best available
    }
  }

  // Level 2 — pick the smallest package that covers what was selected
  if (l2Selected.size > 0) {
    if (setContainsAll(L2_BUILD_OUT_SERVICES, l2Selected)) {
      if (setContainsAll(L2_GAP_ASSESSMENT_SERVICES, l2Selected)) {
        if (setContainsAll(L2_READINESS_REVIEW_SERVICES, l2Selected)) {
          priceIds.push('price_1TMSZzGgFLISItFOmYnpewEP'); // Readiness Review $12,500
        } else {
          priceIds.push('price_1TMSdPGgFLISItFO33dVhDwu'); // Gap Assessment $22,500
        }
      } else {
        priceIds.push('price_1TMSh0GgFLISItFOGwKcmQB0'); // Build-Out $32,500
      }
    } else {
      priceIds.push('price_1TMSh0GgFLISItFOGwKcmQB0'); // Build-Out — best available
    }
  }

  return priceIds;
}