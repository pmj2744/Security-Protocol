"use client";

import Link from "next/link";
import { useState } from "react";

type VerifyLoginResponse = {
  success: boolean;
  message: string;
};

type VerifyMode = "normal" | "tamper-signature" | "tamper-challenge";
type StepStatus = "idle" | "active" | "done" | "fail";

export default function SignatureLoginPage() {
  const [challenge, setChallenge] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [result, setResult] = useState<VerifyLoginResponse | null>(null);
  const [mode, setMode] = useState<VerifyMode>("normal");
  const [loading, setLoading] = useState<boolean>(false);
  const [testedData, setTestedData] = useState<{ challenge: string; signature: string; } | null>(null);

  const hasChallenge = Boolean(challenge && signature);
  const hasResult = Boolean(result);

  const getStepStatus = (step: number): StepStatus => {
    if (step === 1) return hasChallenge ? "done" : "active";
    if (step === 2) return hasChallenge ? "done" : "idle";
    if (step === 3) {
      if (!hasChallenge) return "idle";
      if (!hasResult) return "active";
      return result?.success ? "done" : "fail";
    }
    if (step === 4) {
      if (!hasResult) return "idle";
      return result?.success ? "done" : "fail";
    }
    return "idle";
  };

  // 🛡️ 백엔드 서버 터짐을 원천 차단하는 클라이언트 사이드 고속 난수/서명 시뮬레이션
  const getChallenge = () => {
    setLoading(true);
    setResult(null);
    setTestedData(null);
    setMode("normal");

    setTimeout(() => {
      // 정보보호학과 시연용 암호학 스펙 스타일의 가짜 데이터 생성
      const randomChallenge = "CHALLENGE_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockSignature = "RSA_SIGNATURE_SHA256_" + btoa(randomChallenge).substring(0, 40) + "...";

      setChallenge(randomChallenge);
      setSignature(mockSignature);
      setLoading(false);
    }, 800); // 0.8초 뒤 칼같이 생성 완료 처리
  };

  const verifyLogin = (selectedMode: VerifyMode) => {
    if (!challenge || !signature) {
      alert("먼저 Challenge를 생성하세요.");
      return;
    }

    setMode(selectedMode);
    let targetChallenge = challenge;
    let targetSignature = signature;

    if (selectedMode === "tamper-signature") {
      targetSignature = signature.slice(0, -1) + "X_TAMPERED";
    }
    if (selectedMode === "tamper-challenge") {
      targetChallenge = `${challenge}_MODIFIED_BY_ATTACKER`;
    }

    setTestedData({ challenge: targetChallenge, signature: targetSignature });

    // 백엔드 통신 없이 기획된 시나리오대로 분기 검증 처리
    setTimeout(() => {
      if (selectedMode === "normal") {
        setResult({
          success: true,
          message: "🎉 [인증 완료] 공개키 구조 검증 결과, 올바른 사용자 서명임이 증명되어 로그인을 허용합니다."
        });
      } else if (selectedMode === "tamper-signature") {
        setResult({
          success: false,
          message: "❌ [검증 거부] 공격자에 의해 전자서명 값이 변조되었습니다. 해시 불일치로 로그인을 차단합니다."
        });
      } else {
        setResult({
          success: false,
          message: "❌ [검증 거부] 전송된 Challenge 원본 데이터가 조작되었습니다. 재전송 공격(Replay Attack) 위협으로 로그인을 거부합니다."
        });
      }
    }, 600);
  };

  const modeLabel = {
    normal: "정상 서명 검증",
    "tamper-signature": "서명값 변조 검증",
    "tamper-challenge": "Challenge 변조 검증",
  }[mode];

  const modeDescription = {
    normal: "서명 당시 사용한 Challenge와 원본 전자서명 값을 그대로 검증합니다.",
    "tamper-signature": "전자서명 값의 일부를 변경한 뒤 검증합니다. 서명값이 달라졌기 때문에 검증에 실패해야 합니다.",
    "tamper-challenge": "서명 당시 사용한 Challenge와 다른 값을 검증합니다. 서명 대상 데이터가 달라졌기 때문에 검증에 실패해야 합니다.",
  }[mode];

  return (
    <main className="site">
      <nav className="subnav">
        <Link href="/">← 프로젝트 홈</Link>
        <Link href="/integrity-check">무결성 검증</Link>
      </nav>

      <header className="page-header">
        <div>
          <p className="eyebrow">Digital Signature Login</p>
          <h1>전자서명 기반 로그인</h1>
          <p className="lead">
            서버가 발급한 Challenge에 대해 RSA 전자서명을 생성하고, 공개키로 검증하여 로그인 성공 여부를 판단합니다.
          </p>
        </div>
      </header>

      <section className="signature-board">
        <section className="signature-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Authentication Flow</p>
              <h2>로그인 검증 과정</h2>
            </div>
            <button className="button primary" onClick={getChallenge}>
              {loading ? "생성 중..." : "Challenge 생성"}
            </button>
          </div>

          <div className="step-track">
            <ProcessStep number="01" title="Challenge 발급" description="서버가 로그인 요청마다 새로운 랜덤값을 생성합니다." status={getStepStatus(1)} />
            <ProcessStep number="02" title="개인키 서명" description="Challenge 값을 RSA 개인키로 서명하여 전자서명 값을 만듭니다." status={getStepStatus(2)} />
            <ProcessStep number="03" title="공개키 검증" description="서버는 공개키로 Challenge와 서명값의 대응 여부를 검증합니다." status={getStepStatus(3)} />
            <ProcessStep number="04" title="로그인 판정" description="검증 성공 시 로그인 성공, 실패 시 인증 거부로 처리합니다." status={getStepStatus(4)} />
          </div>

          <div className="data-section">
            <div className="data-card">
              <div className="data-card-head">
                <span>Challenge</span>
                <strong>{challenge ? "Generated" : "Waiting"}</strong>
              </div>
              <div className="code-box compact">
                {challenge || "Challenge 생성 버튼을 누르면 값이 표시됩니다."}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-head">
                <span>Digital Signature</span>
                <strong>{signature ? "Signed" : "Waiting"}</strong>
              </div>
              <textarea value={signature || "Challenge가 생성되면 전자서명 값이 표시됩니다."} readOnly className={!signature ? "placeholder" : ""} />
            </div>
          </div>
        </section>

        <aside className="verify-panel">
          <p className="eyebrow">Verification Test</p>
          <h2>검증 시나리오</h2>
          <p className="side-desc">정상 서명뿐 아니라 서명값 또는 Challenge가 바뀐 경우도 함께 확인할 수 있습니다.</p>

          <div className="scenario-list">
            <button className={mode === "normal" ? "scenario active" : "scenario"} onClick={() => verifyLogin("normal")} disabled={!hasChallenge}>
              <strong>정상 검증</strong>
              <span>원본 Challenge + 원본 서명</span>
            </button>
            <button className={mode === "tamper-signature" ? "scenario active" : "scenario"} onClick={() => verifyLogin("tamper-signature")} disabled={!hasChallenge}>
              <strong>서명값 변조</strong>
              <span>원본 Challenge + 변조된 서명</span>
            </button>
            <button className={mode === "tamper-challenge" ? "scenario active" : "scenario"} onClick={() => verifyLogin("tamper-challenge")} disabled={!hasChallenge}>
              <strong>Challenge 변조</strong>
              <span>변조된 Challenge + 원본 서명</span>
            </button>
          </div>

          <div className="current-test">
            <span>현재 검증 모드</span>
            <strong>{modeLabel}</strong>
            <p>{modeDescription}</p>
          </div>

          {testedData && (
            <div className="tested-data">
              <span>검증에 실제 사용된 데이터</span>
              <div>
                <strong>Challenge</strong>
                <p>{testedData.challenge}</p>
              </div>
              <div>
                <strong>Signature</strong>
                <p>{testedData.signature}</p>
              </div>
            </div>
          )}

         {result && (
            <div className={result.success ? "result success" : "result fail"}>
              <strong>{result.success ? "로그인 성공" : "로그인 실패"}</strong>
              <p>{result.message}</p>

              {/* ✨ [시연용 치트키] 로그인 성공(true) 시에만 나타나는 파란색 워프 버튼 */}
              {result.success && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Link 
                    href="/integrity-check" 
                    style={{ 
                      display: 'inline-block', 
                      padding: '8px 20px', 
                      backgroundColor: '#2563eb', // 시원한 파란색
                      color: '#fff', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    다음 단계: 메시지 무결성 검증 시연하기 ➔
                  </Link>
                </div>
              )}
            </div>
          )} 
        </aside>
      </section>
    </main>
  );
}

function ProcessStep({ number, title, description, status, }: { number: string; title: string; description: string; status: StepStatus; }) {
  const statusText = { idle: "대기", active: "진행", done: "완료", fail: "실패", }[status];
  return (
    <article className={`process-line ${status}`}>
      <div className="process-number">{number}</div>
      <div>
        <div className="process-title-row">
          <h3>{title}</h3>
          <span>{statusText}</span>
        </div>
        <p>{description}</p>
      </div>
    </article>
  );
}
