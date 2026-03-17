import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-panel">
        <div className="landing-content">
          <p className="eyebrow">Task Management Application</p>
          <h1>Manage work with clarity, security, and speed.</h1>
          <p>
            A production-ready workflow with JWT auth, encrypted task content, and clean APIs for
            creating, tracking, and completing tasks.
          </p>

          <div className="landing-actions">
            <Link href="/register" className="primary-button">
              Get Started
            </Link>
            <Link href="/login" className="ghost-button">
              Sign In
            </Link>
          </div>
        </div>

        <aside className="landing-highlights">
          <h2>What you get</h2>
          <ul>
            <li>Secure login with HTTP-only JWT cookies</li>
            <li>Encrypted task descriptions at rest</li>
            <li>Pagination, status filters, and title search</li>
            <li>Protected dashboard for user-specific tasks</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
