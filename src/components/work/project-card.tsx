import Link from "next/link";
import { Photo } from "@/components/photo";
import type { Project } from "@/content/types";

/**
 * 갤러리 카드. lusion의 배열 순서(비주얼 → 라벨 → 제목)를 따른다.
 *
 * 상태를 쓰지 않고 CSS group-hover만으로 반응하므로 서버 컴포넌트로 남는다.
 */
export function ProjectCard({
  project,
  index,
  priority = false,
}: {
  project: Project;
  index: number;
  priority?: boolean;
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      {/*
        사진은 스크롤에 따라 프레임 안에서 아주 천천히 밀린다(.photo-drift).
        hover 확대는 바깥 래퍼가 맡는다 — 같은 요소에 걸면 스크롤 애니메이션의
        transform이 hover transition을 덮어써서 둘 다 죽는다.
      */}
      <div className="relative overflow-hidden bg-[var(--color-surface)]">
        <div className="photo-drift transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <Photo
            base={project.photo.base}
            alt={project.photo.alt}
            priority={priority}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        {/*
          액센트 틴트 — hover를 알리는 정도로만. 완전히 덮으면 사진 내용이 안 보인다
          (영수증 품목처럼 사진 자체가 정보를 담는 경우가 있다).
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[var(--color-accent)] opacity-0 mix-blend-color transition-opacity duration-500 group-hover:opacity-50"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="label text-[var(--color-muted)]">{project.domain}</p>
        <span className="font-mono text-xs text-[var(--color-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="subhead mt-2 group-hover:text-[var(--color-accent)]">{project.name}</h3>

      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {project.summary[0]}
      </p>
    </Link>
  );
}
