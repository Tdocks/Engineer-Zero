import { buildCodingLesson, type CodingLessonPackage } from "../coding-lesson-package";

export const codingLessonsDay1: CodingLessonPackage[] = [
  buildCodingLesson({
    day: 1,
    order: 1,
    competency: "terminal",
    title: "Inside the machine",
    mode: "observe",
    sourceIds: ["bashManual", "pythonTutorial"],
    objective: "Trace one command from keyboard input to visible program output, and name each layer that participates.",
    whyItMatters:
      "When something fails later—wrong folder, missing file, Python traceback—you need a mental map of which layer broke. Guessing “the computer is broken” wastes time; naming the terminal, shell, OS, and interpreter turns a mystery into a checklist.",
    teach: `A terminal is a text window that accepts typed commands. It is not Python and it is not your operating system. It is the surface where you type.

Behind the terminal sits a shell (often bash or zsh). The shell reads the line you typed, expands paths and quotes, then asks the operating system to start a program. When you type \`python main.py\`, the shell does not “run Python logic” itself. It finds the \`python\` program and asks the OS to launch it with \`main.py\` as an argument.

The operating system loads the Python interpreter process, gives it a working directory, environment variables, and access to files. The interpreter then reads \`main.py\`, parses it, and either prints output or raises an error.

Misconception to kill early: “the terminal ran my code.” The terminal displayed your keystrokes and then the program’s stdout/stderr. The shell started a process. Python executed the file. If you confuse those layers, you will chase the wrong fix—editing code when the path is wrong, or blaming Python when the shell never found the file.

Another misconception: “Python is installed in the terminal.” Python is a program on disk. The shell finds it through PATH. If \`python\` is not on PATH, the shell fails before Python starts. That is a shell/OS problem, not a syntax problem.

For this program, treat every successful run as a path you can narrate: keyboard → terminal → shell → operating system → Python interpreter → your file → output (or traceback).`,
    workedExample: `$ pwd
/home/learner

$ which python
/usr/bin/python

$ python main.py
# If main.py prints a greeting, stdout appears in the terminal.
# If main.py is missing, Python never runs your logic—you get a file error from the interpreter.

Trace the same run as layers:
1. You typed: python main.py
2. Terminal showed the characters
3. Shell resolved "python" via PATH and passed "main.py"
4. OS started the interpreter process in /home/learner
5. Interpreter opened main.py
6. Output returned to the terminal as text

If step 3 fails ("command not found"), stop—do not rewrite main.py yet.
If step 5 fails ("No such file"), fix the path or working directory before changing code.`,
    tryThis: "Map layers to symptoms before you touch Code Lab. Keep the artifact short and reusable.",
    tryThisSteps: [
      "Write the six layers in order without looking at notes.",
      "For each symptom, assign one failing layer: (a) command not found, (b) No such file for main.py, (c) SyntaxError on line 1, (d) wrong printed number.",
      "Write a 4-line notes block: built / assumption / failure mode / how you would verify.",
    ],
    expectedOutput: `Layers: keyboard → terminal → shell → OS → Python → file → output

(a) shell/PATH
(b) working directory / file path (interpreter or shell)
(c) Python parse (interpreter started)
(d) logic in your file (Python ran successfully)`,
    hint: "If Python never starts, you cannot get a SyntaxError. Shell errors and interpreter errors are different layers.",
    commonFailures: [
      {
        failure: "Treating every failure as a Python bug.",
        recovery: "Ask which layer failed first. Shell errors happen before Python starts. Tracebacks mean Python started and then rejected the code or runtime state.",
      },
      {
        failure: "Confusing the terminal window with the shell language.",
        recovery: "The window is the terminal. The program interpreting commands is the shell. You can often open a different shell in the same terminal app.",
      },
      {
        failure: "Editing code when the working directory is wrong.",
        recovery: "Run pwd and ls before changing logic. Confirm the file you think you are editing is the file Python is reading.",
      },
    ],
    checkYourself: [
      {
        question: "What starts the Python process: the terminal, the shell, or the interpreter?",
        answer: "The shell asks the OS to start the interpreter. The terminal only provides the text interface; the interpreter executes the file after it is started.",
      },
      {
        question: "You see 'command not found: python'. Which layer failed?",
        answer: "The shell/OS PATH lookup failed before Python ran. Fix the environment or command name; do not start by rewriting main.py.",
      },
      {
        question: "Why is a traceback evidence that Python started?",
        answer: "A traceback is produced by the interpreter while executing or parsing code. If the shell never found Python, you would get a shell error instead.",
      },
    ],
    defensePrompt:
      "In under a minute, explain the difference between the terminal, the shell, and the Python interpreter using one concrete command you ran today.",
  }),

  buildCodingLesson({
    day: 1,
    order: 2,
    competency: "terminal",
    title: "Safe terminal navigation",
    mode: "modify",
    sourceIds: ["pythonTutorial"],
    objective: "Create a project folder, enter it, create main.py, and recover after one deliberate wrong-folder mistake using pwd and cd.",
    whyItMatters:
      "Most early engineering failures are location failures: you edited the wrong file, deleted the wrong path, or ran Python in the wrong directory. Safe navigation is not trivia—it is how you keep a small prototype trustworthy.",
    teach: `Paths are addresses. A relative path is interpreted from your current working directory. An absolute path starts from a known root (on this fictional learner machine, often \`/home/learner/...\`). Before you create or remove anything consequential, you should be able to answer: Where am I, and what is about to change?

Core commands for Day 1:
- \`pwd\` — print working directory (your current location)
- \`ls\` — list entries in the current directory
- \`cd <path>\` — change directory
- \`mkdir <name>\` — create a directory
- \`touch <file>\` — create an empty file (or update its timestamp)

The safe habit is verify → act → verify. Example: \`pwd\`, then \`mkdir ai_prototype\`, then \`ls\` to confirm the folder exists, then \`cd ai_prototype\`, then \`pwd\` again, then \`touch main.py\`, then \`ls\`.

Misconception: “mkdir creates a project.” It creates a folder. A project becomes real when the right files live in the right place and you can prove it with \`pwd\`/\`ls\`.

Misconception: “cd failed so the folder is gone.” \`cd\` failing usually means the path was wrong from your current location. Use \`pwd\` and \`ls\` before inventing new folders.

Recovery pattern you must practice: create a file in the wrong place on purpose, notice with \`pwd\`/\`ls\`, move or recreate it in the correct folder, and prove the final layout. Do not skip the proof step.`,
    workedExample: `$ pwd
/home/learner

$ mkdir ai_prototype
$ ls
ai_prototype

$ cd ai_prototype
$ pwd
/home/learner/ai_prototype

$ touch main.py
$ ls
main.py

# Deliberate mistake: create a file one level up by accident
$ cd ..
$ touch main.py
$ pwd
/home/learner
$ ls
ai_prototype  main.py

# Recovery: confirm the wrong location, then fix
$ ls ai_prototype
# (empty or missing main.py)
$ mv main.py ai_prototype/
$ cd ai_prototype
$ pwd
/home/learner/ai_prototype
$ ls
main.py

If you cannot narrate where the wrong file was and how you verified the fix, you are not done.`,
    tryThis: "Build the folder, make one wrong-folder mistake on purpose, then recover with proof.",
    tryThisSteps: [
      "From /home/learner (or the simulator home), create ai_prototype, enter it, and create main.py.",
      "Intentionally create a second main.py in the parent folder.",
      "Recover so only ai_prototype/main.py remains; record the pwd after recovery.",
      "Write a 4-line notes block: built / assumption / failure mode / verify.",
    ],
    tryThisStarter: "pwd\nls\n# create folder, enter it, create main.py\n# make one wrong-folder mistake\n# recover and prove with pwd + ls",
    expectedOutput: `$ pwd
/home/learner/ai_prototype
$ ls
main.py
# parent folder listing should NOT still show a stray main.py`,
    hint: "If you nested ai_prototype/ai_prototype, run pwd before the next mkdir. Recovery is usually mv + ls, not delete-everything.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-terminal-escape",
      label: "Open Terminal escape room",
      why: "Prove the same navigation and recovery skills in the guided simulator before you write triage logic.",
    },
    commonFailures: [
      {
        failure: "Creating ai_prototype/ai_prototype by running mkdir after already cd'ing into the folder.",
        recovery: "Run pwd before mkdir. If you are already inside ai_prototype, create files there—do not mkdir the same name again unless you intend nesting.",
      },
      {
        failure: "Using rm aggressively to 'clean up' without listing first.",
        recovery: "List with ls, confirm the path with pwd, then move or remove only the mistaken file. Prefer mv into the correct folder over delete-and-hope.",
      },
      {
        failure: "Assuming touch worked without checking ls.",
        recovery: "Every create/move ends with ls (and pwd when location matters). No proof, no completion.",
      },
    ],
    checkYourself: [
      {
        question: "What does pwd tell you that ls does not?",
        answer: "pwd prints the absolute current directory path. ls lists entries in a directory but does not by itself state where you are.",
      },
      {
        question: "You meant to create main.py inside ai_prototype but pwd shows /home/learner. What is the smallest safe recovery?",
        answer: "Confirm with ls, then move or recreate main.py into ai_prototype, cd into ai_prototype, and verify with pwd and ls.",
      },
    ],
    defensePrompt:
      "Explain how you knew you were in the wrong folder and name the command that verified recovery. Include the expected final path to main.py.",
  }),

  buildCodingLesson({
    day: 1,
    order: 3,
    competency: "python",
    title: "Values, variables, and first execution",
    mode: "modify",
    sourceIds: ["pythonTutorial"],
    objective: "Print visible output, use a comment, bind named variables, and change one calculation without breaking the print path.",
    whyItMatters:
      "Prototypes fail when numbers are anonymous and units are implied. Printing makes results checkable. Comments explain intent. Variables make meaning stable. Together they turn a guess into something you can defend.",
    teach: `Start with visibility. \`print(...)\` writes a representation of a value to standard output. It does not make a value “true”; it makes it inspectable. If you cannot see intermediate results while learning, you will invent stories about what the program did.

Next, comments. A line starting with \`#\` is ignored by Python. Use comments to label stages (“before hold”, “after hold”)—not to narrate every keyword. Comments are for the next human, including future you.

Then values and variables. A value is data with a type: an integer like \`90\`, a float like \`90.5\`, a string like \`"pump-7"\`. A variable binds a useful name to a value so the calculation can be explained without re-deriving what \`120\` meant.

Execution order is top to bottom. A NameError usually means you used a name before assigning it. Reassignment changes what the name refers to—trace assignments in order.

Misconception: “if it prints, the formula is correct.” Printing only proves something ran. You still check arithmetic against a known example.

For Day 1 mission work, prefer names like \`launch_time\`, \`current_time\`, and \`hold_duration\` over \`x\`, \`n\`, and \`temp2\`.`,
    workedExample: `# main.py — print first, then name the numbers
print("mission countdown check")

# Comments label stages; they do not run.
# launch window and hold are fictional training numbers.
launch_time = 120
current_time = 75
hold_duration = 10

remaining_minutes = launch_time - current_time
print("remaining before hold:", remaining_minutes)

remaining_with_hold = remaining_minutes - hold_duration
print("remaining after hold:", remaining_with_hold)

$ python main.py
mission countdown check
remaining before hold: 45
remaining after hold: 35

Micro-progression in this file:
1. print made the program visible
2. # comments explained the fictional hold
3. variables named the inputs
4. two prints showed both stages of the math

If you only print the final number, a reviewer cannot see whether the hold was applied.`,
    tryThis: "Build the countdown in micro-steps: print, comment, variables, then both stage results.",
    tryThisSteps: [
      "Create main.py and print one short status line so you know the file runs.",
      "Add a # comment that states what hold_duration means in the fictional scenario.",
      "Bind launch_time = 120, current_time = 75, and hold_duration = 10.",
      "Print remaining minutes before and after subtracting hold_duration.",
      "Hand-check 120 − 75 and 45 − 10; fix names or math if the prints disagree.",
    ],
    tryThisStarter:
      '# status line\nprint("mission countdown check")\n\n# TODO: comment what hold means\nlaunch_time = 120\ncurrent_time = 75\n# hold_duration = ?\n# print remaining before and after hold\n',
    expectedOutput: `mission countdown check
remaining before hold: 45
remaining after hold: 35`,
    hint: "Compute remaining_minutes first, print it, then subtract hold_duration into a second variable and print again. Do not overwrite the first result if you still need it on screen.",
    commonFailures: [
      {
        failure: "Using unclear names (a, b, c) that hide units and meaning.",
        recovery: "Rename to domain words: launch_time, current_time, hold_duration. Re-run and confirm prints still match the hand calculation.",
      },
      {
        failure: "Changing the formula but not printing the new intermediate value.",
        recovery: "Print before and after the change. Visibility is part of the practice, not optional decoration.",
      },
      {
        failure: "Skipping comments and then forgetting what hold_duration represented.",
        recovery: "Add one purposeful # line. Comments are cheap insurance for handoff and defense.",
      },
    ],
    checkYourself: [
      {
        question: "What does a variable add that a raw number does not?",
        answer: "A stable, readable name for a meaning (and often an implied unit), so the calculation can be explained and reused without re-deriving what 120 meant.",
      },
      {
        question: "Your program prints 35 but you expected 45. What do you check first?",
        answer: "Whether hold_duration was applied, whether the inputs are the values you think, and whether you are reading the correct print line—not whether Python 'is broken'.",
      },
      {
        question: "Does a comment change what print outputs?",
        answer: "No. Comments are ignored by the interpreter. They document intent for humans.",
      },
    ],
    defensePrompt:
      "What does the variable name add that a raw number does not? Use your countdown example, and mention why you printed both stages.",
  }),

  buildCodingLesson({
    day: 1,
    order: 4,
    competency: "python",
    title: "Decisions and functions",
    mode: "build",
    sourceIds: ["pythonTutorial"],
    objective: "Put deterministic triage logic in a small function that returns NORMAL, REVIEW, or URGENT from a temperature reading.",
    whyItMatters:
      "Duplicated if-statements drift. A named function is a contract: given this input, return that label. That contract is what you will later test, call from a CLI, and keep away from probabilistic AI output.",
    teach: `You already used print and variables. Now package a decision.

A function packages a behavior behind a name, parameters, and a return value. For triage, the function should be boring and deterministic: same temperature in, same label out.

Start with explicit thresholds. Example policy for this fictional exercise:
- temperature >= 90 → \`"URGENT"\`
- temperature >= 80 → \`"REVIEW"\`
- otherwise → \`"NORMAL"\`

Use \`if\` / \`elif\` / \`else\` (or early returns) so every path returns a string label. Do not print inside the core function if you can help it—return the value and let the caller print. That separation makes testing easier.

Misconception: “a function is only for long code.” Functions are for clear boundaries. Even five lines deserve a name if the rule will be reused or tested.

Misconception: “float temperatures are fuzzy so the rule is fuzzy.” The sensor value may be noisy in the real world, but your prototype rule is still deterministic once a number is in hand.

You will prove this in Code Lab by implementing \`evaluate_reading\` with visible branches and no model calls.`,
    workedExample: `def evaluate_reading(temperature: float) -> str:
    if temperature >= 90:
        return "URGENT"
    if temperature >= 80:
        return "REVIEW"
    return "NORMAL"

# Manual checks (not yet formal tests) — print the returned labels
print(evaluate_reading(94))  # URGENT
print(evaluate_reading(90))  # URGENT  ← boundary
print(evaluate_reading(80))  # REVIEW  ← boundary
print(evaluate_reading(79.9))  # NORMAL

$ python main.py
URGENT
URGENT
REVIEW
NORMAL

Why boundaries matter:
- 90 must not quietly become REVIEW
- 80 must not quietly become NORMAL
If you only try 94 and 70, you have not checked the policy you claimed.`,
    tryThis: "Implement evaluate_reading, check boundaries, then open the triage CLI lab.",
    tryThisSteps: [
      "Implement evaluate_reading with NORMAL / REVIEW / URGENT using >= 90 and >= 80.",
      "Print results for 79.9, 80, 89.9, 90, and 94.",
      "Write the five input→output pairs in your notes.",
      "Open the Equipment status triage CLI lab to turn the same function into a reviewed artifact.",
    ],
    tryThisStarter:
      "def evaluate_reading(temperature: float) -> str:\n    # return NORMAL, REVIEW, or URGENT\n    pass\n\n# print(evaluate_reading(94))\n",
    expectedOutput: `79.9 → NORMAL
80 → REVIEW
89.9 → REVIEW
90 → URGENT
94 → URGENT`,
    hint: "Check the high threshold first (or use elif carefully). evaluate_reading(90) must be URGENT under today's policy.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-triage-cli",
      label: "Open Equipment status triage CLI",
      why: "Move the function from a mental model into the Code Lab workbench with required signals and a comprehension gate.",
    },
    commonFailures: [
      {
        failure: "Checking temperature > 90 and missing the exact 90 boundary.",
        recovery: "Use >= for the stated policy, then verify evaluate_reading(90) == 'URGENT'.",
      },
      {
        failure: "Printing the label inside the function and returning None.",
        recovery: "Return the string. Let the CLI layer print. Confirm with print(repr(evaluate_reading(90))).",
      },
      {
        failure: "Encoding policy in duplicated copy-pasted if blocks.",
        recovery: "Keep one function as the single source of triage truth for Day 1.",
      },
    ],
    checkYourself: [
      {
        question: "Why is a function safer than duplicating the same condition in three places?",
        answer: "One change updates every caller; duplicated conditions drift and create conflicting triage results that are hard to test.",
      },
      {
        question: "What should evaluate_reading(90) return under today's policy?",
        answer: "URGENT, because the urgent branch uses >= 90.",
      },
    ],
    defensePrompt:
      "Why is a function safer than duplicating the same condition in three places? Mention testing in your answer.",
  }),

  buildCodingLesson({
    day: 1,
    order: 5,
    competency: "dataInterfaces",
    title: "Lists, dictionaries, and JSON-shaped data",
    mode: "complete",
    sourceIds: ["pythonTutorial"],
    objective: "Choose list vs dictionary structure for equipment readings and complete a filter that selects urgent items.",
    whyItMatters:
      "APIs and AI extraction both traffic in JSON-shaped data. If you cannot explain why one reading is an object and many readings are an array, you will invent awkward nesting and break every later interface.",
    teach: `Use a dictionary when one thing has named fields: equipment id, temperature, status. Use a list when you have an ordered (or simply plural) collection of those things.

JSON objects map cleanly to Python dicts. JSON arrays map to Python lists. That is why API prototypes and structured AI output feel related: they share the same shape discipline.

Filtering is a common transformation: start with a list of readings, keep those that match a rule, produce a new list. A list comprehension is fine when the rule is tiny and deterministic:

\`urgent = [reading for reading in readings if reading["temperature"] >= 90]\`

Misconception: “put everything in one big dictionary keyed by 0,1,2.” That is a list pretending to be a dict. Prefer a real list.

Misconception: “nest first, simplify later.” For Day 1, keep one level of objects in a list. Clever nesting without a consumer is not architecture.

Before you invent a blank-slate schema, complete a known pattern and say out loud which field is the identity, which field is the measurement, and which structure is plural.`,
    workedExample: `readings = [
    {"equipment": "pump-7", "temperature": 94},
    {"equipment": "fan-2", "temperature": 81},
    {"equipment": "pump-3", "temperature": 70},
]

urgent = [reading for reading in readings if reading["temperature"] >= 90]
review = [reading for reading in readings if 80 <= reading["temperature"] < 90]

print(urgent)
# [{'equipment': 'pump-7', 'temperature': 94}]

print(len(review))
# 1

Shape check:
- one reading → dict with named fields
- many readings → list of dicts
- filter output → still a list of dicts (possibly empty)`,
    tryThis: "Complete urgent and REVIEW filters on the sample readings list.",
    tryThisSteps: [
      "Start from the three-sample readings list in the starter.",
      "Complete the urgent filter for temperature >= 90.",
      "Add a REVIEW filter for 80 through 89.",
      "Print both lists (or their lengths) and write one line on why the collection is a list, not a dict.",
    ],
    tryThisStarter:
      "readings = [\n  {\"equipment\": \"pump-7\", \"temperature\": 94},\n  {\"equipment\": \"fan-2\", \"temperature\": 81},\n  {\"equipment\": \"pump-3\", \"temperature\": 70},\n]\nurgent = []  # complete me\n",
    expectedOutput: `urgent → [{'equipment': 'pump-7', 'temperature': 94}]
review length → 1
# (fan-2 at 81)`,
    hint: "REVIEW is 80 <= temperature < 90. Do not include 90 in REVIEW if URGENT owns >= 90.",
    commonFailures: [
      {
        failure: "Filtering with = instead of == or using assignment in the condition.",
        recovery: "Comparison uses >= / <= / ==. Re-run on the three sample readings and check counts.",
      },
      {
        failure: "Storing readings as dict-of-dict without a clear identity strategy.",
        recovery: "For this lesson, keep a list. If you need lookup by equipment id later, build it intentionally with a comprehension.",
      },
      {
        failure: "Mutating the original list while reasoning about filters.",
        recovery: "Prefer building a new list. It is easier to explain and test.",
      },
    ],
    checkYourself: [
      {
        question: "Why is one equipment reading a dictionary while the collection of readings is a list?",
        answer: "A reading has named fields (identity + measurement). A collection is plural and ordered/iterable; a list of dicts matches that shape and maps cleanly to a JSON array of objects.",
      },
      {
        question: "What should urgent contain for the sample data in the worked example?",
        answer: "Only the pump-7 reading with temperature 94.",
      },
    ],
    defensePrompt:
      "Why is one equipment reading a dictionary while the collection of readings is a list? Answer with JSON vocabulary as well as Python vocabulary.",
  }),

  buildCodingLesson({
    day: 1,
    order: 6,
    competency: "testingDebugging",
    title: "Errors and defensive input",
    mode: "repair",
    sourceIds: ["pythonTutorial"],
    objective: "Classify syntax, runtime, and logic failures, and make invalid temperature input fail visibly instead of becoming NORMAL.",
    whyItMatters:
      "Silent defaults are how prototypes become dangerous. Operations tools that convert garbage into NORMAL train people to trust lies. Visible failure is a feature.",
    teach: `Three failure families:
1. Syntax errors — Python cannot parse the file. Nothing runs.
2. Runtime errors — Python started, then hit an impossible operation (bad conversion, missing key, etc.).
3. Logic errors — Python returns an answer that is wrong for the policy. These are the worst because they look successful.

Defensive input means: validate before you trust. If a temperature must be a number, convert deliberately and handle ValueError. Do not catch Exception and return NORMAL. That pattern hides bugs and attacker-controlled junk alike.

Misconception: “try/except makes code professional.” Broad catch-and-ignore is anti-professional. Catch the specific error you understand, and re-raise or return an explicit error result.

Misconception: “invalid input should be NORMAL because nothing is urgent.” NORMAL is a triage judgment about a valid reading. Invalid input is not a reading; it is a failed request.

In the CLI lab, your comprehension answer should be able to name an input, a boundary, and a test you would run—including an invalid input case.`,
    workedExample: `def parse_temperature(raw: str) -> float:
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError("Temperature must be a number") from exc

def evaluate_reading(temperature: float) -> str:
    if temperature >= 90:
        return "URGENT"
    if temperature >= 80:
        return "REVIEW"
    return "NORMAL"

# Unsafe pattern to reject:
# try:
#     temperature = float(raw)
#     return evaluate_reading(temperature)
# except Exception:
#     return "NORMAL"   # ← lies about validity

# Safer CLI-shaped flow:
raw = "hot"
try:
    temperature = parse_temperature(raw)
except ValueError as exc:
    print("invalid input:", exc)
else:
    print(evaluate_reading(temperature))`,
    tryThis: "Repair the silent NORMAL trap, then prove valid and invalid paths.",
    tryThisSteps: [
      "Replace except Exception: return \"NORMAL\" with specific ValueError handling.",
      "Show a valid path: raw \"94\" → URGENT.",
      "Show an invalid path: raw \"hot\" → visible error (not NORMAL).",
      "Re-open the triage CLI lab and note the invalid-input case in your comprehension answer.",
    ],
    tryThisStarter:
      "def handle(raw: str) -> str:\n    try:\n        temperature = float(raw)\n        return evaluate_reading(temperature)\n    except Exception:\n        return \"NORMAL\"  # repair this\n",
    expectedOutput: `handle("94") → "URGENT"
handle("hot") → raises or returns an explicit error / prints invalid input
# must NOT return "NORMAL" for "hot"`,
    hint: "Catch ValueError only, or let parse_temperature raise. Never map unknown failures to a triage label.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-triage-cli",
      label: "Return to Equipment status triage CLI",
      why: "Your CLI artifact should keep deterministic thresholds and refuse to launder invalid input into NORMAL.",
    },
    commonFailures: [
      {
        failure: "except Exception: return 'NORMAL'.",
        recovery: "Catch ValueError (or let it raise). Never map unknown failures to a triage label.",
      },
      {
        failure: "Treating a logic bug as fixed because the program did not crash.",
        recovery: "Add boundary checks (80, 90) and an invalid input case. Absence of traceback is not correctness.",
      },
      {
        failure: "Validating only in the UI text and not in code.",
        recovery: "Put validation next to parsing. Future callers (API, batch job) will not see your UI warning.",
      },
    ],
    checkYourself: [
      {
        question: "Why is broad exception swallowing dangerous in an operations prototype?",
        answer: "It converts distinct failures into a false NORMAL (or other success-looking result), hiding bugs and making bad input look like a trustworthy triage decision.",
      },
      {
        question: "Is invalid input a NORMAL case? Why or why not?",
        answer: "No. NORMAL is a judgment about a valid reading. Invalid input should fail validation or return an explicit error state, not a triage label.",
      },
    ],
    defensePrompt:
      "Why is broad exception swallowing dangerous in an operations prototype? Give one concrete false result it could create.",
  }),
];
