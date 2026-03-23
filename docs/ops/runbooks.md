# Runbooks

## Refresh Failure
- Mark refresh job failed or stale
- Preserve prior recommendations
- Surface freshness warning in the workbench and Accounts Board
- Re-run manually after source issue is resolved

## Duplicate Merge Review
- Inspect deterministic identifiers first
- Compare aliases and domains
- Avoid silent merge below threshold
- Preserve reversible merge history

## Source Rejection
- Reject unsupported or out-of-scope sources
- Log source class and reason
- Prevent downstream normalization from using rejected content

## Recommendation Drift Review
- Sample changed recommendations
- Inspect evidence quality, freshness, and conflict changes
- Roll back rules if taxonomy or weighting changes degrade quality
- Confirm Accounts Board summaries still match the recommendation-level states after drift handling

## Access Issue Handling
- Confirm role boundary
- Confirm field-level exposure rules
- Escalate to security/privacy owner for unresolved scope questions
