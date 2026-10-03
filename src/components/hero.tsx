import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section className="page-shell hero" aria-labelledby="intro-title">
      <h1 id="intro-title">{profile.name}<span>{profile.role}</span></h1>
      <p>소비를 비교하고 좌석을 예약하는 서비스를 만들며, 데이터와 상태를 다룬 과정을 기록합니다.</p>
    </section>
  );
}
