export type ConceptRetrievalCheck = {
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  misconception: string;
};

/**
 * One retrieval check per conceptSeed in lib/aio-foundation.ts, same order.
 * Prompts use distinct stems; distractors are plausible wrong operating judgments.
 */
export const aioConceptRetrievalChecks: ConceptRetrievalCheck[] = [
  {
    prompt:
      "A fictional ingestion worker keeps restarting after a large document batch. What is the most credible first operating judgment?",
    correct:
      "Ask whether the process hit a bounded memory or resource limit versus a code error, and inspect evidence before treating restart as the fix.",
    distractors: [
      "Treat automatic restart as the root-cause fix because the worker eventually comes back and the batch can be retried later.",
      "Rewrite the worker in a different language immediately so memory management can no longer cause restarts in any environment.",
      "Increase every resource limit to the maximum available without inspecting logs, traces, or the size of the failing batch.",
    ],
    misconception: "Restart without evidence is not a root-cause fix.",
  },
  {
    prompt:
      "A fictional service answers correctly by direct address but fails through its normal hostname. What should you investigate first?",
    correct:
      "Treat the failure as a connectivity or DNS name-resolution path until you confirm the caller can resolve and reach the intended service.",
    distractors: [
      "Change application business logic first because a hostname failure usually means the service code is returning the wrong payload.",
      "Replace the model provider immediately because hostname failures are typically caused by degraded generation quality.",
      "Disable authentication temporarily so callers can reach the service without depending on DNS or network ownership.",
    ],
    misconception: "Healthy application code does not prove a caller can resolve or reach the service.",
  },
  {
    prompt:
      "A fictional team can test sanitized data locally but wants an isolated internal model endpoint. What constraint must shape the next step?",
    correct:
      "Model choice and integration must fit the approved environment; move only through the separate approval path for restricted or air-gapped use.",
    distractors: [
      "Copy a hosted API key into the restricted environment because a working key already proved the integration path is safe.",
      "Assume local success means the same prompt and data may run unchanged in every cloud and air-gapped setting.",
      "Skip environment review and ship the prototype because sanitized local fixtures already mirror production data boundaries.",
    ],
    misconception: "A hosted API key is not automatically portable into a restricted environment.",
  },
  {
    prompt:
      "A fictional FastAPI service uses the same container image in test and staging. What does that packaging prove—and not prove?",
    correct:
      "It helps runtime consistency, but you still need owned configuration, secrets handling, logs, network access, and update controls.",
    distractors: [
      "A shared container image proves deployment controls and secrets management are already solved for every environment.",
      "Containers remove the need for observability because failures stay isolated inside the image boundary by design.",
      "Once an image builds, platform owners no longer need to review network access or configuration differences between stages.",
    ],
    misconception: "A container image is not proof that deployment and secrets controls are solved.",
  },
  {
    prompt:
      "A fictional retrieval request fans out to search and policy checks. What operating concern does asynchronous work introduce?",
    correct:
      "Each slow call needs a timeout, cancellation or fallback path, and a clear way to surface background or partial failures.",
    distractors: [
      "Assume async code removes failures and makes every operation faster without needing timeouts or fallbacks.",
      "Drop policy checks when search is slow so the user always receives a complete answer without waiting.",
      "Let background tasks fail silently because the primary request already returned a success status to the client.",
    ],
    misconception: "Async does not remove failures or make every operation faster.",
  },
  {
    prompt:
      "A fictional evaluation job needs background processing and someone also wants to cache procedure text. What is the safer queue-and-cache judgment?",
    correct:
      "Enqueue the job with an id and retry budget; cache only non-sensitive short-lived metadata with a TTL—never protected procedure bodies—and define delay, duplicate, and unavailable behavior first.",
    distractors: [
      "Add a queue and a long-lived cache of full procedure text first so scale and latency improve before ownership and invalidation are defined.",
      "Skip defining duplicate delivery handling because a queue automatically deduplicates every job by design.",
      "Treat CI/CD as a substitute for queue failure modes because automated delivery already covers delayed and stale work.",
    ],
    misconception: "Queues and caches need failure-mode owners before they become default infrastructure.",
  },
  {
    prompt:
      "A fictional triage API must return a structured recommendation or a clear abstention. What makes that an accountable API contract?",
    correct:
      "Documented allowed inputs, outputs, errors, and versioned expectations—not unvalidated prose or undocumented fields.",
    distractors: [
      "Let consumers parse free-form assistant text and invent fields whenever the model wording changes between releases.",
      "Treat any HTTP 200 as a contract because status codes already communicate every error and version boundary.",
      "Skip versioning because internal callers can update themselves whenever the prompt shape drifts.",
    ],
    misconception: "Unvalidated prose and undocumented fields are not an API contract.",
  },
  {
    prompt:
      "A fictional model output must include an action type, confidence state, and cited source IDs before human review. What is the right boundary check?",
    correct:
      "Validate the schema and reject malformed, missing, or unsafe values at the boundary before anything is passed downstream.",
    distractors: [
      "Pass model-generated JSON downstream whenever it parses, even if required fields or value constraints are missing.",
      "Ask the reviewer to fix schema mistakes by hand because validation slows a useful human-in-the-loop workflow.",
      "Accept partial objects when confidence is high because the model usually intends the missing fields correctly.",
    ],
    misconception: "Parseable JSON is not validated, complete, or safe structured data.",
  },
  {
    prompt:
      "A fictional approval record must link requester, action, reviewer, timestamp, and outcome. When should you prefer relational data over an LLM answer?",
    correct:
      "When the question needs exact, authoritative connected facts that belong in a database relationship rather than inferred prose.",
    distractors: [
      "Ask the LLM to invent the approval outcome whenever the database query would take longer than a generation call.",
      "Store only free-text chat transcripts and reconstruct relationships later by prompting a model about who approved what.",
      "Skip the reviewer link because a confident model summary is enough evidence for an audit-oriented approval story.",
    ],
    misconception: "LLMs are not a substitute for exact authoritative database state.",
  },
  {
    prompt:
      "A fictional engineer authenticates to a service that must retrieve only their permitted procedure collection. Where is authorization enforced?",
    correct:
      "In trusted systems after identity is established—not by asking a model or frontend to hide restricted passages after broad retrieval.",
    distractors: [
      "Retrieve all content and instruct the model or UI to hide restricted passages so the demo feels permission-aware.",
      "Treat a successful login as authorization for every collection because authentication already proved the caller is trusted.",
      "Put permission rules only in the prompt so the assistant can decide which passages a role should see.",
    ],
    misconception: "UI and prompts do not enforce authorization after over-broad retrieval.",
  },
  {
    prompt:
      "A fictional read-only assistant must not gain write credentials mid-conversation. Which operating choice matches secrets and least privilege?",
    correct:
      "Give the assistant only the access required for the defined task, keep credentials out of browser code, prompts, and repos, and block self-expansion of tool permissions.",
    distractors: [
      "Embed a broad API key in the frontend so the assistant can choose new tools without waiting for a security review.",
      "Paste production credentials into the system prompt so the model can call any internal API it mentions.",
      "Share one privileged service account across prototypes because least privilege slows early learning experiments.",
    ],
    misconception: "Credentials in prompts, browsers, or broad shared config break least privilege.",
  },
  {
    prompt:
      "A fictional model change raises unsupported-answer rate during a pilot. What does observability paired with rollback require?",
    correct:
      "Use logs, metrics, or traces to detect the spike, pause rollout, return to a known-good version, and add the failing cases to evaluation.",
    distractors: [
      "Declare the pilot successful because demos still look polished and no formal ticket has been filed yet.",
      "Keep the new version live without a reverse path because unsupported answers are expected until users learn better prompts.",
      "Delete the failure evidence so dashboards stay clean while the team investigates offline without an audit trail.",
    ],
    misconception: "A pilot without detection signals and a rollback path is not operationally ready.",
  },
  {
    prompt:
      "A fictional assistant is about to receive an entire procedure library in one prompt. What is the right tokens-and-context judgment?",
    correct:
      "Send only the authorized, current passages needed for the question; more context raises cost, latency, distraction, and risk without guaranteeing quality.",
    distractors: [
      "Add every available document because a larger context window always makes answers safer and more complete.",
      "Ignore authorization filters when stuffing context so the model can choose the most relevant passages itself.",
      "Treat context size as a quality score and expand the window whenever evaluation shows any uncertain answer.",
    ],
    misconception: "More context is not a quality or safety guarantee.",
  },
  {
    prompt:
      "A fictional query finds semantically similar procedure chunks. What must still happen before those chunks are trusted for an answer?",
    correct:
      "Apply metadata and permission filters first; vector similarity finds candidates but is not access control or a truth guarantee.",
    distractors: [
      "Use embedding similarity alone as authorization because nearby vectors imply the requester may see the content.",
      "Skip freshness checks when similarity is high because semantic match proves the source is current and correctly applied.",
      "Return the top vector hit without citations so users can move faster than a multi-stage retrieval pipeline allows.",
    ],
    misconception: "Embedding similarity is not authorization or source freshness.",
  },
  {
    prompt:
      "A fictional assistant surfaces two current cited procedures that conflict. What is the credible retrieval response?",
    correct:
      "Escalate the conflict rather than silently choosing one; treat citations as evidence to evaluate, not automatic proof of a correct answer.",
    distractors: [
      "Pick the citation with higher model confidence and present it as settled current guidance without human review.",
      "Merge both procedures into one answer so the user does not see that authorized sources disagree.",
      "Hide the citations when sources conflict because showing disagreement would reduce trust in the assistant.",
    ],
    misconception: "A citation is not proof that an answer is supported, current, or correctly applied.",
  },
  {
    prompt:
      "A fictional triage result must include category, cited evidence IDs, uncertainty, and a no-action default when validation fails. Why require structured outputs this way?",
    correct:
      "Schema-shaped output lets the application validate and handle failure; prose with brittle string parsing is not a reliable workflow boundary.",
    distractors: [
      "Parse free-form prose with string heuristics whenever the model usually follows the requested format in demos.",
      "Skip validation on structured fields because requesting JSON already guarantees the model will honor the schema.",
      "Allow empty evidence IDs when the category looks plausible so the workflow can continue without abstention.",
    ],
    misconception: "Requested format is not validated structured output until the application checks it.",
  },
  {
    prompt:
      "A fictional assistant can call retrieve_procedures and format_draft, and a human must approve writes. How should tools versus agents be scoped?",
    correct:
      "Prefer a deterministic workflow with a small allowlisted tool set; reserve open agent loops for genuine uncertainty, and never let the model grant itself new write tools mid-session.",
    distractors: [
      "Run an open agent loop for every request because autonomy is always safer than a predictable form or search path.",
      "Let the model select new MCP tools mid-conversation whenever a recommendation seems incomplete.",
      "Skip human approval for writes when the agent cites documents, because citations already prove the action is authorized.",
    ],
    misconception: "An agent loop is not safer than a known deterministic workflow by default.",
  },
  {
    prompt:
      "A fictional service needs model access for a prototype. Which hosting pattern is the accountable default?",
    correct:
      "Call an approved internal gateway that centralizes policy, logging, quotas, and fallback—not unmanaged public endpoints with browser-held keys.",
    distractors: [
      "Let each prototype call arbitrary public model endpoints with its own unmanaged key for maximum experimentation speed.",
      "Expose a provider credential in the browser so the UI can switch models without a platform owner.",
      "Bypass gateway logging during early pilots because audit noise matters more than quota and policy visibility.",
    ],
    misconception: "Unmanaged per-prototype keys bypass policy, logging, and fallback ownership.",
  },
  {
    prompt:
      "A fictional pilot wants to ingest procedures into an air-gapped model. What does data classification require first?",
    correct:
      "Identify what data may enter the approved environment; use synthetic or narrowly approved sources until the data owner and reviewers clear the boundary.",
    distractors: [
      "Assume an air-gapped model makes every internal source automatically permitted for ingestion without further review.",
      "Ingest the full production corpus first and classify afterward if someone raises a privacy concern.",
      "Treat export-control and retention rules as optional when the technical retrieval quality looks strong in demos.",
    ],
    misconception: "Air-gapped hosting does not auto-permit every source for ingestion.",
  },
  {
    prompt:
      "A fictional retrieved document tells the system to export records. How should prompt-injection risk be handled?",
    correct:
      "Treat untrusted content as data only; isolate tool permissions, validate actions, and require human approval—do not rely on a stronger system prompt alone.",
    distractors: [
      "Rely on a stronger system prompt as the only protection because clear instructions usually override retrieved text.",
      "Obey export instructions found in documents when they appear authoritative and well formatted.",
      "Grant the retrieval pipeline write tools so the assistant can fulfill document-stated workflows without friction.",
    ],
    misconception: "Prompt injection is an application-security boundary, not a wording contest.",
  },
  {
    prompt:
      "A fictional assistant drafts a ticket update that a qualified human must approve before apply. What makes the approval and audit boundary credible?",
    correct:
      "Clear approval points plus audit events for who requested, reviewed, approved, executed, and what happened—including denied or failed attempts.",
    distractors: [
      "Record only successful actions so dashboards stay clean and interrupted attempts do not clutter the audit trail.",
      "Let the assistant apply the draft immediately when confidence is high and write the audit entry afterward if time allows.",
      "Skip reviewer identity in the log because the service account name is enough to reconstruct accountability later.",
    ],
    misconception: "Missing denied or failed attempts weakens the audit boundary.",
  },
  {
    prompt:
      "A fictional retrieval assistant is ready for a controlled pilot. What counts as an evaluation and release gate?",
    correct:
      "Representative cases, explicit metrics, human review, and regression checks—including supported, denied, stale, conflicting, injected, and unsupported questions.",
    distractors: [
      "Use polished demo examples and the model’s self-confidence score as the sole release criterion.",
      "Skip denied and injected cases because they are rare and would slow the pilot calendar.",
      "Treat a successful executive walkthrough as evaluation because stakeholder enthusiasm predicts production safety.",
    ],
    misconception: "A demo and model confidence are not a release evaluation.",
  },
  {
    prompt:
      "A fictional model gateway goes unavailable during a user session. What is the safe fallback behavior?",
    correct:
      "Return an explicit unavailable state, preserve safe state, use an approved fallback such as ordinary search, and avoid inventing or presenting stale content as current.",
    distractors: [
      "Retry a consequential write blindly until the gateway returns so the user never sees an interruption.",
      "Serve unsupported cached answers labeled as live results so the interface continues to feel responsive.",
      "Ask the model in another region to invent a plausible procedure summary without saying the primary path failed.",
    ],
    misconception: "Blind retries and stale content disguised as current answers are unsafe fallbacks.",
  },
  {
    prompt:
      "A fictional pilot needs a model for classification with human review on edge cases. How should model and provider risk be judged?",
    correct:
      "Weigh quality, latency, cost, reliability, data boundary, deployment approval, and task-specific evaluation—not popularity or a chat benchmark alone.",
    distractors: [
      "Select the model from a public leaderboard or chat experience without evaluating the actual task and boundary.",
      "Ignore deployment approval if latency looks good because speed outweighs data-boundary constraints in pilots.",
      "Drop human review once a popular provider is chosen because brand reputation substitutes for edge-case evaluation.",
    ],
    misconception: "Benchmarks and chat feel are not task-and-boundary evaluation.",
  },
  {
    prompt:
      "A fictional manager asks for an agent, but interviews show deterministic search and a checklist would remove most delay. What should discovery conclude?",
    correct:
      "Capture the real workflow, owners, and success measures first; do not select a model or agent architecture before the operational outcome is clear.",
    distractors: [
      "Select the agent stack immediately because the manager’s request is already a usable requirement.",
      "Skip exception and owner mapping when the requested tool is fashionable and demos well.",
      "Treat a vague ask for AI as sufficient discovery and move straight to provider procurement.",
    ],
    misconception: "A request for AI is not yet a discovered operational requirement.",
  },
  {
    prompt:
      "A fictional incident workflow map shows summarization helps but ticket closure must stay human-approved. What did the map correctly reveal?",
    correct:
      "Where AI can assist, where ordinary automation is better, and where humans must retain authority—including upstream decisions and exceptions.",
    distractors: [
      "Automate the most visible step only and ignore the upstream approval that actually controls the work.",
      "Close tickets automatically whenever a summary looks complete so the map’s human gate can be removed for speed.",
      "Stop mapping exceptions because happy-path boxes are enough to justify an agent for the whole workflow.",
    ],
    misconception: "Automating a visible step while ignoring controlling approvals is incomplete workflow design.",
  },
  {
    prompt:
      "A fictional engineer says the team needs a specific model brand. What should a stakeholder interview do next?",
    correct:
      "Ask about outcome, source freshness, authorization, review, integration, and success criteria instead of treating the preferred tool as the requirement.",
    distractors: [
      "Treat the named tool as the requirement and start integration planning without clarifying the needed outcome.",
      "Argue about brand preference before gathering pain, workarounds, data sources, and error tolerance.",
      "Promise the requested tool immediately so the interview feels supportive and avoids hard constraint questions.",
    ],
    misconception: "A preferred tool is not the same as a stated operating outcome.",
  },
  {
    prompt:
      "A fictional team chooses a read-only retrieval pilot instead of a write-enabled agent. What belongs in the technical decision record?",
    correct:
      "Context, options, choice, tradeoffs, owner, evidence, and revisit conditions—not only a tool list or unlabeled diagram.",
    distractors: [
      "Write a tool list and architecture diagram without the decision, alternatives, owner, or supporting evidence.",
      "Omit revisit criteria so the read-only boundary cannot be challenged even when evaluation evidence changes.",
      "Keep the record informal in chat only because decision records slow cross-functional delivery.",
    ],
    misconception: "Diagrams without decision, owner, and evidence are not reviewable architecture decisions.",
  },
  {
    prompt:
      "A fictional cited-assistant trial for one team needs a go/no-go after evidence. What makes it a real pilot with success metrics?",
    correct:
      "Known users, controlled boundary, baseline, duration, success measures, failure thresholds, stop condition, and named owners before expansion.",
    distractors: [
      "Call any prototype a pilot even without users, duration, baseline, metrics, stop condition, or owner.",
      "Expand to the whole organization first and define metrics afterward if complaints appear.",
      "Use enthusiasm and demo polish as the only stop condition because numeric thresholds feel premature.",
    ],
    misconception: "A prototype without users, metrics, and stop conditions is not a pilot.",
  },
  {
    prompt:
      "A fictional data-boundary question exceeds your authority. What is the right escalation and ownership move?",
    correct:
      "Document a clear question, impact, evidence, and proposed next step; send it to the named reviewer; and track a next update time without silently bypassing the boundary.",
    distractors: [
      "Act beyond authority to keep the prototype moving, then notify the owner after the boundary has already been crossed.",
      "Escalate with only a vague concern and no impact statement, evidence, or proposed next step.",
      "Bypass the reviewer quietly because waiting for approval would block an otherwise promising demo.",
    ],
    misconception: "Escalation needs a clear question and evidence; bypass is not ownership.",
  },
  {
    prompt:
      "A fictional design gives one agent broad access across search and action eligibility for demo convenience. What is wrong with that service-boundary choice?",
    correct:
      "Keep ownership clear: retrieval can own authorization-aware search and a separate policy path can own action eligibility—neither should dump that into one convenient agent.",
    distractors: [
      "Give one agent broad access because demo convenience outweighs accidental coupling and unclear failure ownership.",
      "Let the model decide both search scope and action eligibility so fewer services need reviewable boundaries.",
      "Collapse policy into the prompt so architects can avoid naming which component owns each failure mode.",
    ],
    misconception: "Broad demo access is not a clear service boundary.",
  },
  {
    prompt:
      "A fictional approval action may time out and the client will retry. What must retries and idempotency guarantee?",
    correct:
      "Use a unique request key or equivalent so repeating the request cannot create duplicate consequential ticket changes.",
    distractors: [
      "Add automatic retry on the write path without detecting or preventing duplicate execution.",
      "Assume every timeout means the first attempt left all systems unchanged so a blind retry is always safe.",
      "Retry forever without backoff because eventual success matters more than duplicate side effects.",
    ],
    misconception: "Retries without idempotency can duplicate consequential writes.",
  },
  {
    prompt:
      "A fictional gateway must protect expensive evaluation calls during a small pilot. What is the right rate-limit posture?",
    correct:
      "Bound caller consumption with clear responses and retry windows; few initial users do not justify unlimited retries or high-volume tool calls.",
    distractors: [
      "Allow unlimited retries and high-volume tool calls because a pilot has few users and cost risk feels theoretical.",
      "Silently drop excess requests without a retry window so clients cannot distinguish policy from random failure.",
      "Remove rate limits when individual answers look correct because quality proves overload cannot occur.",
    ],
    misconception: "Small pilots still need rate limits; correct answers do not prevent overload or cost failure.",
  },
  {
    prompt:
      "A fictional FastAPI image passes staging tests and needs promotion. What does deployment with Docker still require?",
    correct:
      "Approved environment-specific configuration, secrets handling, monitoring, and a documented rollback target—running in a container is not proof it is safe to deploy.",
    distractors: [
      "Treat ‘it runs in a container’ as sufficient proof that environment review, secrets, and rollback are unnecessary.",
      "Bake production secrets into the image so every environment receives identical credentials without platform review.",
      "Skip staging configuration differences because Docker already guarantees parity with production behavior.",
    ],
    misconception: "Container packaging does not replace deployment review, secrets, monitoring, or rollback.",
  },
  {
    prompt:
      "A fictional retrieval call times out after a policy check already succeeded. What distributed-systems judgment keeps the response safe?",
    correct:
      "Treat partial failure as normal: return a safe unavailable response, preserve the audit record, and do not assume remote calls leave every system unchanged.",
    distractors: [
      "Assume the remote call either succeeded completely or failed with no side effects anywhere in the path.",
      "Invent an answer for the user because the policy check already passed and retrieval was only a convenience.",
      "Retry the write side of the workflow automatically without checking whether the first attempt partially applied.",
    ],
    misconception: "Networked calls can partially fail; happy-path diagrams hide that risk.",
  },
  {
    prompt:
      "A fictional FastAPI pilot already meets latency and authz needs, but someone proposes Kubernetes and a Rust rewrite to sound advanced. What is the recognition-level response?",
    correct:
      "Ask for measured throughput, ops ownership, and a failure mode the current stack cannot handle before adding platform or language complexity—partner with specialists when those thresholds are real.",
    distractors: [
      "Add Kubernetes and Rust immediately so the design sounds advanced even before workflow and evidence justify them.",
      "Claim personal production competence with both technologies because recognizing the vocabulary equals implementation readiness.",
      "Reject any specialist involvement because a concept card is enough authority to operate cluster and systems-language choices alone.",
    ],
    misconception: "Vocabulary recognition is not a reason to add platform or language complexity by default.",
  },
];
