"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// 주소창의 ?tab=register 파라미터를 읽어오기 위해 Next.js 훅을 추가합니다.
import { useSearchParams } from "next/navigation";

type ChallengeResponse = {
  challenge: string;
  signature: string;
};

type VerifyLoginResponse = {
  success: boolean;
  message: string;
};

type VerifyMode = "normal" | "tamper-signature" | "tamper-challenge";
type StepStatus = "idle" | "active" | "done" | "fail";

export default function SignatureLoginPage() {
  // --------------------------------------------------------
  //  [UI 개선 핵심] 탭 전환 상태 관리 및 주소창 동기화 로직
  // --------------------------------------------------------
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  // 주소창의 ?tab= 값을 실시간 감지하여 UI 자동으로 전환하기
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "login") {
      setActiveTab("login");
    } else {
      setActiveTab("register");
    }
  }, [searchParams]);

  // --------------------------------------------------------
  // 기존 로그인 및 상태 관리 변수들 (보존)
  // --------------------------------------------------------
  const [challenge, setChallenge] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [result, setResult] = useState<VerifyLoginResponse | null>(null);
  const [mode, setMode] = useState<VerifyMode>("normal");
  const [loading, setLoading] = useState<boolean>(false);
  const [testedData, setTestedData] = useState<{ challenge: string; signature: string; } | null>(null);

  // 민정님 파트(인증서 발급) 전용 시뮬레이션 상태 추가
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [regStep, setRegStep] = useState<number>(0);

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

  const getChallenge = async () => {
    setLoading(true);
    setResult(null);
    setTestedData(null);
    setMode("normal");

    const response = await fetch("/api/signature-login/challenge");
    const data = (await response.json()) as ChallengeResponse;

    setChallenge(data.challenge);
    setSignature(data.signature);
    setLoading(false);
  };

  const verifyLogin = async (selectedMode: VerifyMode) => {
    if (!challenge || !signature) {
      alert("먼저 Challenge를 생성하세요.");
      return;
    }

    setMode(selectedMode);
    let targetChallenge = challenge;
    let targetSignature = signature;

    if (selectedMode === "tamper-signature") {
      targetSignature = signature.slice(0, -1) + (signature.endsWith("a") ? "b" : "a");
    }
    if (selectedMode === "tamper-challenge") {
      targetChallenge = `${challenge}00`;
    }

    setTestedData({ challenge: targetChallenge, signature: targetSignature });

    const response = await fetch("/api/signature-login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: targetChallenge, signature: targetSignature }),
    });

    const data = (await response.json()) as VerifyLoginResponse;
    setResult(data);
  };

  // 민정님 파트: 인증서 발급 모의 프로세스 함수
  const handleRegisterSimulation = () => {
    setRegLoading(true);
    setRegStep(1);
    setTimeout(() => {
      setRegStep(2);
      setTimeout(() => {
        setRegStep(3);
        setRegLoading(false);
      }, 1500);
    }, 1500);
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
    <main className="site" style={{ paddingBottom: '60px' }}>
      <nav className="subnav">
        <Link href="/">← 프로젝트 홈</Link>
        <Link href="/integrity-check">무결성 검증</Link>
      </nav>

      {/* 1. 상단 인트로 헤더 구역 */}
      <header className="page-header">
        <div>
          <p className="eyebrow">X.509 PKI & Digital Signature</p>
          <h1>사용자 인증 및 발급 체계</h1>
          <p className="lead">
            공개키 기반 구조(PKI)의 핵심인 인증서 발급과, 발급된 개인키를 이용한 Challenge-Response 전자서명 로그인 프로토콜을 통합 검증합니다.
          </p>
        </div>
      </header>

      {/* 📊 [✨ UI 대혁신] 발표 동선을 지배할 상단 스위칭 탭 디자인 구역 */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 30px auto', padding: '0 20px', display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab("register")}
          style={{
            padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', background: 'none', border: 'none',
            borderBottom: activeTab === "register" ? '3px solid #10b981' : '3px solid transparent',
            color: activeTab === "register" ? '#10b981' : '#718096', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
           1단계: 사용자 등록 / 인증서 발급 (조민정)
        </button>
        <button 
          onClick={() => setActiveTab("login")}
          style={{
            padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', background: 'none', border: 'none',
            borderBottom: activeTab === "login" ? '3px solid #3b82f6' : '3px solid transparent',
            color: activeTab === "login" ? '#3b82f6' : '#718096', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
           2단계: 전자서명 로그인 검증 (정은미)
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 화면 1: [조민정 담당] 사용자 등록 및 인증서 발급 UI 구역 */}
      {/* -------------------------------------------------------- */}
      {activeTab === "register" && (
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>인증기관(CA) 사용자 공개키 등록 및 발급 시뮬레이터</h2>
            <p style={{ color: '#718096', marginBottom: '30px', fontSize: '0.95rem' }}>
              사용자가 ID를 생성하면 디바이스 내에서 RSA 키 쌍(Key Pair)이 생성되며, 공개키를 CA(인증기관)에 제출하여 X.509 형식의 사용자 인증서를 발급받는 보안 프로토콜 초기 단계를 시뮬레이션합니다.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
              <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px' }}>신규 사용자 등록 신청</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>사용자 ID (디지털 신원)</label>
                  <input type="text" placeholder="joongbu_security_team" defaultValue="joongbu_security_team" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} readOnly />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>암호화 알고리즘 지정</label>
                  <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }} disabled>
                    <option>RSA 2048-bit (SHA256withRSA)</option>
                  </select>
                </div>
                <button className="button primary" style={{ width: '100%', backgroundColor: '#10b981', padding: '12px', fontWeight: 'bold' }} onClick={handleRegisterSimulation} disabled={regLoading}>
                  {regLoading ? "인증 키 쌍 생성 및 CA 발급 요청 중..." : "인증서 발급 요청 ➔"}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '16px', background: regStep >= 1 ? '#e8f5e9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: regStep >= 1 ? 1 : 0.5 }}>
                  <strong style={{ display: 'block', color: regStep >= 1 ? '#2e7d32' : '#1a202c' }}>1. 로컬 키 쌍 생성 및 CSR 구조화</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#718096' }}>사용자 PC 로컬 영역에서 공개키/개인키 쌍을 난수 기반 생성 완료.</p>
                </div>
                <div style={{ padding: '16px', background: regStep >= 2 ? '#e8f5e9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: regStep >= 2 ? 1 : 0.5 }}>
                  <strong style={{ display: 'block', color: regStep >= 2 ? '#2e7d32' : '#1a202c' }}>2. CA(인증기관) 디렉터리 공개키 등록</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#718096' }}>CA 서버 데이터베이스에 사용자 매핑 공개키 파일 등록 처리 성공.</p>
                </div>
                <div style={{ padding: '16px', background: regStep >= 3 ? '#e8f5e9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: regStep >= 3 ? 1 : 0.5 }}>
                  <strong style={{ display: 'block', color: regStep >= 3 ? '#2e7d32' : '#1a202c' }}>3. X.509 디지털 인증서 발급 완료</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#718096' }}>인증기관 서명이 탑재된 인증서 발급 및 로컬 스토리지 안전 보존.</p>
                </div>

                {regStep === 3 && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <button onClick={() => setActiveTab("login")} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
                       다음 단계: 발급된 인증서로 로그인 테스트 가기 ➔
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- */}
      {/*  화면 2: [정은미 담당] 기존 전자서명 로그인 시연 UI 구역 */}
      {/* -------------------------------------------------------- */}
      {activeTab === "login" && (
        <section className="signature-board">
          <section className="signature-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Authentication Flow</p>
                <h2>로그인 검증 과정</h2>
              </div>
              <button className="button primary" onClick={getChallenge}>
                {loading ? "생성 중" : "Challenge 생성"}
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
              </div>
            )}
          </aside>
        </section>
      )}
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
