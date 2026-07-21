import type { Project } from "../types";
import { billingGateway } from "./billing-gateway";
import { concertBooking } from "./concert-booking";
import { realtimeChat } from "./realtime-chat";
import { eta } from "./eta";

/** 여정 순서: GATEWAY → QUEUE·LOCK → STREAM → DELIVERY */
export const projects: Project[] = [billingGateway, concertBooking, realtimeChat, eta];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
