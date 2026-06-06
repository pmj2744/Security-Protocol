'use client';

import Link from 'next/link';
import { useState } from 'react';

// 정서 파트 시뮬레이션 결과 타입 정의
type MfaResult = {
  success: boolean;
  certStatus: string;
  fidoStatus: string;
  totpStatus: string;
  message: string;
};

export default function IdentityCheckPage() {
  // 입력값 상태 관리
  const [certSerial, setCertSerial] = useState('12345');
  const [biometricSuccess, setBiometricSuccess] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [result, setResult] = useState<MfaResult | null>(null);

  // 가상 인증서 폐지 리스트 (블랙리스트)
  const VIRTUAL_CRL_LIST = ['10002', '10005', '99999'];

  const verifyIdentity = () => {
    // 1) X.509 인증서 유효성 및 폐지 검증 (CRL 체크)
    const isCertRevoked = VIRTUAL_CRL_LIST.includes(certSerial);
    const certStatus = isCertRevoked ? '실패 (폐지됨)' : '통과';

    // 2) FIDO 생체 인증 시뮬레이션
    const fidoStatus = biometricSuccess ? '통과' : '실패 (잠금)';

    // 3) TOTP 2차 다중 보안 인증 번호 확인
    const isOtpCorrect = otpCode === '678123';
    const totpStatus = isOtpCorrect ? '통과' : '실패 (불일치)';

    // 종합 판단
    const isSuccess = !isCertRevoked && biometricSuccess && isOtpCorrect;

    let message = '';
    if (isCertRevoked) {
      message = `❌ [CRL 검증 거부] 분실 혹은 만료되어 블랙리스트에 등록된 인증서 일련번호(${certSerial})입니다.`;
    } else if (!biometricSuccess) {
      message =
        '❌ [FIDO 인증 실패] 기기 단말 내 생체 정보가 불일치하여 보안 영역의 개인키 접근이 거부되었습니다.';
    } else if (!isOtpCorrect) {
      message =
        '❌ [MFA 인증 실패] 시간 동기화된 TOTP 6자리 보안코드가 일치하지 않습니다. (정답 힌트: 678123)';
    } else {
      message =
        '✅ [신원 확인 최종 승인] 인증서 유효성 검증, 생체 인식 서명 활성화, 2차 TOTP 일치를 모두 만족하여 최종 다중 인증에 성공했습니다.';
    }

    setResult({
      success: isSuccess,
      certStatus,
      fidoStatus,
      totpStatus,
      message,
    });
  };

  return (
    <main className="site">
      {/* 1. 상단 내비게이션 바 (전자서명 로그인 링크 삭제 완료) */}
      <nav className="subnav">
        <Link href="/">← 프로젝트 홈</Link>
      </nav>

      {/* 2. 페이지 헤더 구역 */}
      <header className="page-header">
        <div>
          <p className="eyebrow">Identity & MFA</p>
          <h1>신원 확인 및 다중 인증 흐름</h1>
          <p className="lead">
            인증의 신뢰성을 확보하기 위해 X.509 실시간 인증서 폐지 검증(CRL),
            기기 보안 영역 기반 FIDO 생체 인증, TOTP 2차 보안 단계를 독립
            시뮬레이션합니다.
          </p>
        </div>
      </header>

      {/* 3. 팀원과 동일한 2단 레이아웃 구조 */}
      <section className="protocol-layout">
        {/* 좌측 사이드바: 검증 로직 요약 설명 구역 */}
        <aside className="protocol-summary">
          <h2>Verification Logic</h2>

          <div className="flow-mini">
            <div>X.509 Certificate</div>
            <span>실시간 CRL 조회</span>
            <div>FIDO Bio-Auth</div>
            <span>TEE 개인키 활성화</span>
            <div>TOTP 2FA</div>
            <span>해시 기반 시간 동기화</span>
            <div>Identity Verified</div>
            <span>최종 신원 확인</span>
          </div>

          <div className="notice">
            다중 인증(MFA)의 3요소인 지식, 소유, 존재 가치가 모두 부합해야만
            최종 신원이 입증되어 세션 권한이 부여됩니다.
          </div>
        </aside>

        {/* 우측 메인 구역: 테스트 콘솔 및 타임라인 결과창 */}
        <section className="protocol-main">
          <div className="tool-card-head">
            <div>
              <p className="eyebrow">Multi-Factor Authentication Test</p>
              <h2>보안 시나리오 독립 테스트 변수 설정</h2>
            </div>
          </div>

          {/* 복합 입력창 폼 컨트롤 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            {/* 1) 인증서 시리얼 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left',
              }}
            >
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                1) X.509 인증서 일련번호 (CRL)
              </label>
              <input
                type="text"
                value={certSerial}
                onChange={(e) => setCertSerial(e.target.value)}
                placeholder="인증서 시리얼 넘버 입력 (차단 테스트: 10002, 10005)"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 2) FIDO 생체 토글 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left',
              }}
            >
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                2) FIDO 단말 생체 인식 상태
              </label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    checked={biometricSuccess === true}
                    onChange={() => setBiometricSuccess(true)}
                  />
                  🟢 생체 인식 성공 (단말 개인키 오픈)
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    checked={biometricSuccess === false}
                    onChange={() => setBiometricSuccess(false)}
                  />
                  🔴 생체 인식 실패 (단말 키 잠금)
                </label>
              </div>
            </div>

            {/* 3) TOTP 입력 및 검증 버튼 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left',
              }}
            >
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                3) 2차 TOTP 보안 코드 (6자리)
              </label>
              <div className="input-line">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="구글 OTP 앱 내 일회용 비밀번호 6자리 입력 (정답: 678123)"
                />
                <button className="button primary" onClick={verifyIdentity}>
                  검증 실행
                </button>
              </div>
            </div>
          </div>

          {/* 결과가 없을 때 가이드 문구 */}
          {!result && (
            <div className="empty-timeline">
              상위 다중 보안 프로토콜 변수를 구성하고 [검증 실행]을 누르면 각
              단계별 CRL 대조, TEE 인터페이스 호출, TOTP 해시 유효성 판정
              타임라인이 시각화됩니다.
            </div>
          )}

          {/* 결과가 있을 때 출력되는 타임라인 단계별 리포트 */}
          {result && (
            <>
              <section className="protocol-timeline visible">
                {/* 01 단계: CRL 실시간 폐지 조회 */}
                <article
                  className={`timeline-item ${result.certStatus.includes('실패') ? 'danger' : ''}`}
                >
                  <div className="timeline-index">01</div>
                  <div className="timeline-content">
                    <h3>인증서 폐지 여부 검증 (CRL Lookup)</h3>
                    <p>
                      중앙 인증서 폐지 리스트(CRL) 데이터베이스를 실시간
                      쿼리하여 유효성 여부를 대조합니다.
                    </p>
                    <div className="check-row">
                      <span>X.509 검증 상태</span>
                      <strong
                        className={
                          result.certStatus === '통과' ? 'ok-text' : 'fail-text'
                        }
                      >
                        {result.certStatus}
                      </strong>
                    </div>
                  </div>
                </article>

                {/* 02 단계: FIDO 생체 서명 */}
                <article
                  className={`timeline-item ${result.fidoStatus.includes('실패') ? 'danger' : ''}`}
                >
                  <div className="timeline-index">02</div>
                  <div className="timeline-content">
                    <h3>FIDO 생체 인증 및 로컬 개인키 활성화</h3>
                    <p>
                      기기 내 Secure Element에서 처리된 지문/FaceID 신호를
                      탐지하여 전자서명용 내부 프라이빗 키 사용 권한을
                      바인딩합니다.
                    </p>
                    <div className="check-row">
                      <span>FIDO 하드웨어 보안 영역</span>
                      <strong
                        className={
                          result.fidoStatus === '통과' ? 'ok-text' : 'fail-text'
                        }
                      >
                        {result.fidoStatus}
                      </strong>
                    </div>
                  </div>
                </article>

                {/* 03 단계: TOTP 6자리 매칭 */}
                <article
                  className={`timeline-item ${result.totpStatus.includes('실패') ? 'danger' : ''}`}
                >
                  <div className="timeline-index">03</div>
                  <div className="timeline-content">
                    <h3>시간 동기화 일회용 OTP 매칭 검증</h3>
                    <p>
                      HMAC-SHA1 함수로 연산된 서버 측 값과 유저가 단말 창을
                      확인해 입력한 2차 다중인증 번호를 수학적으로 비교합니다.
                    </p>
                    <div className="check-row">
                      <span>TOTP 6자리 알고리즘</span>
                      <strong
                        className={
                          result.totpStatus === '통과' ? 'ok-text' : 'fail-text'
                        }
                      >
                        {result.totpStatus}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              {/* 종합 결과 카드 피드백 하단 밴드 */}
              <section className="final-compare">
                <article
                  className={`compare-card ${result.success ? 'ok' : 'warn'}`}
                >
                  <span>Multi-Factor Authentication Status</span>
                  <h3>
                    {result.success
                      ? '종합 신원 증명 완료'
                      : 'MFA 보안 시스템 차단'}
                  </h3>
                  <p>{result.message}</p>
                </article>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
