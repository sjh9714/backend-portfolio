import type { CaseStudy } from "./types";
import { evidence, sourceRevisions } from "./evidence";

const CHAT_QUERY = `${sourceRevisions.chat}/src/main/java/com/realtime/chat/repository/ChatRoomRepository.java`;
const CHAT_NPLUS1 = `${sourceRevisions.chat}/docs/evidence/NPLUS1_BEFORE_AFTER_2026-08-08.md`;
const BILLING_PERF = "https://github.com/sjh9714/ai-usage-billing-gateway/blob/74e5ca9ec5837fef8d0cf181c4c21aa3cd3cd871/docs/PERF_RESULT.md";

export const featuredCases = [
  {
    "caseId": "peer-rollup",
    "title": "거래가 없는 사람도 평균에 포함해야 할까?",
    "summary": "FinMate의 또래 소비 비교에서 평균의 기준을 맞추고, 같은 결과를 내는 네 가지 조회 방식을 비교했습니다.",
    "cover": {
      "base": "/screens/finmate-feed",
      "alt": "FinMate 기존 피드 화면의 소득 유사·소비 유사 그룹. 팀 시연용 고정 데이터입니다.",
      "width": 390,
      "height": 844
    }
  },
  {
    "caseId": "seat-contention",
    "title": "취소된 예약이 새 예약의 좌석을 반환한다면?",
    "summary": "좌석 선점과 테스트 결제를 제공하는 예매 서비스에서, 취소 이후 바뀐 좌석 소유권을 확인했습니다.",
    "cover": {
      "base": "/screens/concert-seats",
      "alt": "콘서트 예매 데모의 구역별 좌석과 선택한 좌석 화면",
      "width": 2560,
      "height": 1800
    }
  }
];

export const caseStudies: CaseStudy[] = [

  {
    "id": "peer-rollup",
    "projectSlug": "finmate",
    "title": "거래가 없는 사람도 평균에 포함해야 할까?",
    "summary": "FinMate의 또래 소비 비교에서 평균의 기준을 맞추고, 같은 결과를 내는 네 가지 조회 방식을 비교했습니다.",
    "sections": [
      {
        heading: "두 사람의 소비가 100원과 0원인데 평균은 100원이었다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause", "items": [0]}],
      },
      {
        heading: "거래가 없는 사람과 자료가 없는 사람을 구분했다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}, {"kind": "text", "field": "approach", "items": [0]}, {"kind": "metrics", "items": [0]}],
      },
      {
        heading: "원장이 바뀌면 집계도 다시 만들 수 있어야 했다",
        parts: [{"kind": "text", "field": "cause", "items": [1]}, {"kind": "text", "field": "approach", "items": [1]}, {"kind": "text", "field": "result", "items": [0]}],
      },
      {
        heading: "같은 답을 내는 네 가지 조회 방식을 비교했다",
        parts: [{"kind": "text", "field": "cause", "items": [2]}, {"kind": "text", "field": "approach", "items": [2]}, {"kind": "text", "field": "result", "items": [1]}, {"kind": "metrics", "items": [1]}],
      },
      {
        heading: "조회 비용은 줄었지만 갱신 비용은 남았다",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    "domain": "정확한 집계와 조회 비용",
    "situation": "같은 소득대의 월 소비를 비교하는 기능입니다. 거래가 없는 사람을 평균에 넣을지, 자료를 받지 못한 달을 0원으로 볼지에 따라 사용자가 보는 값이 달라집니다. 기존 성능 수치를 다시 확인하기 전에 이 정의부터 검사했습니다.",
    "figure": {
      "src": "/diagrams/cs-peer-rollup.svg",
      "height": 370,
      "alt": "자료가 준비된 지출자와 무거래자를 같은 모집단에 포함하고, 미적재 자료는 제외한 뒤 원장과 월 집계를 대조하는 흐름",
      "caption": "적재 범위로 비교 대상을 먼저 정하고, 같은 모집단에 대해 원장 직접 조회와 월 집계 조회의 답을 맞춥니다."
    },
    "cause": [
      "기존 쿼리는 거래가 없는 사람을 인원수에는 포함하고 평균에서는 제외했습니다. 두 사람 중 한 명만 100원을 쓰면 인원수는 두 명인데 평균은 100원이 될 수 있었습니다.",
      "월 집계를 UPSERT만 하면 마지막 거래가 삭제된 사람의 과거 집계가 남았습니다.",
      "측정 코드에는 일부 배열을 정렬하지 않고 백분위를 고르는 문제도 있었습니다."
    ],
    "alternatives": [
      {
        "option": "자료 없음도 0원으로 처리",
        "reason": "간단하지만 미수집과 실제 무거래를 구분하지 못해 평균이 왜곡됩니다.",
        "chosen": false
      },
      {
        "option": "월 자료가 준비된 사람만 비교",
        "reason": "동일 소득대의 적재 범위를 확인하고 무거래자는 0원으로 포함합니다. 본인도 같은 분모에 포함합니다.",
        "chosen": true
      }
    ],
    "approach": [
      "100원 지출자와 무거래자의 평균 50원, 부분 적재자의 제외, 미적재 월, 마지막 거래 삭제를 작은 DB 테스트로 고정했습니다.",
      "원장과 집계를 기준 테이블과 파생 테이블로 나누고, 전체 재생성의 DELETE와 INSERT를 같은 트랜잭션에 넣었습니다.",
      "같은 결과를 반환하는 직접 집계·쿼리 재작성·커버링 인덱스·사전 집계를 비교했습니다. 백분위는 정렬한 사본에서 계산하고 측정 순서의 원표본도 보존했습니다."
    ],
    "result": [
      "정확성 테스트에서 모집단과 평균이 일치하고, 마지막 거래 삭제 후 남는 집계가 제거되는 것을 확인했습니다. 기존 화면의 마이·피드 더보기·기록으로 합성 원장을 조회합니다.",
      "조회 비용은 아래 네 대안의 조건 안에서 비교합니다. 배치로 적재하는 읽기 중심 데모에는 월 집계를 유지했습니다. 전체 재생성 351.305ms는 별도 단일 관측입니다."
    ],
    "metrics": [
      evidence.finmateAccuracy,
      evidence.finmateQueries
    ],
    "limitations": [
      "원장 변경 뒤 재집계 전까지 값은 최신이 아닙니다. 실시간 거래 수집과 지속적인 갱신 비용은 검증하지 않았습니다.",
      "인덱스 대안은 인덱스 생성 후 별도로 측정했습니다. 단일 클라이언트의 warm cache 결과로, 단계 순서와 로컬 자원 경합이 영향을 줄 수 있습니다.",
      "합성 데이터입니다. 은행 계좌 연동, 미션·AI 코치·그림 생성의 전체 서비스 연결이나 실제 HTTP 부하 성과를 주장하지 않습니다."
    ],
    "sources": [
      {
        "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/src/test/java/com/gagastudio/finmate/metrics/PeerAccuracyIntegrationTest.java",
        "label": "평균·자료 없음·재집계 회귀 테스트"
      },
      {
        "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/docs/PERF_RESULT.md",
        "label": "측정 조건과 원표본"
      },
      {
        "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/src/main/java/com/gagastudio/finmate/metrics/PeerCompareService.java",
        "label": "모집단과 평균 조회 코드"
      },
      {
        "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/src/main/java/com/gagastudio/finmate/metrics/MonthlyRollup.java",
        "label": "집계 재생성 트랜잭션"
      }
    ]
  },
  {
    "id": "seat-contention",
    "projectSlug": "concert-booking",
    "title": "취소된 예약이 새 예약의 좌석을 반환한다면?",
    "summary": "취소와 재예약 사이에 달라진 좌석 소유권을 확인하고, 예약 종료와 좌석 반환을 한 트랜잭션으로 묶었습니다.",
    "sections": [
      {
        heading: "같은 취소를 두 번 처리하는 것만으로는 부족했다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "이 좌석을 지금 누가 소유하고 있는가",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "예약 종료와 좌석 반환을 함께 끝냈다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "취소와 재예약 사이에 과거 요청을 다시 넣어봤다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "테스트 결제와 실제 예매 서비스 사이에 남은 일",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    "domain": "예약 상태와 소유권",
    "situation": "좌석 선점 후 테스트 결제, 결제 전 취소와 미결제 만료를 제공하는 서비스입니다. 취소를 재처리해도 안전한지 확인하는 과정에서, 같은 좌석을 다른 예약이 다시 선점하는 순서를 넣어 보았습니다.",
    "figure": {
      "src": "/diagrams/cs-seat-contention.svg",
      "height": 370,
      "alt": "A 예약 취소와 B 재예약 이후 A의 반환 요청이 다시 와도 현재 소유자가 B인 좌석을 유지하는 흐름",
      "caption": "좌석이 HELD인지와 함께, 지금 그 좌석을 소유한 예약 ID가 요청의 예약 ID인지 확인합니다."
    },
    "cause": [
      "과거 예약의 reservation_seats 관계는 취소 뒤에도 남습니다. 이 관계와 현재 HELD 상태만 보고 반환하면 새 예약이 가진 좌석을 반환할 수 있습니다.",
      "같은 이벤트를 바로 두 번 처리하는 시험으로는 중간에 다른 예약이 생기는 경우를 찾지 못했습니다. 코드 검토 후 그 순서를 통합 테스트로 재현했습니다."
    ],
    "alternatives": [
      {
        "option": "이벤트 중복만 차단",
        "reason": "똑같은 메시지를 처리했는지는 알 수 있지만, 그 사이 바뀐 좌석 소유자를 직접 확인하지 못합니다.",
        "chosen": false
      },
      {
        "option": "현재 소유권과 상태를 함께 검사",
        "reason": "좌석의 current_reservation_id를 기록하고 확정·반환 시 대조합니다. 같은 DB의 예약 종료와 좌석 반환은 한 트랜잭션에서 끝냅니다.",
        "chosen": true
      }
    ],
    "approach": [
      "기본 예약은 선택 좌석을 ID 순서로 잠그는 DB 비관적 잠금으로 정리했습니다. 서로 다른 좌석이 공유 카운터를 갱신하지 않도록 잔여석을 좌석 상태에서 조회합니다.",
      "예약 행과 좌석 행을 순서대로 잠그고, 취소·만료와 반환을 함께 커밋합니다. 기본 서비스의 반환 경로에서는 Kafka 이벤트를 기다리지 않습니다.",
      "중복 요청 키를 유지하고 같은 예약·결제 요청에는 기존 응답을 돌려줍니다. 여러 좌석 중 하나가 실패하면 전체 예약을 롤백합니다."
    ],
    "result": [
      "A 취소, B 재예약, A 반환 재처리 뒤에도 B의 HELD 상태와 소유권이 유지됐습니다. 예약 재처리, 다중 좌석 롤백, 결제와 만료의 경쟁도 DB 통합 테스트로 확인했습니다.",
      "같은 좌석과 서로 다른 좌석에 대한 동시 요청을 나누어 아래 조건에서 결과를 대조했습니다. 이전 세 가지 락 실험은 별도 기록으로 보존했습니다."
    ],
    "metrics": [
      evidence.seatOwnership,
      evidence.seatConcurrency
    ],
    "limitations": [
      "실제 PG, 결제 후 환불, 상용 티켓 오픈 부하와 공정한 대기 순서는 포함하지 않습니다.",
      "선점은 5분, 만료 작업은 30초 주기입니다. 반환에는 한 주기의 지연이 있을 수 있으며 결제 시점에도 서버 시간으로 만료를 검사합니다.",
      "잔여석을 세는 조회 비용은 증가할 수 있습니다. 대규모 목록 조회 비용과 여러 서버의 운영 장애 복구는 추가 검증이 필요합니다."
    ],
    "sources": [
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/src/test/java/com/concert/booking/integration/ServiceBookingIntegrationTest.java",
        "label": "소유권·상태 전이 통합 테스트"
      },
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/src/main/java/com/concert/booking/domain/Seat.java",
        "label": "좌석 소유권과 상태 검사"
      },
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/src/main/java/com/concert/booking/service/reservation/SeatReleaseService.java",
        "label": "반환 트랜잭션"
      },
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/docs/evidence/2026-10-02/service-holds/summary.json",
        "label": "동시 요청 원표본과 조건"
      }
    ]
  },
  {
    "id": "shared-counter",
    "projectSlug": "concert-booking",
    "title": "좌석이 다른데 왜 예약 요청이 충돌했을까?",
    "summary": "과거 락 전략 실험에서 서로 다른 좌석 요청이 함께 갱신하던 잔여석 카운터를 추적했습니다.",
    "sections": [
      {
        heading: "서로 다른 좌석도 같은 행을 갱신하고 있었다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "잠금 도구보다 공유 데이터를 먼저 바꿨다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "성공 수와 마지막 DB 상태를 함께 읽었다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "전략별 성공률은 수정 전후의 개선율이 아니다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "이 실험으로 설명할 수 없는 것",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    "domain": "공유 데이터와 잠금",
    "situation": "기본 서비스를 정리하기 전의 락 전략 실험입니다. 서로 다른 좌석 50개에 요청해도 낙관적 락의 성공은 20건이었습니다. 실패한 대상이 좌석인지, 함께 갱신하는 데이터인지 살폈습니다.",
    "figure": {
      "src": "/diagrams/cs-shared-counter.svg",
      "alt": "서로 다른 좌석 요청이 같은 공연 일정의 잔여석 카운터를 갱신해 충돌하는 기존 구조",
      "caption": "과거 실험 모델입니다. 현재 기본 서비스는 잔여석을 좌석 상태로 조회하며 공유 카운터를 갱신하지 않습니다."
    },
    "cause": [
      "좌석은 달라도 같은 일정의 availableSeats 행을 함께 갱신했습니다. 그 행의 버전 충돌과 제한된 재시도 때문에 요청이 실패했습니다.",
      "Redis 전략 역시 일정 행의 DB 비관적 잠금을 포함했습니다. Redis만으로 충돌을 제어하는 비교가 아니었습니다."
    ],
    "alternatives": [
      {
        "option": "기존 공유 카운터와 락 전략 유지",
        "reason": "과거 결과를 비교할 수 있지만 다른 좌석도 같은 행을 갱신합니다.",
        "chosen": false
      },
      {
        "option": "기본 서비스는 좌석 단위로 제어",
        "reason": "조회 시 잔여석을 계산해 공유 갱신을 없앱니다. 기존 전략은 실험 모드로 보존합니다.",
        "chosen": true
      }
    ],
    "approach": [
      "전략별 성공 수와 최종 DB 상태를 함께 해석했습니다. 서로 다른 전략의 성공률을 수정 전후 개선율로 쓰지 않았습니다."
    ],
    "result": [
      "과거 시나리오에서 낙관 20/50건, 비관·Redis 각각 50/50건이었습니다. 이 결과가 현재 기본 서비스의 처리량이나 성능 향상률은 아닙니다."
    ],
    "metrics": [
      {
        "kind": "comparison",
        "label": "과거 전략별 예약 성공",
        "values": [
          {
            "label": "낙관적 락",
            "value": "20/50건 (40%)"
          },
          {
            "label": "비관적 락",
            "value": "50/50건 (100%)"
          },
          {
            "label": "Redis + DB 잠금",
            "value": "50/50건 (100%)"
          }
        ],
        "evidence": "measured",
        "source": {
          "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/docs/PERF_RESULT.md",
          "label": "과거 전략 실험과 조건"
        },
        "condition": "로컬 Docker, 50 VU, 서로 다른 좌석 50개. 전략별 단일 실행, JVM 워밍업 없음. 낙관적 락은 제한된 재시도를 사용합니다."
      }
    ],
    "limitations": [
      "재시도 한도를 늘렸을 때의 성공률·DB 부하는 측정하지 않았습니다.",
      "혼합 부하의 전체 응답 지연은 성공한 예약의 지연과 다릅니다. 이전 지연 수치를 현재 개선 성과로 사용하지 않습니다."
    ],
    "sources": [
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/docs/PERF_RESULT.md",
        "label": "과거 락 전략 비교"
      },
      {
        "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/src/main/java/com/concert/booking/service/reservation/ReservationCreationService.java",
        "label": "기본 서비스와 실험 전략의 분기"
      }
    ]
  },
  {
    "id": "persist-order",
    "projectSlug": "realtime-chat",
    "title": "저장된 메시지인데, 대화창에서는 왜 빠졌을까?",
    "summary": "서버 저장과 상대방 수신을 구분하고, 중간 메시지를 놓친 뒤에도 재접속으로 복구하는 기준을 정리했습니다.",
    "sections": [
      {
        heading: "더 큰 메시지 ID를 받아도 이력이 완성된 것은 아니다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "실시간 수신과 이력 동기화의 기준을 나눴다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "동기화가 끝났을 때만 복구 기준을 옮겼다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "프레임 하나를 버리고 다시 접속했다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "저장 확인이 모든 전달을 보장하지는 않는다",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    "domain": "저장과 전달의 경계",
    "situation": "Kafka 접수, DB 저장, Redis 발행, WebSocket 수신이 이어지는 두 노드 채팅 데모입니다. 저장됐다는 응답과 상대가 받았다는 응답을 구분하고, 중간 메시지를 놓친 채 더 큰 ID를 받은 경우를 검사했습니다.",
    "figure": {
      "src": "/diagrams/cs-persist-order.svg",
      "height": 370,
      "alt": "DB에 저장된 메시지 발행과 이력 동기화가 완료된 기준을 사용한 재접속 복구 흐름",
      "caption": "실시간 최대 ID가 아니라 이력 조회를 완료한 ID 이후부터 복구합니다. PERSISTED는 서버 저장 완료입니다."
    },
    "cause": [
      "기존 화면은 PERSISTED를 전달 완료로 표시했지만 이 응답이 확인하는 것은 DB 저장입니다.",
      "이력 기준이 10일 때 11을 놓치고 12를 받으면, 화면의 최대 ID인 12 이후를 읽어서는 11을 찾을 수 없습니다."
    ],
    "alternatives": [
      {
        "option": "화면의 최대 ID 이후 조회",
        "reason": "간단하지만 중간에 놓친 메시지를 건너뛸 수 있습니다.",
        "chosen": false
      },
      {
        "option": "이력 조회 완료 기준을 별도로 저장",
        "reason": "전체 페이지를 읽은 뒤에만 기준을 올립니다. 실시간 수신과 저장 ACK는 복구 기준을 움직이지 않습니다.",
        "chosen": true
      }
    ],
    "approach": [
      "DB 커밋 후 발행하는 기존 구조와 clientMessageId 중복 제거를 유지했습니다. 저장 배지를 서버 저장 완료로 수정했습니다.",
      "방별 historyCursor를 두고, 동기화 도중 실패하면 이전 완료 기준부터 다시 읽고 메시지 ID로 중복을 합칩니다.",
      "실제 WebSocket 프레임 하나만 버린 뒤 더 큰 ID를 수신하고 재접속하는 E2E를 추가했습니다."
    ],
    "result": [
      "누락 메시지를 복구한 뒤 화면에 각 메시지가 한 번씩 남는 것을 확인했습니다. 처음 비어 있던 방과 다음 이력 페이지 실패도 회귀 검사에 포함했습니다."
    ],
    "metrics": [
      evidence.chatRecovery
    ],
    "limitations": [
      "Redis 발행 예외의 재시도와 정상 발행 후 구독자가 놓친 프레임의 복구는 다릅니다. 후자는 이력 조회로 보충합니다.",
      "처음 방을 열 때는 최근 50건부터 읽습니다. 모든 과거 대화를 한 번에 복원하거나 모든 장애에서 정확히 한 번 전달을 보장하는 범위가 아닙니다.",
      "같은 방의 Kafka 순차 처리 경로를 전제로 합니다. 별도 DB 쓰기 경로의 커밋 순서 역전은 검증하지 않았습니다."
    ],
    "sources": [
      {
        "href": "https://github.com/sjh9714/realtime-chat/blob/1a55c7687a4f631e53be0b9cb202745c5f019cd8/web/e2e/chat-flow.spec.ts",
        "label": "프레임 누락·재접속 E2E"
      },
      {
        "href": "https://github.com/sjh9714/realtime-chat/blob/1a55c7687a4f631e53be0b9cb202745c5f019cd8/web/src/hooks/use-chat-socket.ts",
        "label": "이력 동기화 완료 기준"
      },
      {
        "href": "https://github.com/sjh9714/realtime-chat/blob/1a55c7687a4f631e53be0b9cb202745c5f019cd8/src/main/java/com/realtime/chat/consumer/MessagePersistenceConsumer.java",
        "label": "저장 이후 발행과 ACK"
      }
    ]
  },
  {
    "id": "provider-fanout",
    "projectSlug": "eta",
    "title": "외부 정보가 없을 때, 어디까지 알려줄 수 있을까?",
    "summary": "시설의 존재와 운행 여부를 구분하고, 빈 캐시에 몰린 동일한 조회가 하나의 요청을 함께 기다리도록 했습니다.",
    "sections": [
      {
        heading: "시설 목록만으로 지금 운행 중인지 알 수는 없다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "아직 끝나지 않은 조회도 함께 기다리게 했다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "모의 데이터의 경계와 요청 취소를 분리했다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "빈 캐시의 동시 요청과 부분 실패를 확인했다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "실제 경로의 정확성까지 확인한 것은 아니다",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    "domain": "외부 정보의 불확실성과 캐시",
    "situation": "경로 후보의 엘리베이터·정류장 정보를 외부 공급자에서 읽는 팀 해커톤 프로젝트입니다. 개인 보강에서는 LIVE 모드에 합성 값이 들어가는 경로와, 캐시가 비었을 때 동일 원본을 중복 조회하는 경로를 확인했습니다.",
    "figure": {
      "src": "/diagrams/cs-provider-fanout.svg",
      "height": 370,
      "alt": "DEMO와 LIVE 공급자를 분리하고 같은 원본의 진행 중 Task를 공유하며 미확인 운행 정보는 UNKNOWN으로 반환하는 흐름",
      "caption": "시설 목록의 존재와 현재 운행 여부를 구분합니다. 조회 시각을 운행 관측 시각으로 바꾸지 않습니다."
    },
    "cause": [
      "시설 목록에 역이 있다고 현재 운행 중인 것은 아닙니다. 기존 공급자 구성은 실 API 모드에도 모의 보행 정보와 합성 버스 대체 값을 넣을 수 있었습니다.",
      "완성된 캐시만 확인하므로, 빈 캐시에 동시에 도착한 요청은 각자 같은 원본을 조회했습니다."
    ],
    "alternatives": [
      {
        "option": "성공한 응답 값만 캐시",
        "reason": "두 번째 묶음부터는 재사용하지만 최초 동시 요청은 합치지 못합니다.",
        "chosen": false
      },
      {
        "option": "진행 중인 조회도 공유",
        "reason": "같은 원본을 조회 중인 asyncio.Task를 기다립니다. 실패는 정상 캐시에 넣지 않고 다음 요청에서 다시 조회합니다.",
        "chosen": true
      }
    ],
    "approach": [
      "DEMO와 LIVE 공급자를 분리하고 확인하지 못한 운행 정보는 UNKNOWN으로 응답합니다. 시설 존재, 목록 조회 시각, 상태 관측 시각을 구분했습니다.",
      "진행 중인 Task를 공유하고 shield로 대기자 하나의 취소가 다른 대기자를 취소하지 않게 했습니다. TTL, 공급자 오류와 부분 실패를 테스트했습니다."
    ],
    "result": [
      "테스트 대역을 사용한 빈 캐시 동시 조회에서 원본 호출 수가 8회에서 1회로 줄었습니다. 캐시가 채워진 뒤 추가 요청은 원본을 다시 부르지 않았습니다.",
      "LIVE 구성에서 합성 데이터가 혼입되지 않고, 시설 존재만 확인한 응답은 운행 미확인으로 화면까지 전달되는 것을 검사했습니다."
    ],
    "metrics": [
      evidence.etaCache
    ],
    "limitations": [
      "요청 공유는 프로세스와 이벤트 루프 하나 안에서만 작동합니다. 여러 작업자 사이의 분산 캐시는 구현하지 않았습니다.",
      "실제 TMAP·서울 API 키로 실행한 검증, 지도 렌더링, 경로의 현장 접근성과 도착시간 정확도는 미검증입니다.",
      "이전의 호출당 50ms 주입 실험은 함수 호출 구조의 비교로만 보존합니다. 실제 외부 API의 지연 개선 성과로 쓰지 않습니다."
    ],
    "sources": [
      {
        "href": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d/backend/tests/test_rebuild_boundaries.py",
        "label": "데이터 경계·동시 조회 테스트"
      },
      {
        "href": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d/backend/app/providers/seoul.py",
        "label": "캐시와 진행 중 조회 공유"
      },
      {
        "href": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d/backend/app/main.py",
        "label": "모드별 공급자 구성"
      },
      {
        "href": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d/docs/VERIFICATION.md",
        "label": "검증 범위"
      }
    ]
  }
,
  {
    id: "n-plus-one",
    projectSlug: "realtime-chat",
    domain: "채팅방 목록 · 조회 구조",
    "title": "채팅방이 늘어날수록 조회 쿼리도 늘어났다",
    "summary": "목록에 필요한 값만 읽고, 표시 이름과 최근 메시지를 모아서 조회하도록 바꿨습니다.",
    "sections": [
      {
        heading: "DTO 변환 과정에서 추가 조회가 생겼다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "목록에 필요한 값만 읽기로 했다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "프로젝션과 두 번의 배치 조회로 구성했다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "쿼리 수와 응답시간을 나누어 확인했다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "인덱스와 캐시의 효과까지 포함된 결과다",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    situation: "채팅방 목록을 엔티티로 읽고 DTO로 변환하면서 연관 컬렉션에 접근했습니다. 방 수가 늘면 추가 쿼리도 함께 늘어나는 경로를 확인했습니다.",
    figure: { src: "/diagrams/cs-nplus1.svg", alt: "방마다 조회하는 2N+1 경로를 프로젝션과 IN 배치 두 개로 변경한 구조", caption: "목록 프로젝션 1회와 표시 이름·최근 메시지 배치 조회 2회로 구성합니다." },
    cause: ["DTO 변환 중 Lazy Loading으로 방 N개에 2N+1 쿼리가 발생했습니다. 방 50개에서는 구조상 101회입니다."],
    alternatives: [
      { option: "엔티티 조회 후 DTO 변환", reason: "목록에 불필요한 엔티티와 연관 컬렉션 접근이 남습니다.", chosen: false },
      { option: "프로젝션과 IN 배치 조회", reason: "목록에 필요한 값만 읽고 부가 정보는 방 ID를 모아 조회합니다.", chosen: true },
    ],
    approach: ["JPQL 프로젝션으로 엔티티 로드를 없애고 표시 이름·최근 메시지는 IN 배치로 조회했습니다.", "관련 인덱스와 Redis 캐시도 함께 적용했습니다. 메시지·읽음 이벤트의 캐시는 영향받는 사용자 키만 커밋 뒤 무효화합니다."],
    result: ["코드상 조회 경로가 프로젝션 1회와 배치 2회로 고정됐습니다.", "10 VU 전후 비교에서 중앙값 9.9ms → 1.8ms를 관측했습니다. 200 VU에서는 양쪽 모두 포화됐고 p95는 개선되지 않았습니다."],
    metrics: [
      { kind: "before-after", label: "목록 조회 쿼리 구조", before: "2N+1회", after: "3회", evidence: "verified", source: { label: "목록 프로젝션 코드", href: CHAT_QUERY }, condition: "방 50개 기준 101회 → 3회 · 프로젝션 1 + IN 배치 2 · 코드 구조 기준" },
      { kind: "before-after", label: "HTTP 응답 중앙값", before: "9.9ms", after: "1.8ms", evidence: "measured", source: { label: "동일 스크립트 전후 측정 · 2026-08-08", href: CHAT_NPLUS1 }, condition: "10 VU · 호스트에서 앱 실행 · 쿼리·인덱스·캐시 변경 전체의 전후 결과" },
    ],
    limitations: ["N+1 수정 하나의 개선분을 분리하지 않았습니다. 두 커밋 사이 인덱스와 캐시 변경이 포함됩니다.", "200 VU의 p95는 개선 지표가 아니며, 별도 Docker REST 부하 실행과 절대값을 비교하지 않습니다."],
    sources: [{ label: "목록 조회 코드", href: CHAT_QUERY }, { label: "전후 커밋·명령·포화 구간 결과", href: CHAT_NPLUS1 }],
  },
  {
    id: "idempotency",
    projectSlug: "ai-usage-billing-gateway",
    domain: "사용량 과금 · 재시도와 원장",
    "title": "같은 요청이 다시 와도 사용량은 한 번만 기록하려면",
    "summary": "사용량 요청 키와 결제 이벤트 ID를 기준으로 재시도를 구분하고, 원장에 중복으로 반영되는지 확인했습니다.",
    "sections": [
      {
        heading: "서명 검증만으로는 중복 반영을 막을 수 없다",
        parts: [{"kind": "text", "field": "situation"}, {"kind": "text", "field": "cause"}],
      },
      {
        heading: "요청 키와 결제 이벤트 ID로 재전달을 구분했다",
        parts: [{"kind": "alternatives"}, {"kind": "figure"}],
      },
      {
        heading: "사용량과 금액 변화에 각각 기록 기준을 뒀다",
        parts: [{"kind": "text", "field": "approach"}],
      },
      {
        heading: "모의 응답과 재전달 시나리오를 반복했다",
        parts: [{"kind": "text", "field": "result"}, {"kind": "metrics"}],
      },
      {
        heading: "실제 AI 제공자와 PG 연동은 남아 있다",
        parts: [{"kind": "text", "field": "limitations"}],
      },
    ],
    situation: "mock AI 응답을 REQUEST 1회로 계량하는 게이트웨이입니다. 클라이언트 재시도와 모의 결제 webhook 재전달이 원장에 중복 반영되지 않는지 확인했습니다.",
    figure: { src: "/diagrams/cs-idempotency.svg", alt: "요청 키와 결제 이벤트 ID로 중복을 확인한 뒤 append-only 원장에 기록하는 경로", caption: "사용량의 요청 키와 webhook의 이벤트 ID를 각각 중복 판정 경계로 둡니다." },
    cause: ["같은 사용량 요청이나 결제 이벤트를 새 이벤트로 처리하면 원장에 두 번 반영될 수 있습니다. 서명 검증만으로 재전달 중복까지 막을 수는 없습니다."],
    alternatives: [
      { option: "도착한 요청을 매번 기록", reason: "재시도와 신규 사용량을 구분할 근거가 없습니다.", chosen: false },
      { option: "요청 키·이벤트 ID로 중복 판정", reason: "동일 요청은 기존 결과를 재사용하고, 동일 키의 다른 본문은 거절합니다.", chosen: true },
    ],
    approach: ["사용량 API는 Idempotency-Key를 강제하고, webhook은 HMAC 검증 뒤 providerEventId로 중복을 제거했습니다.", "금액 변화는 append-only 원장에 기록하고 환불은 반대 방향 엔트리로 남겼습니다."],
    result: ["게이트웨이·직접 계량·인보이스·webhook을 포함한 로컬 혼합 시나리오를 3회 실행해 매회 체크 150/150, HTTP 실패 0/150을 확인했습니다.", "검증한 멱등 replay·webhook 재전달 시나리오에서 중복 계량과 중복 결제 반영은 관측되지 않았습니다."],
    metrics: [
      { kind: "observation", label: "혼합 시나리오 체크", value: "매회 150 / 150 통과", evidence: "verified", source: { label: "PERF_RESULT · full mixed repeat3", href: BILLING_PERF }, condition: "로컬 · 5 VU · 30초 · 3회 · mock AI 응답 및 모의 webhook · 매회 HTTP 실패 0/150" },
      { kind: "observation", label: "중복 계량·결제 반영", value: "관측 0건", evidence: "verified", source: { label: "멱등성·webhook 중복 검증", href: BILLING_PERF }, condition: "동일 키 replay·동일 이벤트 재전달 시나리오 · 실제 PG 처리량 검증 아님" },
    ],
    limitations: ["실제 AI 제공자나 PG를 연동한 과금 서비스가 아닙니다. mock 응답을 REQUEST 1로 계량합니다.", "5 VU의 동작 확인이며 운영 처리량·지연시간·결제 처리량으로 주장하지 않습니다."],
    sources: [{ label: "혼합 시나리오·멱등 검증과 측정 경계", href: BILLING_PERF }],
  },
];

export function caseStudiesFor(slug: string): CaseStudy[] {
  return caseStudies.filter(item => item.projectSlug === slug);
}
