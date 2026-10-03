import { Photo } from "@/components/photo";
import type { Service } from "@/content/types";

export function ServiceSection({ service }: { service: Service }) {
  const { what, flow, demo, noDemo } = service;
  const portraitPair = demo && demo.screens.length > 1 && demo.screens.every(screen => screen.height > screen.width);
  return (
    <section aria-label="서비스" className="service-section">
      <h2>서비스 화면과 실행</h2>
      <div className="service-description">{what.map(line => <p key={line}>{line}</p>)}</div>
      <ol className="service-flow">{flow.map(step => <li key={step}>{step}</li>)}</ol>
      {demo && <>
        {demo.preview && <div className="service-preview">
          <a href={demo.preview.href} target="_blank" rel="noreferrer" className="action-link">{demo.preview.label}</a>
          <p>{demo.preview.note}</p>
        </div>}
        <div className={`service-screens${portraitPair ? " service-screens-portrait" : ""}`}>
          {demo.screens.map(screen => {
            const portrait = screen.height > screen.width;
            return <figure key={screen.base} className={portrait ? "portrait" : undefined}>
              <Photo base={screen.base} alt={screen.alt} sizes={portrait ? "300px" : "(min-width: 748px) 700px, calc(100vw - 48px)"} width={screen.width} height={screen.height} />
              <figcaption>{screen.caption}</figcaption>
            </figure>;
          })}
        </div>
        <dl className="service-run">
          <div><dt>데모 UI</dt><dd>{demo.stack}</dd></div>
          <div><dt>로컬에서 실행하기</dt><dd><code>{demo.run}</code><span className="run-url">{demo.url}</span></dd></div>
        </dl>
        {demo.provenBy && <div className="service-proof"><h3>화면으로 확인한 범위</h3>{demo.provenBy.map(line => <p key={line}>{line}</p>)}</div>}
        <p className="service-note">위 화면은 로컬 데모 실행 결과입니다. 운영 중인 서비스가 아닙니다.</p>
      </>}
      {noDemo && <p className="service-note">{noDemo}</p>}
    </section>
  );
}
