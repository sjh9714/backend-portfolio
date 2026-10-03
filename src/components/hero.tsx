import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section className="page-shell hero" aria-labelledby="intro-title">
      <div>
        <h1 id="intro-title">{profile.name}</h1>
        <p className="hero-role">{profile.role}</p>
      </div>
      <div className="hero-copy">
        <p>{profile.lead}</p>
        <p className="hero-stack">{profile.tagline}</p>
        <div className="hero-links">
          <a className="text-link" href="/resume-sung-jinhyuk.pdf">이력서 PDF</a>
          <a className="text-link" href={`mailto:${profile.email}`}>이메일</a>
        </div>
      </div>
    </section>
  );
}
