import type { Project } from "../types";
import { billingGateway } from "./billing-gateway";
import { concertBooking } from "./concert-booking";
import { finmate } from "./finmate";
import { realtimeChat } from "./realtime-chat";
import { eta } from "./eta";

/** 대표 사례 순서 뒤에 추가 프로젝트를 둔다. 모든 상세 경로는 유지한다. */
export const projects: Project[] = [finmate, concertBooking, realtimeChat, eta, billingGateway];
export const visibleProjects: Project[] = projects.filter((p) => !p.hidden);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
