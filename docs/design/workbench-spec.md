# Workbench Spec

## Primary Surfaces
- Accounts Board
- Intelligence Workbench
- Recommendation Detail
- Review queue

## Shell Direction
- Use a dark-shell analytic layout with layered panels, restrained accent color, and strong contrast for dense account work
- Keep the Accounts Board as the main navigation home
- Preserve a clear legacy fallback path at `/legacy`

## Responsive Behavior
- Desktop: multi-panel analytic view with account rail, review context, and route-aware drill-downs visible
- Tablet: stacked layout with recommendation and summary priority
- Mobile: intake, summary, and review-first flow with clear drill-downs

## Required UI States
- Empty
- Loading
- Error
- Approved
- Validate in discovery
- Review required
- Stale intelligence
- Conflict visible

## Evidence Presentation Rules
- Show rationale, evidence references, freshness, confidence band, and review state
- Do not show raw uncontrolled page dumps
- Fit and confidence must remain visibly separate
- Next-best action must be framed as a guided human decision, not autonomous execution
- Keep the route hierarchy obvious so users can move from Accounts Board to workbench detail, recommendation detail, and review queue without losing account context
