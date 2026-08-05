import type { Project } from "../types";
import { billingGateway } from "./billing-gateway";
import { concertBooking } from "./concert-booking";
import { realtimeChat } from "./realtime-chat";
import { eta } from "./eta";

/**
 * 자료의 원칙: 면접관은 위에서부터 읽으므로 가장 잘한 것을 위에 둔다.
 * 실측 수치가 가장 많고 문제 해결 3건이 붙는 좌석 예약을 첫 번째로.
 */
export const projects: Project[] = [concertBooking, billingGateway, realtimeChat, eta];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
