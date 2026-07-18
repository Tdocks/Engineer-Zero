# Program Engineer Zero — Reusable Track Blueprint
## Filled reference: Track 02 — IT Support Technician (Mission-Critical Enterprise Support)

**Purpose:** This document is the source-of-truth template for creating a new Engineer Zero career track. Copy the sections marked `TEMPLATE` for any future role; this IT Support Technician version shows the required level of detail, content depth, product behavior, and evaluation model.

**Safety boundary:** All scenarios, logs, tickets, users, systems, and procedures in the product are fictional and sanitized. Do not use internal, export-controlled, personally identifiable, proprietary, or operationally sensitive data as training content.

---

# Part A — Reusable Track Template

## 1. Track identity

```yaml
track:
  id: "<stable-kebab-case-id>"
  number: "<display-order>"
  title: "<role title>"
  subtitle: "<plain-language specialization>"
  status: "active | beta | planned"
  primary_audience: "<who this track is for>"
  target_environment: "<industry/operating context>"
  primary_outcome: "<observable candidate outcome>"
  prerequisite_level: "zero | beginner | experienced"
  primary_languages_or_tools: ["<only what matters>"]
  credential_statement: "<what a graduate can credibly claim>"
```

Every track must answer:

1. What is the real job, beyond its title?
2. What does a strong candidate need to build, diagnose, explain, and defend?
3. What is the emergency path if the learner’s interview is in 48 hours?
4. What can safely be simulated in a browser, and what requires later controlled hardware/cloud labs?
5. Which decisions should remain deterministic rather than delegated to AI?

## 2. Required shared phases

Every Engineer Zero track uses the same progression. A track may add modules, but cannot remove these phases.

| Phase | Purpose | Required output |
|---|---|---|
| 0. Reality Check | Explain the work, environment, constraints, and baseline gaps. | Learner profile + baseline assessment |
| 1. 48-Hour Crash Course | Make the learner credible for an imminent interview. | Interview packet + high-priority drills |
| 2. Fast Track | Build job-ready fundamentals through concise active practice. | Practical evidence portfolio |
| 3. Master Track | Develop durable depth beyond the interview. | Advanced labs + capstone |
| 4. Interview Simulator | Test technical reasoning, communication, and project defense. | Readiness report + mock interview history |

## 3. Required product surfaces

Each track must supply content for the same application surfaces:

- **Today:** next best task, momentum, weakest high-impact competency, resume controls.
- **Academy:** compact concept lessons; every lesson ends in an explanation, decision, or artifact.
- **Labs:** repeatable practice in Solo, Pair Programming, AI Builder, and Production Incident modes.
- **Missions:** ambiguous, multi-step work scenarios; the correct answer may be *no automation* or escalation.
- **Projects:** guided case-study builder with problem, constraints, contribution, architecture, evaluation, risks, results, and reflection.
- **Interview:** fast drills, behavioral stories, system/design scenarios, project defense, and full simulations.
- **Readiness:** evidence-based competency matrix—not a course completion percentage.
- **Kyra:** structured Socratic coaching first; optional live model later through a protected server boundary.

## 4. Content contract

Each track should be declared from typed data rather than one-off UI. Use this implementation contract when adding it to the app:

```ts
type TrackDefinition = {
  id: string;
  title: string;
  subtitle: string;
  roleSummary: string;
  competencyWeights: Record<CompetencyKey, number>;
  realityCheck: RealityCheckContent;
  crashCourse: CrashCourseDay[];
  fastTrackModules: LearningItem[];
  masterTrackModules: LearningItem[];
  labs: LabDefinition[];
  missions: MissionDefinition[];
  interviewBank: InterviewQuestion[];
  projectTemplates: ProjectTemplate[];
  assessment: AssessmentQuestion[];
};

type LearningItem = {
  id: string;
  title: string;
  pillar: string;
  durationMinutes: number;
  summary: string;
  objectives: string[];
  competencyWeights: Partial<Record<CompetencyKey, number>>;
  evidenceType: "explain" | "decision" | "artifact" | "build" | "troubleshoot";
  completionPrompt: string;
  rubric: Rubric;
};

type Rubric = {
  criteria: Array<{
    id: string;
    label: string;
    description: string;
    weight: number;
  }>;
  minimumEvidence: string[];
};
```

Stable IDs are required. Never use display titles as persistence keys. Track content is versioned; learner progress should keep its original content version after updates.

## 5. Evaluation model

Use eight shared competencies unless a role needs a justified addition:

1. Software/system foundations
2. Role-specific technical judgment
3. System architecture/design
4. Security and safe operating boundaries
5. Debugging and production/incident response
6. Technical leadership and ownership
7. Written and verbal communication
8. AI collaboration and independent judgment

Score each competency on four evidence levels:

- **Understands:** explains the concept accurately.
- **Builds:** produces an artifact, configuration, or implementation.
- **Troubleshoots:** isolates, tests, recovers, and documents a failure.
- **Defends:** explains tradeoffs, risk, and personal contribution under questioning.

Readiness is a weighted score from baseline assessment, completed evidence, rubric scores, and recency. It must never increase merely because the learner opened a lesson.

## 6. AI-native learning modes

All tracks must use these modes deliberately:

| Mode | Learner responsibility | AI availability |
|---|---|---|
| Solo | Think, diagnose, explain, and write core work independently. | Off |
| Pair Programming | Ask for hints, discuss tradeoffs, then implement or decide. | Coach mode |
| AI Builder | Review, test, secure, and explain a substantial AI-generated draft. | On |
| Production Incident | Recover from a failure introduced by generated work. | Off by design |

The program rewards responsible AI use. It does not reward copying an answer or penalize normal AI collaboration. The graduation standard is: **understand everything you ship and continue making safe progress when AI is unavailable.**

## 7. Track authoring checklist

Before shipping a new track, ensure it has:

- A zero/beginner path, a 48-hour emergency path, a 2–3 week fast path, and a longer mastery path.
- At least 18 assessment questions, mapped to competencies.
- At least 5 academy modules, 5 labs, and 4 missions.
- One lab for every AI-native mode and one lab covering each major role pillar.
- At least 2 project templates and 50 interview questions before beta; expand to 150–200 for a mature track.
- Fictional scenario content, explicit safe boundaries, and no proprietary source material.
- Rubrics, completion evidence, feedback, and follow-up questions for every interactive activity.
- Mobile-friendly drills; keep full technical work desktop-first.

---

# Part B — Filled Track: IT Support Technician

## 1. Track identity

```yaml
track:
  id: "it-support-technician"
  number: "02"
  title: "IT Support Technician"
  subtitle: "Mission-Critical Enterprise Support"
  status: "active"
  primary_audience: "Learners with zero to early enterprise IT experience preparing for high-performance support roles."
  target_environment: "Engineering, manufacturing, and mission-critical operations with 24x7 support expectations."
  primary_outcome: "A candidate who can triage and troubleshoot enterprise endpoint, network, printing, AV, and account issues; communicate calmly; and defend a safe support decision in an interview."
  prerequisite_level: "zero"
  primary_languages_or_tools: ["PowerShell", "Bash", "Python", "Windows", "Microsoft 365", "IP networking"]
  credential_statement: "I can support enterprise users and endpoints through a structured troubleshooting process, work safely under urgency, document repeatable fixes, and use AI as a verified troubleshooting copilot."
```

### Role interpretation

This is not consumer tech support. It is an enterprise endpoint and infrastructure support role with four equally important responsibilities:

1. Restore users quickly and safely.
2. Protect the configuration, network, assets, and operational environment.
3. Deliver calm, respectful, technically credible service to demanding engineering users.
4. Improve the support system through documentation, repeatable workflows, inventory discipline, and escalation.

The candidate must be able to handle first-line issues, perform deeper second/third-tier diagnosis, and know exactly when a network, identity, security, systems, AV, or vendor escalation is appropriate.

### Mission-critical operating principles

- Restore safe operation first; avoid unreviewed changes during a critical window.
- Confirm user impact, urgency, authority, and blast radius before acting.
- Prefer reversible changes and known-good swaps when time matters.
- Preserve evidence: symptoms, timestamps, logs, identifiers, and actions taken.
- Communicate status, next action, ownership, and estimated checkpoint—not false certainty.
- Close the loop with verification, asset/documentation updates, and a reusable runbook when warranted.

## 2. Competency map and weighting

| Competency | Weight | Evidence that demonstrates readiness |
|---|---:|---|
| Endpoint & hardware support | 1.00 | Diagnoses boot, storage, display, dock, peripheral, and OS issues; selects safe replacement/recovery paths. |
| Networking & connectivity | 1.05 | Explains IP/DNS/DHCP/VLAN basics; isolates device, port, Wi-Fi, DNS, and upstream issues. |
| Microsoft & identity systems | 1.00 | Works through account, MFA, endpoint, BitLocker, M365, and directory concepts safely. |
| Printing, mobile, and AV | 0.80 | Diagnoses print queues/drivers/connectivity, mobile enrollment, and meeting-room failures. |
| Asset lifecycle & deployment | 0.90 | Receives, tags, configures, deploys, recovers, and retires assets with traceability. |
| Incident response & safe operations | 1.05 | Prioritizes, contains, escalates, communicates, and documents under time pressure. |
| Service communication | 1.00 | Translates technical work clearly; manages interruptions and expectations. |
| AI collaboration & automation | 0.75 | Uses AI to accelerate analysis/scripts/docs, then validates and owns the result. |

## 3. Phase 0 — Reality Check

**Duration:** 45 minutes

### Objectives

- Distinguish home troubleshooting from enterprise support.
- Understand ticket ownership, service impact, identity/access boundaries, change control, and escalation.
- Recognize the difference between urgency and unsafe improvisation.
- Identify current gaps in Windows, hardware, networking, Microsoft services, printing, macOS/Linux, automation, and communication.

### Baseline assessment

Ship 24 questions: three per competency. Each question is a real support decision, not trivia. Example prompts:

| Topic | Example question | Strong answer signal |
|---|---|---|
| Hardware | A workstation fails to boot 15 minutes before a critical operation. What do you do first? | Confirm impact, preserve data/evidence, use a known-good swap or recovery plan, and communicate escalation. |
| Networking | The device has an IP address but cannot reach an internal name. What do you test? | DNS resolution, assigned DNS servers, name-vs-IP behavior, network scope, and recent changes. |
| VLANs | A test device works on a bench network but not at its final location. What do you verify? | Physical link, port/VLAN policy, authorization, addressing, and ownership before requesting a change. |
| Printing | A label printer is online but jobs remain queued. What is the process? | Confirm queue/device state, driver/port, print server path, test page, and user-specific scope. |
| Service | Three urgent requests arrive at once. What do you do? | Triage impact and time sensitivity, acknowledge each request, set checkpoints, and escalate/reschedule lower-risk work. |
| AI | An AI tool suggests a registry change. What must happen before use? | Confirm source and applicability, test safely, create rollback, follow change policy, and document results. |

### Reality Check completion artifact

Learner writes a one-page response to:

> “A senior engineer says their workstation, external displays, and wired network stopped working just before a critical test. Explain your first five minutes, your communication, and what you will not do without evidence.”

Rubric: safe triage, diagnostic order, customer communication, escalation awareness, evidence preservation.

## 4. Phase 1 — 48-Hour Interview Crash Course

**Audience:** interview scheduled in 48 hours or less.

**Goal:** Do not pretend to create an expert. Create a candidate with sound troubleshooting instincts, correct terminology, credible communication, and two strong project/experience stories.

### Hour-by-hour schedule

| Window | Topic | Must be able to do or explain | Artifact/drill |
|---|---|---|---|
| 0–2 | Role and value proposition | Explain the role as enterprise endpoint/infrastructure support plus customer service under operational pressure. | 90-second “why me” answer. |
| 2–5 | Hardware fundamentals | Identify RAM, SSD/NVMe/SATA, CPU, motherboard, PSU, docks, USB-C/Thunderbolt, HDMI/DP, Ethernet, Wi-Fi, BIOS/UEFI. | Boot failure decision tree. |
| 5–8 | Windows support | Use Task Manager, Device Manager, Event Viewer, Services, Windows Update, BitLocker concepts, CMD and PowerShell basics. | Diagnose a driver failure scenario. |
| 8–12 | Network fundamentals | Explain IP, subnet, gateway, DHCP, DNS, MAC, switches, routers, VLANs, ports, ping, tracert, ipconfig, nslookup. | “Connected but cannot reach internal app” drill. |
| 12–15 | Ticket discipline | Gather symptoms, reproduce, isolate, test, verify, document, close. | Write a high-quality ticket update. |
| 15–18 | Microsoft & identity | Explain directory concepts, MFA, password resets, permissions, M365 basics, device management concepts. | Account-access triage drill. |
| 18–21 | Printing and peripherals | Explain queues, drivers, ports, print servers, label/thermal printers, MFPs, docks, displays. | Printer offline flow. |
| 21–24 | macOS, Linux, mobile | Use basic macOS settings/Terminal, SSH, Linux files/permissions/systemctl/journalctl, MDM/SIM/eSIM basics. | Rapid commands and support terminology. |
| 24–29 | Customer service | Handle interruptions, difficult users, status updates, escalation, and urgency. | Three STAR stories. |
| 29–34 | Mission-critical scenarios | Make safe decisions under launch/manufacturing/test urgency. | Workstation failure and conference-room outage simulations. |
| 34–38 | AI copilot discipline | Use AI for log interpretation, documentation, and PowerShell drafts; validate every recommendation. | Critique an AI-generated fix. |
| 38–43 | Technical rapid fire | Answer 50 timed foundational questions. | Score + remediation list. |
| 43–46 | Behavioral rapid fire | Answer 20 questions using concise STAR structure. | Story bank. |
| 46–48 | Final simulation | Complete a 30-minute interview and review weak areas. | Interview packet. |

### Day 1 immediate-study checklist

- Windows 10/11: Device Manager, Event Viewer, Services, Task Manager, Windows Update, BitLocker, local accounts, command line.
- Hardware: laptop/desktop components, SSD replacement, docks, displays, USB/Thunderbolt, BIOS/UEFI, safe swap strategy.
- Networking: DHCP, DNS, default gateway, ARP, VLAN basics, common support commands.
- Troubleshooting methodology: observe → reproduce → gather → isolate → test → verify → document.

### Day 2 immediate-study checklist

- Identity and Microsoft: Active Directory concepts, Entra concepts, M365, MFA, permissions, password/account lockout process.
- Printing: queues, drivers, TCP/IP ports, print server concepts, Zebra/thermal/label printers, MFPs.
- Cross-platform: macOS fundamentals, Linux shell/SSH/permissions/logs, iOS/Android/MDM concepts.
- Service and mission operations: triage, communication, ownership, escalation, runbooks, asset accountability.

### Crash-course interview packet

The learner cannot finish the course without saving:

1. A 90-second role narrative.
2. A “computer will not boot” troubleshooting explanation.
3. A “connected but internal name will not resolve” networking explanation.
4. A safe mission-critical workstation recovery plan.
5. A printer troubleshooting explanation.
6. Three STAR stories: urgency, difficult user, process improvement.
7. Two project/experience case studies.
8. A personal 10-topic remediation list.

## 5. Phase 2 — Fast Track

**Duration:** 2–3 weeks, 60–90 minutes per day.

| Module | Competencies | Practical completion evidence |
|---|---|---|
| 1. Enterprise support workflow | Service, incident response | Write a ticket lifecycle and escalation decision tree. |
| 2. Windows endpoint administration | Endpoint, Microsoft | Diagnose a driver, profile, and update failure. |
| 3. Hardware diagnostics and deployment | Endpoint, asset lifecycle | Select repair/swap/recovery actions for five endpoint faults. |
| 4. Networking for support | Networking, incident response | Diagnose DNS, DHCP, VLAN, Wi-Fi, and cabling scenarios. |
| 5. Microsoft identity and productivity | Microsoft, service | Resolve simulated MFA, account, group, and application-access cases. |
| 6. Enterprise printing | Printing, network | Build a printer triage flow and resolve three queue/driver/port failures. |
| 7. macOS, Linux, and mobile | Endpoint, Microsoft | Complete cross-platform command/settings drills. |
| 8. AV and conference rooms | Endpoint, service | Restore a fictional room system using a safe pre-meeting checklist. |
| 9. Asset lifecycle | Asset lifecycle, leadership | Produce a receiving-to-recovery chain of custody record. |
| 10. PowerShell and automation | AI collaboration, production | Review and safely run a basic inventory/reporting script. |
| 11. Documentation | Service, communication | Write a concise KB article and a critical-incident update. |
| 12. Mission-critical support | Incident response, leadership | Run a timed multi-ticket triage simulation. |

## 6. Phase 3 — Master Track

**Duration:** 8–12 weeks. This is not required for an imminent interview, but creates durable professional depth.

### Technical domains

- Windows internals, troubleshooting, imaging, Autopilot, MECM/SCCM concepts, drivers, profiles, encryption, patching.
- Enterprise networking: switching, VLANs, 802.1X concepts, DHCP/DNS, Wi-Fi, ports, cabling, PoE, fiber basics.
- Microsoft ecosystem: Active Directory concepts, Entra ID, Intune, M365, Exchange Online, Teams, OneDrive, SharePoint, permissions and device compliance.
- Endpoint diversity: macOS, iOS, Android, Linux, SSH, package management, permissions, log collection.
- Enterprise printing, label/thermal systems, MFPs, print server architecture, drivers and queues.
- AV/conference technologies: displays, docks, cameras, microphones, room controllers, signal paths, escalation.
- Asset management: procurement, receiving, tagging, secure storage, deployment, repair, warranty, recovery, disposal, audit.
- Automation: PowerShell first, then Bash/Python for safe inventory/reporting/log-collection workflows.
- Security/service operations: least privilege, patching, encryption, endpoint protection, change control, backup/recovery concepts, documentation, ITIL-style service delivery.

### Master capstone

**Mission Control Endpoint Readiness Program**

The learner designs a fictional endpoint support program for a high-urgency engineering facility:

- hardware and mobile procurement/asset lifecycle;
- standard workstation deployment and replacement;
- identity/device-management dependencies;
- wired/wireless/printing/conference-room support boundaries;
- critical-operation incident response and escalation paths;
- 10 runbooks, 3 PowerShell automation proposals, and a metrics dashboard;
- a risk register and a phased rollout plan.

## 7. Academy seed catalog

Initial production seed: 24 short lessons. Each ends in an artifact, decision, or explanation.

| Pillar | Seed lessons |
|---|---|
| Endpoint & hardware | Boot sequence; storage health; drivers; docks/displays; BitLocker; profile recovery. |
| Networking | IP/DHCP/DNS; VLANs; Wi-Fi; cable/port diagnosis; routing basics; network escalation. |
| Microsoft/identity | AD vs Entra concepts; MFA; groups/permissions; M365 support; Intune concepts; account lifecycle. |
| Printing/AV/mobile | Print path; Zebra/thermal printers; MFPs; conference rooms; iOS/Android enrollment; macOS support. |
| Operations/service | Triage; ticket writing; prioritization; asset lifecycle; change/safe escalation; user communication. |
| Automation/AI | PowerShell basics; log collection; AI-assisted script review; documentation generation; verification and rollback. |

## 8. Labs

Launch with 12 labs; expand to 75–100 across the Master Track.

| ID | Mode | Lab | Required decision/evidence |
|---|---|---|---|
| it-lab-01 | Solo | Workstation will not boot | Separate power, display, firmware, storage, and OS hypotheses; choose safe recovery. |
| it-lab-02 | Solo | DNS but not network | Use ipconfig/nslookup/ping logic to identify name-resolution scope. |
| it-lab-03 | Pair Programming | PowerShell inventory review | Ask Kyra for explanations, then identify validation, permissions, output, and rollback. |
| it-lab-04 | AI Builder | AI-generated printer fix | Reject unsafe registry/driver advice; choose verified queue/port/driver steps. |
| it-lab-05 | Production Incident | Duplicate account/device action | Contain impact, inspect logs, correct state, add a prevention step. |
| it-lab-06 | Solo | Dock/display failure | Distinguish dock firmware, cable, power delivery, display input, and GPU-driver issues. |
| it-lab-07 | Pair Programming | BitLocker recovery | Explain identity/recovery-key policy and customer-safe communication. |
| it-lab-08 | AI Builder | Vulnerable network device onboarding | Identify why AI cannot grant VLAN/port access without authorized network ownership. |
| it-lab-09 | Production Incident | Conference room failure before critical meeting | Restore an approved fallback; preserve evidence; set escalation/update cadence. |
| it-lab-10 | Solo | Asset recovery audit | Reconcile tag, serial, assigned user, status, and secure disposition. |
| it-lab-11 | Pair Programming | Linux log triage | Use journalctl/systemctl outputs to form and verify a support hypothesis. |
| it-lab-12 | Solo | Non-technical explanation | Explain a network/identity issue and next step without jargon. |

## 9. Missions

Each mission should take 20–45 minutes and include a decision, short response, rubric, and follow-up challenge.

1. **Critical workstation recovery:** An engineer loses a primary workstation before a time-sensitive test. Decide triage, replacement strategy, evidence collection, customer updates, and escalation.
2. **Production device network onboarding:** A non-traditional test device needs network access. Determine what to collect, who owns VLAN/port authorization, and why bypasses are unacceptable.
3. **Label printing outage:** Manufacturing labels fail at a shared printer. Separate application/queue/server/driver/network/device causes and decide the safe contingency.
4. **Conference room preflight failure:** An executive/engineering review room fails five minutes before start. Choose recovery, fallback, communication, and post-incident work.
5. **Asset lifecycle discrepancy:** An asset audit finds a device with missing custody data. Reconstruct safe next actions and a process improvement.
6. **Skeptical engineer support:** A high-pressure engineer rejects troubleshooting questions. Demonstrate calm discovery, ownership, boundaries, and status communication.

## 10. Project templates

### Template A — Endpoint Lifecycle Improvement

- **Problem:** Replacement devices are deployed inconsistently, causing user downtime and incomplete asset records.
- **Users:** Engineers, technicians, IT asset owners, and service leadership.
- **Constraints:** Fictional/sanitized data; hardware traceability; approved tooling; no unsanctioned access changes.
- **Architecture/process:** Receive → tag → record → configure → encrypt → validate → deliver → recover → wipe/retire → audit.
- **Evaluation:** Deployment time, first-week incident rate, asset-record completeness, recovery compliance.
- **Defense question:** Which steps are safety/security controls versus convenience steps, and what would break if one is skipped?

### Template B — Critical Operations Support Runbook

- **Problem:** High-urgency endpoint, printing, and meeting-room incidents lack a consistent response path.
- **Users:** IT support staff and operational users.
- **Constraints:** Time pressure, limited change authority, escalation boundaries, evidence preservation, user communication.
- **Architecture/process:** Intake → impact/urgency triage → safe containment → known-good swap/fallback → diagnostics → escalation → verification → ticket/runbook update.
- **Evaluation:** Time to acknowledge, time to restore safe operation, accurate escalation, repeat incident reduction, stakeholder feedback.
- **Defense question:** How do you distinguish a rapid workaround from a reliable fix, and how do you document both?

## 11. Interview simulator

### Interview rounds

| Round | What it evaluates | Sample prompt |
|---|---|---|
| Recruiter/hiring manager | Motivation, constraints, shifts, urgency, communication. | “Why this kind of enterprise support role?” |
| Hardware/Windows | Endpoint diagnosis and safe repair/replacement. | “Walk me through a laptop that powers on but will not boot Windows.” |
| Networking | Layered troubleshooting and escalation boundaries. | “The user has Wi-Fi but cannot reach an internal hostname.” |
| Microsoft/identity | Access, MFA, device and user support judgment. | “A user is locked out during an important operation—what do you verify?” |
| Printing/AV/mobile | Breadth and method, not trivia. | “A Zebra printer receives jobs but prints blank labels.” |
| Scenario/pressure | Prioritization and mission-critical behavior. | “Three high-priority issues arrive simultaneously; how do you manage them?” |
| Project defense | Ownership, documentation, process improvement, AI use. | “Tell me what you personally changed and how you verified it.” |

### Question bank plan

- **Crash course:** 50 technical + 20 behavioral questions.
- **Beta track:** 100 technical + 50 behavioral/scenario questions.
- **Mature track:** 150–200 total questions with variants, rubrics, common mistakes, model answer structure, and follow-up questions.

### Required behavioral story bank

The learner creates and rehearses at least five STAR stories:

1. Urgent incident / pressure.
2. Difficult user or stakeholder.
3. Competing priorities.
4. Process improvement or documentation.
5. Learning an unfamiliar technology quickly.

Every story must include a concrete action, a result/evidence statement, and a reflection—not generic claims about teamwork.

## 12. Kyra coaching contract

### Structured coaching behavior

Kyra should first ask questions, not give the final fix. For IT support scenarios, it evaluates:

- symptom/impact clarification;
- safe first action;
- diagnostic sequence;
- security/change/authorization awareness;
- escalation boundary;
- customer update quality;
- verification and documentation.

### Feedback format

1. What was strong.
2. What safety/technical evidence was missing.
3. What a senior technician or interviewer would challenge.
4. One improved response structure.
5. One follow-up question.

### Live-AI boundary

Use deterministic rubrics as the default. If a live provider is enabled later, call it only through a protected server/edge function; use bounded fictional prompts, rate limits, audit metadata, response limits, and a structured fallback. Never place a model credential in the client and never send sensitive operational content to an unapproved service.

## 13. Completion and graduation standard

### 48-hour crash course completion

The learner has a complete interview packet and can coherently explain core Windows, hardware, networking, Microsoft, printing, cross-platform, service, and mission-critical concepts.

### Fast Track completion

The learner has completed all 12 modules, 12 labs, 6 missions, 2 case studies, 5 behavioral stories, and one scored full simulation.

### Master Track graduation

The learner can:

- use a disciplined troubleshooting methodology across endpoint, network, printing, AV, identity, and cross-platform problems;
- deploy, recover, and account for assets through their lifecycle;
- operate safely in a high-urgency environment;
- write a usable runbook and ticket update;
- communicate with engineers and non-technical users;
- use AI to accelerate research, scripting, logs, and documentation while validating every recommendation;
- explain and defend technical decisions in an interview.

## 14. Implementation acceptance criteria

The finished IT Support Technician track is ready when:

- A new learner can select the track, complete the baseline, and receive a track-specific readiness map.
- The 48-hour path is available immediately and produces the complete interview packet.
- Every main app surface contains IT Support content; no track route points to a generic placeholder.
- Completion records require a saved answer, artifact, or evaluated decision.
- The learner can reopen drafts after refresh and revise a case study or interview answer.
- Labs include all four AI-native modes; Production Incident mode deliberately removes AI assistance.
- All scenarios are clearly fictional/sanitized and teach escalation/authorization boundaries.
- Mobile supports drills, review, and interview practice; detailed project and lab work remains desktop-first.

---

# Part C — How to Use This for the Next Track

1. Copy **Part A** into a new `TRACK_TEMPLATE_<ROLE>.md` document.
2. Replace every role-specific section in **Part B** with the job description, operating environment, role competency map, and safe boundaries for the new role.
3. Keep the product surfaces, four AI-native modes, evidence model, and shared phases intact.
4. Write content first for the 48-hour course, then Fast Track, then Master Track. Do not build a broad curriculum before the emergency interview path is useful.
5. Convert the resulting content to the `TrackDefinition` contract and add it to the app’s track registry. Add tests that confirm every activity has stable IDs, competency mapping, completion evidence, and a rubric.

The standard is not “the learner finished a course.” The standard is: **the learner can make, explain, test, troubleshoot, and defend the decisions required by the role.**
