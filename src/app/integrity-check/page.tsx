"use client";

import Link from "next/link";
import { useState } from "react";

type IntegrityPacket = {
  message: string;
  hash: string;
  signature: string;
};

type IntegrityResult = {
  recalculatedHash: string;
  hashMatch: boolean;
  signatureValid: boolean;
  integrityValid: boolean;
};

type IntegrityApiResponse = {
  success: boolean;
  packet: IntegrityPacket;
  normalResult: IntegrityResult;
  tamperedMessage: string;
  tamperedResult: IntegrityResult;
};

export default function IntegrityCheckPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<IntegrityApiResponse | null>(null);

  const verifyIntegrity = async () => {
    if (!message.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }

    const response = await fetch("/api/integrity-check/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = (await response.json()) as IntegrityApiResponse;
    setResult(data);
  };

  return (
    <main className="site">
      <nav className="subnav">
        <Link href="/">← 프로젝트 홈</Link>
        <Link href="/signature-login">전자서명 로그인</Link>
      </nav>

      <header className="page-header">
        <div>
          <p className="eyebrow">Message Integrity</p>
          <h1>메시지 무결성 검증 흐름</h1>
          <p className="lead">
            메시지가 전송 중 변경되었는지 확인하기 위해 해시값 비교와
            전자서명 검증을 함께 수행합니다.
          </p>
        </div>
      </header>

      <section className="protocol-layout">
        <aside className="protocol-summary">
          <h2>Verification Logic</h2>

          <div className="flow-mini">
            <div>Message</div>
            <span>SHA-256 해시</span>
            <div>Hash</div>
            <span>RSA 개인키 서명</span>
            <div>Signature</div>
            <span>공개키 검증</span>
            <div>Result</div>
            <span>변조 여부 판단</span>
          </div>

          <div className="notice">
            메시지가 한 글자라도 바뀌면 SHA-256 해시값이 달라지므로 무결성
            검증에 실패합니다.
          </div>
        </aside>

        <section className="protocol-main">
          <div className="tool-card-head">
            <div>
              <p className="eyebrow">Message Test</p>
              <h2>원본 메시지와 변조 메시지 비교</h2>
            </div>
          </div>

          <div className="input-line">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="검증할 메시지를 입력하세요."
            />
            <button className="button primary" onClick={verifyIntegrity}>
              검증 실행
            </button>
          </div>

          {!result && (
            <div className="empty-timeline">
              메시지를 입력하고 검증을 실행하면 해시 생성, 전자서명, 원본 검증,
              변조 검증 과정이 순서대로 표시됩니다.
            </div>
          )}

          {result && result.success && (
            <>
              <section className="protocol-timeline visible">
                <article className="timeline-item">
                  <div className="timeline-index">01</div>
                  <div className="timeline-content">
                    <h3>원본 메시지 입력</h3>
                    <p>사용자가 검증할 메시지를 입력합니다.</p>
                    <div className="code-box compact">{result.packet.message}</div>
                  </div>
                </article>

                <article className="timeline-item">
                  <div className="timeline-index">02</div>
                  <div className="timeline-content">
                    <h3>SHA-256 해시 생성</h3>
                    <p>
                      메시지를 고정 길이의 해시값으로 변환합니다. 메시지가 조금만
                      바뀌어도 이 값은 완전히 달라집니다.
                    </p>
                    <div className="code-box compact">{result.packet.hash}</div>
                  </div>
                </article>

                <article className="timeline-item">
                  <div className="timeline-index">03</div>
                  <div className="timeline-content">
                    <h3>해시값에 전자서명 생성</h3>
                    <p>
                      원본 메시지의 해시값에 RSA 개인키로 서명하여 송신자 인증과
                      부인 방지를 함께 제공합니다.
                    </p>
                    <textarea value={result.packet.signature} readOnly />
                  </div>
                </article>

                <article className="timeline-item">
                  <div className="timeline-index">04</div>
                  <div className="timeline-content">
                    <h3>원본 메시지 검증</h3>
                    <p>
                      원본 메시지를 다시 해시하고, 기존 해시값 및 전자서명을
                      검증합니다.
                    </p>

                    <div className="check-row">
                      <span>해시값 일치</span>
                      <strong className={result.normalResult.hashMatch ? "ok-text" : "fail-text"}>
                        {result.normalResult.hashMatch ? "통과" : "실패"}
                      </strong>
                    </div>

                    <div className="check-row">
                      <span>전자서명 검증</span>
                      <strong className={result.normalResult.signatureValid ? "ok-text" : "fail-text"}>
                        {result.normalResult.signatureValid ? "통과" : "실패"}
                      </strong>
                    </div>
                  </div>
                </article>

                <article className="timeline-item danger">
                  <div className="timeline-index">05</div>
                  <div className="timeline-content">
                    <h3>변조 메시지 검증</h3>
                    <p>
                      원본 메시지 뒤에 문자열을 추가해 변조 상황을 만들고 같은
                      서명값으로 검증합니다.
                    </p>

                    <div className="code-box compact">
                      {result.tamperedMessage}
                    </div>

                    <div className="check-row">
                      <span>해시값 일치</span>
                      <strong className={result.tamperedResult.hashMatch ? "ok-text" : "fail-text"}>
                        {result.tamperedResult.hashMatch ? "통과" : "실패"}
                      </strong>
                    </div>

                    <div className="check-row">
                      <span>최종 무결성</span>
                      <strong className={result.tamperedResult.integrityValid ? "ok-text" : "fail-text"}>
                        {result.tamperedResult.integrityValid
                          ? "검증 성공"
                          : "변조 탐지"}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="final-compare">
                <article className="compare-card ok">
                  <span>Original Message</span>
                  <h3>원본 메시지</h3>
                  <p>해시값과 전자서명 검증이 모두 통과했습니다.</p>
                </article>

                <article className="compare-card warn">
                  <span>Tampered Message</span>
                  <h3>변조 메시지</h3>
                  <p>재계산된 해시값이 달라져 메시지 변조가 탐지되었습니다.</p>
                </article>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}