import Link from "next/link";
import { trackList } from "@/lib/tracks";

const signals = [
  {
    eyebrow: "01 · PRACTICE",
    title: "Work through the decision.",
    copy: "Short instruction gets you oriented. The real learning happens when you make the call, explain it, and see the consequence.",
  },
  {
    eyebrow: "02 · PROVE",
    title: "Build evidence you can use.",
    copy: "Every meaningful activity leaves behind a case study, decision record, incident response, or interview answer you can revisit.",
  },
  {
    eyebrow: "03 · IMPROVE",
    title: "Keep the first attempt.",
    copy: "Revision is visible by design. You will see what changed, why it changed, and where to focus next.",
  },
];

export default function Home() {
  return (
    <main className="marketing">
      <div className="market-grid" aria-hidden="true" />
      <nav>
        <Link href="/" className="brand">
          <span className="brand-mark">E0</span>
          <span>
            ENGINEER
            <br />
            ZERO
          </span>
        </Link>
        <div className="market-nav-links">
          <Link href="#tracks">Tracks</Link>
          <Link href="#experience">Experience</Link>
          <Link href="/learn" className="nav-cta">
            Open workspace <span>↗</span>
          </Link>
        </div>
      </nav>

      <section className="market-hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="pulse-dot" /> CAREER TRAINING FOR HIGH-TRUST
            TECHNICAL ROLES
          </div>
          <h1>
            Train for the work
            <br />
            <span>before the interview.</span>
          </h1>
          <p>
            Engineer Zero turns career preparation into a practice environment
            for real technical judgment: investigate, decide, build evidence,
            and explain your reasoning under pressure.
          </p>
          <div className="hero-actions">
            <Link href="/learn" className="primary hero-primary">
              Build my readiness map <span>→</span>
            </Link>
            <a href="#experience" className="hero-text-link">
              See the learning loop <span>↓</span>
            </a>
          </div>
          <div className="proof">
            <span>
              <i>✓</i> Scenario-led practice
            </span>
            <span>
              <i>✓</i> Evidence, not completion clicks
            </span>
            <span>
              <i>✓</i> AI-native without dependency
            </span>
          </div>
        </div>

        <aside className="mission-console">
          <div className="console-topline">
            <span>YOUR NEXT MOVE</span>
            <b>READY WHEN YOU ARE</b>
          </div>
          <div className="console-orbit" aria-hidden="true">
            <span />
            <span />
            <i>01</i>
          </div>
          <div className="console-title">
            <span>ENGINEER ZERO</span>
            <h2>
              Choose a path.
              <br />
              Make it yours.
            </h2>
          </div>
          <div className="console-paths">
            <article>
              <span className="path-icon sprint">48</span>
              <div>
                <b>Interview Sprint</b>
                <small>48-hour guided preparation</small>
              </div>
              <em>→</em>
            </article>
            <article>
              <span className="path-icon track">16</span>
              <div>
                <b>Role Program</b>
                <small>Foundations to capstone</small>
              </div>
              <em>→</em>
            </article>
            <article>
              <span className="path-icon studio">◎</span>
              <div>
                <b>Interview Studio</b>
                <small>Practice your explanation</small>
              </div>
              <em>→</em>
            </article>
          </div>
          <div className="console-footer">
            <span>READINESS MODEL</span>
            <div>
              <i />
              <i />
              <i />
              <i />
            </div>
            <b>Understand · Build · Troubleshoot · Explain</b>
          </div>
        </aside>
      </section>

      <section id="experience" className="market-section experience-section">
        <div className="section-intro">
          <span className="eyebrow teal">A BETTER WAY TO PREPARE</span>
          <h2>
            Less content consumption.
            <br />
            <span>More career momentum.</span>
          </h2>
          <p>
            Traditional courses reward watching. Engineer Zero rewards the
            behavior employers actually test: structured thinking, technical
            follow-through, good judgment, and honest ownership.
          </p>
        </div>
        <div className="signal-list">
          {signals.map((signal) => (
            <article key={signal.eyebrow}>
              <span>{signal.eyebrow}</span>
              <h3>{signal.title}</h3>
              <p>{signal.copy}</p>
              <div className="signal-line">
                <i />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="tracks" className="market-section tracks-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LAUNCH TRACKS</span>
            <h2>
              Start with the role
              <br />
              you want to earn.
            </h2>
          </div>
          <p>
            Every track follows the same progression: reality check, interview
            sprint, intensive practice, mastery work, and a final review.
          </p>
        </div>
        <div className="public-tracks">
          {trackList.map((track, index) => (
            <article key={track.id} className={track.accent}>
              <header>
                <span>0{index + 1}</span>
                <small>ACTIVE TRACK</small>
              </header>
              <h3>{track.title}</h3>
              <p>{track.subtitle}</p>
              <ul>
                {track.phases.map((phase) => (
                  <li key={phase.id}>
                    <i />
                    {phase.title}
                    <small>{phase.duration}</small>
                  </li>
                ))}
              </ul>
              <footer>
                <div>
                  <small>FULL ACCESS</small>
                  <strong>{track.price}</strong>
                </div>
                <Link href={`/learn?track=${track.id}`}>
                  Explore <span>→</span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section
        className="market-section method"
        aria-label="The Engineer Zero learning loop"
      >
        <div className="method-marker">
          <span>THE LOOP</span>
          <b>01</b>
        </div>
        <div>
          <span className="eyebrow teal">THE ENGINEER ZERO METHOD</span>
          <h2>
            Learn it.
            <br />
            Use it.
            <br />
            <span>Explain it.</span>
          </h2>
        </div>
        <div className="method-copy">
          <p>
            Use AI like a capable teammate, not a black box. You will practice
            independently, work with coaching, review generated work, and solve
            incidents without help when it counts.
          </p>
          <Link href="/learn" className="secondary">
            Enter the workspace <span>→</span>
          </Link>
        </div>
      </section>

      <footer className="market-footer">
        <span>ENGINEER ZERO</span>
        <span>Interactive-first career training</span>
        <span>Built for modern technical work</span>
      </footer>
    </main>
  );
}
