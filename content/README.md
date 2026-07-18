# Engineer Zero content authoring

Track metadata and interactive activities currently live in `lib/tracks.ts` so the platform can run without a CMS. Add long-form lesson bodies as versioned MDX below this folder using this convention:

```text
content/
  applied-ai-operations/
    v1/
      fast-track/
        api-contracts.mdx
  it-support-technician/
    v1/
      fast-track/
        enterprise-windows.mdx
```

Each MDX file must carry front matter that matches a stable `LearningItem.id`, `trackId`, `contentVersion`, competency mapping, evidence type, and rubric. Do not put assessment answers, private learner data, or sensitive operational content in MDX.

```mdx
---
id: it-support-technician-fast-track-01
trackId: it-support-technician
contentVersion: v1
evidenceType: explain
---

# Enterprise Windows Administration

Lesson body goes here. End with a required artifact, decision, or explanation.
```
