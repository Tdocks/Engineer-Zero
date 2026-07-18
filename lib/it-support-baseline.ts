import "server-only";

import type { SourceReference } from "./course-types";
import type { CompetencyKey } from "./types";

export type ItSupportBaselineChoice = { id: string; text: string };
export type ItSupportBaselineQuestion = {
  id: string;
  prompt: string;
  competency: CompetencyKey;
  choices: ItSupportBaselineChoice[];
  correctChoiceId: string;
  rationale: string;
};

const accessed = "2026-07-18";

/**
 * Primary-source records used by the IT Support reality check. They support
 * the bounded instructional claims below; they do not authorize learners to
 * make changes in a real environment.
 */
export const itSupportBaselineSources = {
  windowsTroubleshooting: {
    title: "Windows client troubleshooting documentation",
    url: "https://learn.microsoft.com/en-us/troubleshoot/windows-client/welcome-windows-client",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current Windows client troubleshooting library",
    locator: "Windows Client: identity, networking, printing, security, and management",
    supportedClaim: "A structured support workflow uses scoped evidence and the relevant Windows client diagnostic surface.",
    revalidateBy: "2026-10-18",
  },
  entra: {
    title: "Microsoft Entra ID documentation",
    url: "https://learn.microsoft.com/en-us/entra/identity/",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current Microsoft Entra documentation",
    locator: "Authentication, role-based access control, Conditional Access, and device identity",
    supportedClaim: "Identity verification and authorization are distinct controls; least privilege is an access-management principle.",
    revalidateBy: "2026-10-18",
  },
  intune: {
    title: "Windows device enrollment guide for Microsoft Intune",
    url: "https://learn.microsoft.com/en-us/intune/device-enrollment/windows/guide",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current Microsoft Intune enrollment guide",
    locator: "Windows automatic enrollment, Autopilot, and ownership/enrollment considerations",
    supportedClaim: "Endpoint enrollment methods differ by device ownership and management model.",
    revalidateBy: "2026-10-18",
  },
  bitLocker: {
    title: "BitLocker recovery process",
    url: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/recovery-process",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current BitLocker recovery process guidance",
    locator: "Helpdesk recovery and post-recovery tasks",
    supportedClaim: "Recovery information is sensitive and recovery should follow an approved, attributable process.",
    revalidateBy: "2026-10-18",
  },
  printing: {
    title: "Guidance for troubleshooting printing issues",
    url: "https://learn.microsoft.com/en-us/troubleshoot/windows-server/printing/troubleshoot-printer-guidance",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current printing troubleshooting guidance",
    locator: "Troubleshooting checklist",
    supportedClaim: "Printing diagnosis starts by determining scope and then checking device, server, spool, driver, and client paths.",
    revalidateBy: "2026-10-18",
  },
  vlan: {
    title: "VLAN Configuration Guide",
    url: "https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/vlan/vlan-configuration-guide.pdf",
    publisher: "Cisco",
    accessed,
    version: "Current Catalyst 9000 VLAN configuration guide",
    locator: "VLAN concepts and configuration overview",
    supportedClaim: "VLAN configuration is a network-ownership and segmentation concern, not an endpoint-side workaround.",
    revalidateBy: "2026-10-18",
  },
  incidentResponse: {
    title: "NIST SP 800-61 Rev. 3: Incident Response Recommendations and Considerations",
    url: "https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf",
    publisher: "NIST",
    accessed,
    version: "SP 800-61 Rev. 3, April 2025",
    locator: "Incident response recommendations and considerations",
    supportedClaim: "High-impact incident work requires coordinated response, recovery, communication, and continual improvement.",
    revalidateBy: "2026-10-18",
  },
  teamsRooms: {
    title: "The microphone or speaker status of a Teams Rooms device is unhealthy",
    url: "https://learn.microsoft.com/en-us/troubleshoot/microsoftteams/teams-rooms-and-devices/microphone-speaker-status-unhealthy",
    publisher: "Microsoft Learn",
    accessed,
    version: "Current Teams Rooms troubleshooting guidance",
    locator: "Power, USB cabling, firmware, and peripheral diagnosis",
    supportedClaim: "Conference-room troubleshooting should isolate power, physical connection, selected peripherals, firmware, and the controlled test path.",
    revalidateBy: "2026-10-18",
  },
} satisfies Record<string, SourceReference>;

const question = (
  id: string,
  competency: CompetencyKey,
  prompt: string,
  correctIndex: number,
  choices: [string, string, string, string],
  rationale: string,
): ItSupportBaselineQuestion => ({
  id,
  competency,
  prompt,
  correctChoiceId: `${id}-${String.fromCharCode(97 + correctIndex)}`,
  choices: choices.map((text, index) => ({
    id: `${id}-${String.fromCharCode(97 + index)}`,
    text,
  })),
  rationale,
});

/**
 * The answer key stays in this server-only module. Choice order is shuffled
 * per attempt below, so neither position nor detail signals the answer.
 */
export const itSupportBaseline: ItSupportBaselineQuestion[] = [
  question("it-baseline-01", "production", "A workstation fails shortly before a critical test. What is the strongest first response?", 2, [
    "Begin a full operating-system reinstall so the original workstation is returned to a standard state.",
    "Wait for a senior technician to arrive before communicating a recovery estimate to the affected engineer.",
    "Confirm impact and scope, preserve useful evidence, use an approved known-good recovery path, and state the next checkpoint.",
    "Try a series of unrelated repairs until the workstation returns to service, then document only the successful action.",
  ], "Critical support starts with impact, safe restoration, evidence, and communication—not improvised destructive changes."),
  question("it-baseline-02", "foundations", "A laptop has a valid IP address but cannot reach an internal hostname. What should be investigated first?", 0, [
    "DNS resolution, assigned DNS servers, name-versus-IP behavior, and whether the failure affects one device or a wider scope.",
    "The display adapter and external-monitor cable, because a network name can fail when video drivers are outdated.",
    "The user’s password reset history, because expired credentials are the usual cause of hostname lookup failures.",
    "The printer queue on the nearest multifunction device, because it establishes whether the building network is active.",
  ], "An IP path can function while name resolution fails. Separate the layers before changing configuration."),
  question("it-baseline-03", "security", "A production-adjacent test device needs network access. What should a support technician do before it is connected?", 1, [
    "Connect the device to an available switch port, then identify the correct segmentation if a connectivity problem occurs.",
    "Collect the device need and identity, then coordinate the approved port, VLAN, addressing, and security path with network owners.",
    "Assign a static address from an unused-looking range so the device can be demonstrated before network review begins.",
    "Ask the requesting engineer to use a personal hotspot until the device can bypass the organization’s network restrictions.",
  ], "Endpoint support identifies requirements and coordinates network ownership; it does not create an unapproved network path."),
  question("it-baseline-04", "roleJudgment", "A shared label printer appears online, but jobs remain queued. Which diagnostic order is most defensible?", 3, [
    "Delete all drivers from every affected computer and reinstall them before checking which part of the print path is failing.",
    "Restart the building network because printer problems are usually caused by an issue outside the print environment.",
    "Direct users to another printer without recording scope, device state, or whether the original fault is recurring.",
    "Confirm scope, inspect queue and spool state, verify driver and port/path, perform a controlled test print, then check device state.",
  ], "A print path spans client, queue/spooler, server or port, driver, network, and device. Scope narrows it safely."),
  question("it-baseline-05", "leadership", "Three urgent requests arrive at the same time during active operations. What demonstrates strong service ownership?", 1, [
    "Work only on the loudest request because the person who escalates most urgently is most likely to need immediate help.",
    "Triage impact and urgency, acknowledge each requester, assign or escalate ownership, communicate checkpoints, and reassess as facts change.",
    "Close the two lower-priority requests so the ticket queue reflects only the issue currently being investigated.",
    "Start all three repairs simultaneously, even when the changes may conflict or leave no clear owner for the outcome.",
  ], "Priority reflects operational impact, time sensitivity, dependencies, and clear communication—not personality or ticket order."),
  question("it-baseline-06", "aiCollaboration", "An AI coding or troubleshooting tool proposes a registry edit for an endpoint issue. What is the appropriate response?", 2, [
    "Apply the edit across the affected fleet because the tool recognized an error code and provided a specific command.",
    "Reject all AI assistance categorically, including assistance that could help interpret a fictional log or draft documentation.",
    "Check applicability and policy, validate in an approved safe scope, prepare rollback, verify the result, and document the decision.",
    "Send the command to users so they can test it independently before IT has established impact, permissions, or recovery steps.",
  ], "AI may accelerate analysis, but the technician owns authorization, safe testing, recovery, and the final decision."),
  question("it-baseline-07", "foundations", "A device assigns itself an address in the 169.254.x.x range. What is the most useful interpretation?", 0, [
    "The device likely did not obtain a DHCP lease, so inspect link state, VLAN assignment, DHCP reachability, and the affected scope.",
    "The device successfully resolved its configured DNS server and is ready to reach any internal hostname by name.",
    "The device’s local printer driver is corrupt and should be removed before checking cabling or network assignment.",
    "The device has exceeded local disk capacity, which causes Windows to replace its configured network address automatically.",
  ], "An APIPA address is a clue about address assignment. It does not identify the exact physical or network-layer cause by itself."),
  question("it-baseline-08", "architecture", "When should an endpoint technician escalate a VLAN or switch-port change rather than make an assumption?", 3, [
    "When a user would like a faster connection, even if device identity and the assigned network path have already been approved.",
    "When an endpoint has a printer tray warning, because the network team owns all physical devices located near a switch.",
    "When a laptop needs an application update, because every software deployment must be implemented at the network layer.",
    "When segmentation, device identity, authorized path, or port ownership require verification by the accountable network team.",
  ], "Network segmentation is a security and architecture control. Escalation protects the boundary and produces accountable change records."),
  question("it-baseline-09", "security", "A user needs BitLocker recovery after a hardware change. What is the safest support posture?", 1, [
    "Send the recovery key through any convenient chat channel because restoring the user’s work is more important than key handling.",
    "Verify identity through the approved process, use the authorized recovery workflow, avoid exposing the key, and record the support action.",
    "Disable encryption permanently after the device opens so the user will not have to contact support during a future recovery event.",
    "Ask the user to search shared drives for a key file because recovery information is not treated as sensitive organizational data.",
  ], "Recovery information can unlock protected data. The recovery path must preserve identity, authorization, and auditability."),
  question("it-baseline-10", "roleJudgment", "A dock charges a laptop but external displays remain blank. What is a disciplined first investigation?", 2, [
    "Reimage the laptop immediately because blank monitors prove that the user profile and installed software are no longer trustworthy.",
    "Change the user’s password and MFA factor because display detection depends on an active cloud-identity session.",
    "Check compatibility, dock power, display input and cabling, driver or firmware state, then isolate with known-good hardware.",
    "Reset nearby switches because power delivery from a dock and display detection are always controlled by the local VLAN.",
  ], "Treat the dock, cable, display, driver, firmware, and laptop as separate components; a known-good swap narrows the fault."),
  question("it-baseline-11", "production", "A Windows application crashes repeatedly for one user. What evidence should be gathered before broad repairs?", 0, [
    "Relevant Event Viewer or application logs, error codes, recent changes, reproduction conditions, and whether another user or device is affected.",
    "Only the recycle-bin contents, because failed applications commonly restore their missing dependencies from recently deleted files.",
    "The printer queue and label calibration settings, because application crashes originate from stalled document-processing jobs.",
    "A registry-cleaner report, because a generic cleanup should be attempted before application evidence influences a diagnosis.",
  ], "Good troubleshooting begins with scoped evidence and a reproducible condition, not a broad change that destroys useful context."),
  question("it-baseline-12", "foundations", "Which statement correctly distinguishes authentication from authorization?", 1, [
    "Authentication assigns network segments, while authorization measures whether an endpoint is physically connected to a switch.",
    "Authentication establishes identity; authorization determines which resources or actions that verified identity may access.",
    "Authentication and authorization are interchangeable terms for changing a password after a user is locked out of an account.",
    "Authentication determines a device serial number, while authorization is the process that installs its operating system image.",
  ], "Support work often involves both: prove who or what is requesting access, then apply the approved scope of access."),
  question("it-baseline-13", "security", "A user cannot complete MFA after replacing a phone. What is the safest next step?", 3, [
    "Disable MFA permanently because a user who can state their employee ID should not need another verification step.",
    "Ask the user to borrow a coworker’s registered device so the support team can keep work moving without identity checks.",
    "Send a recovery code over an unverified channel because the user’s previous phone enrollment establishes enough trust.",
    "Verify identity using the approved process, reset or re-register the factor within policy, and confirm access without weakening controls.",
  ], "MFA recovery is an identity process. Urgency changes communication and escalation, not the required proof of identity."),
  question("it-baseline-14", "roleJudgment", "A Teams Room has no audio for one meeting. What is the best troubleshooting path?", 2, [
    "Reinstall every employee’s Teams client because a single-room audio issue proves that the organization-wide application build failed.",
    "Request a VLAN change before inspecting the room because conferencing audio is usually restored by moving the device to another segment.",
    "Confirm scope, power, selected input/output devices, cabling, application settings, controlled test call, and a known-good fallback.",
    "Delete the meeting invitation and create a new one, because meeting metadata is more likely to cause audio loss than room hardware.",
  ], "Room support starts with the affected signal path and a safe test. Maintain a fallback so the meeting can continue if repair takes longer."),
  question("it-baseline-15", "foundations", "A thermal label printer produces blank labels after media is replaced. What should be checked before broad changes?", 1, [
    "The building’s DHCP scope and switch firmware, because label media affects the network connection between the device and print queue.",
    "Media and ribbon compatibility, calibration, print settings, driver and queue state, then one controlled test label.",
    "Every user profile that has printed to the device, because a blank label indicates account corruption rather than device configuration.",
    "The BitLocker recovery process on the print server, because encryption recovery is required whenever a printer changes consumables.",
  ], "Thermal printing has physical-media and configuration dependencies. Test the local path before affecting shared infrastructure."),
  question("it-baseline-16", "production", "What does complete IT asset lifecycle control include?", 3, [
    "Ordering hardware and placing it in storage; repair and retirement can be handled later because serial numbers do not affect support.",
    "Imaging a machine and handing it to a user; asset records are optional when the endpoint is encrypted and signed into a work account.",
    "Collecting serial numbers only during an annual inventory count; deployment history and secure retirement are procurement concerns only.",
    "Receiving, tagging, recording, configuring, deploying, supporting, recovering, auditing, and securely retiring equipment and data.",
  ], "Lifecycle data supports availability, ownership, warranty, recovery, security, and auditability from receipt through retirement."),
  question("it-baseline-17", "communication", "How should a technician explain a complex outage to a non-technical user during a high-pressure period?", 0, [
    "State the user impact, current safe action, expected checkpoint, any workaround, and when the next update will arrive in plain language.",
    "Provide every raw log line so the user can independently infer which infrastructure component is responsible for the service delay.",
    "Avoid sharing any status until the root cause is known, because an early update might need to be revised as evidence changes.",
    "Use technical vocabulary without defining it so the user understands that the support team has already identified a complex problem.",
  ], "Clear updates reduce uncertainty without inventing certainty. They separate known facts, next action, owner, and update time."),
  question("it-baseline-18", "security", "A remote-support session is requested for a sensitive operational workstation. What is the right default?", 2, [
    "Connect with a shared administrator account so that recovery can proceed quickly even when the requested task is narrower than full control.",
    "Ask the user to disable endpoint protection and logging because those controls can make a remote diagnostic session harder to conduct.",
    "Use approved tooling and least privilege, confirm the authorized task and user, preserve auditability, and end access when work is complete.",
    "Allow the support session to stay open after the issue is resolved so the technician can respond immediately if the user has another question.",
  ], "Remote support is an access-control event. Scope, consent or authorization, logging, and timely removal of access all matter."),
  question("it-baseline-19", "roleJudgment", "A known-good replacement endpoint is available, but the original device has not been fully diagnosed. When is a swap appropriate?", 1, [
    "Only after the original device has been disassembled, because restoring user function before a root cause is proven creates unacceptable support debt.",
    "When impact warrants safe restoration, the replacement follows approved configuration and asset process, and diagnosis can continue without losing evidence.",
    "Whenever a user is frustrated, even if the replacement lacks approved security controls, asset assignment, or the applications needed for the work.",
    "Never during critical work, because a hardware swap cannot be documented or validated without a complete root-cause analysis first.",
  ], "Recovery and root-cause analysis are related but distinct. A controlled known-good swap can reduce operational impact while evidence is preserved."),
  question("it-baseline-20", "aiCollaboration", "What does responsible AI assistance look like when reviewing a PowerShell inventory script?", 3, [
    "Run the script against all managed endpoints because generated code is faster to validate at full scale than in a controlled test set.",
    "Trust the generated output when it includes comments, because comments demonstrate that the tool understood the desired collection logic.",
    "Rewrite every line manually before using the script, even when a bounded review could identify inputs, permissions, output, and errors safely.",
    "Review inputs, permissions, scope, output handling, errors, rollback, and test behavior before using it in an approved environment.",
  ], "Automation remains owned by the technician. AI output is a proposal that requires scope control and independent verification."),
  question("it-baseline-21", "architecture", "A wired device works in one port but not another. What evidence belongs in a useful escalation packet?", 2, [
    "Only the user’s opinion of which port should work, because network teams can discover the device and segment details after the ticket is routed.",
    "A request to move the device to a broad access VLAN, because the quickest way to restore connectivity is to remove segmentation constraints.",
    "Device identity, location and port details, link behavior, expected network, observed address/DNS behavior, timestamps, and safe tests performed.",
    "A complete reimage of the endpoint, because operating-system replacement is necessary before network ownership can evaluate a port-level issue.",
  ], "An escalation is productive when it supplies the evidence the accountable team needs without guessing or changing protected network controls."),
  question("it-baseline-22", "leadership", "A demanding engineer disagrees with a support decision during an outage. What is the strongest response?", 0, [
    "Acknowledge impact, explain the safe recovery rationale, offer the current workaround and decision owner, and keep the engineer updated at agreed checkpoints.",
    "Argue that IT owns the endpoint and therefore does not need to explain the decision while the operational user is waiting for service.",
    "Apply the engineer’s requested change immediately, even when it bypasses authorization, could increase impact, or lacks a rollback path.",
    "End the conversation until the full root cause is known, because any interim status may create an expectation that support cannot keep.",
  ], "High service standards combine calm communication with boundaries. Respectful collaboration does not mean accepting unsafe changes."),
  question("it-baseline-23", "production", "After restoring an incident, which action best reduces the chance of a misleading ‘resolved’ outcome?", 1, [
    "Close the ticket immediately after service returns, because a working result proves that the underlying failure cannot recur.",
    "Verify the agreed outcome with the user or system signal, record the evidence and recovery steps, then capture prevention or escalation work.",
    "Keep changing settings until every possible source of failure has been modified, even when service is restored and the original evidence is no longer available.",
    "Remove diagnostic logs to protect storage capacity, because the successful workaround is sufficient documentation for future technicians.",
  ], "Recovery is complete only when outcome is verified, communication is closed, evidence is recorded, and follow-up ownership is clear."),
  question("it-baseline-24", "communication", "Which statement best reflects the role of a mission-critical IT Support Technician?", 2, [
    "A technician’s value comes mainly from memorizing every product command so escalation and documentation are rarely needed.",
    "A technician should prioritize rapid technical changes over customer communication because critical users mainly need a fast fix.",
    "A technician restores people and systems safely by diagnosing methodically, coordinating specialists, communicating clearly, and improving the service path.",
    "A technician should accept every requested configuration if it enables a high-caliber user to continue working without an immediate interruption.",
  ], "The role combines technical troubleshooting, operational judgment, coordination, documentation, and service communication."),
];

export function shuffledItSupportBaseline(seed: string) {
  let state = Array.from(seed).reduce((value, char) => value + char.charCodeAt(0), 31);
  const shuffle = <T,>(items: T[]) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const pick = state % (index + 1);
      [result[index], result[pick]] = [result[pick], result[index]];
    }
    return result;
  };
  return shuffle(itSupportBaseline).map(({ correctChoiceId: _key, rationale: _rationale, ...item }) => ({
    ...item,
    choices: shuffle(item.choices),
  }));
}

export function gradeItSupportBaseline(answers: Record<string, string>) {
  const answered = itSupportBaseline.filter((item) => answers[item.id]);
  const correct = answered.filter((item) => answers[item.id] === item.correctChoiceId);
  const competencyScores = Object.fromEntries(
    Array.from(new Set(itSupportBaseline.map((item) => item.competency))).map((competency) => {
      const items = itSupportBaseline.filter((item) => item.competency === competency);
      return [competency, Math.round((items.filter((item) => answers[item.id] === item.correctChoiceId).length / items.length) * 100)];
    }),
  );
  return {
    complete: answered.length === itSupportBaseline.length,
    score: Math.round((correct.length / itSupportBaseline.length) * 100),
    competencyScores,
    answered: answered.length,
    total: itSupportBaseline.length,
  };
}
