import Link from "next/link";

export default function Home() {
  return (
    <main className="hero-shell">
      <section className="hero-panel">
        <p className="eyebrow">Production-Ready Demo</p>
        <h1>Secure Task Management for Real-World Delivery</h1>
        <p>
          JWT authentication in HTTP-only cookies, encrypted task descriptions, strict validation,
          and paginated task APIs with status filtering and title search.
        </p>

        <div className="hero-actions">
          <Link href="/register" className="primary-button">
            Create Account
          </Link>
          <Link href="/login" className="ghost-button">
            Log In
          </Link>
        </div>
      </section>
    </main>
  );
}
