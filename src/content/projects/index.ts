import type { Project } from "../types";
import { billingGateway } from "./billing-gateway";
import { concertBooking } from "./concert-booking";
import { finmate } from "./finmate";
import { realtimeChat } from "./realtime-chat";
import { eta } from "./eta";

/**
 * 자료의 원칙: 면접관은 위에서부터 읽으므로 가장 잘한 것을 위에 둔다.
 * 실측 수치가 가장 많고 문제 해결 3건이 붙는 좌석 예약을 첫 번째로.
 *
 * 감춘 것도 이 배열에는 남는다 — 상세 페이지 라우트를 살려 링크로 건넬 수 있어야 한다.
 */
export const projects: Project[] = [concertBooking, realtimeChat, finmate, eta, billingGateway];

/**
 * 기본 포트폴리오에 노출되는 것. 갤러리·사이트맵·이력서·히어로가 이 배열을 쓴다.
 *
 * `projects`를 그대로 쓰면 감춘 프로젝트가 새어나온다. 화면에 거는 곳은 반드시 이쪽.
 */
export const visibleProjects: Project[] = projects.filter((p) => !p.hidden);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
