'use client'

import { useState } from 'react'
import FlowNav from '@/components/FlowNav'

type MfaResult = {
  success: boolean
  certStatus: string
  fidoStatus: string
  totpStatus: string
  message: string
}

export default function IdentityCheckPage() {
  const [certSerial, setCertSerial] = useState('12345')
  const [biometricSuccess, setBiometricSuccess] = useState(true)
  const [otpCode, setOtpCode] = useState('')
  const [result, setResult] = useState<MfaResult | null>(null)

  const VIRTUAL_CRL_LIST = ['10002', '10005', '99999']

  const verifyIdentity = () => {
    const isCertRevoked = VIRTUAL_CRL_LIST.includes(certSerial)
    const certStatus = isCertRevoked ? '실패 (폐지됨)' : '통과'

    const fidoStatus = biometricSuccess ? '통과' : '실패 (잠금)'

    const isOtpCorrect = otpCode === '678123'
    const totpStatus = isOtpCorrect ? '통과' : '실패 (불일치)'

    const isSuccess = !isCertRevoked && biometricSuccess && isOtpCorrect

    let message = ''

    if (isCertRevoked) {
      message = `❌ [CRL 검증 거부] 분실 혹은 만료되어 블랙리스트에 등록된 인증서 일련번호(${certSerial})입니다.`
    } else if (!biometricSuccess) {
      message = '❌ [FIDO 인증 실패] 기기 단말 내 생체 정보가 불일치하여 보안 영역의 개인키 접근이 거부되었습니다.'
    } else if (!isOtpCorrect) {
      message = '❌ [MFA 인증 실패] 시간 동기화된 TOTP 6자리 보안코드가 일치하지 않습니다. 정답 힌트: 678123'
    } else {
      message = '✅ [신원 확인 최종 승인] 인증서 유효성 검증, 생체 인식 서명 활성화, 2차 TOTP 일치를 모두 만족하여 최종 다중 인증에 성공했습니다.'
    }

    setResult({
      success: isSuccess,
      certStatus,
      fidoStatus,
      totpStatus,
      message,
    })
  }

  return (
    <main className="site">
      <FlowNav current="/identity-check" />

      <header className="page-header">
        <div>
          <p className="eyebrow">Identity & MFA</p>
          <h1>신원 확인 및 다중 인증 흐름</h1>
          <p className="lead">
            사용자 등록 이후 승인 토큰, TOTP 시드 공유, FIDO 생체 인증,
            인증서 폐지 검증을 통해 최종 접근 허용 여부를 판단합니다.
          </p>
        </div>
      </header>

      <section className="protocol-layout">
        <aside className="protocol-summary">
          <h2>Verification Logic</h2>

          <div className="flow-mini">
            <div>X.509 Certificate</div>
            <span>실시간 CRL 조회</span>
            <div>FIDO Bio-Auth</div>
            <span>TEE 개인키 활성화</span>
            <div>TOTP 2FA</div>
            <span>시간 동기화 OTP 검증</span>
            <div>Identity Verified</div>
            <span>최종 신원 확인</span>
          </div>

          <div className="notice">
            다중 인증(MFA)은 소유 요소인 인증서, 존재 요소인 생체 인증,
            지식/시간 기반 요소인 OTP를 결합하여 접근 제어를 강화합니다.
          </div>
        </aside>

        <section className="protocol-main">
          <div className="tool-card-head">
            <div>
              <p className="eyebrow">Multi-Factor Authentication Test</p>
              <h2>보안 시나리오 테스트 변수 설정</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                1. X.509 인증서 일련번호
              </label>

              <input
                type="text"
                value={certSerial}
                onChange={(event) => setCertSerial(event.target.value)}
                placeholder="차단 테스트: 10002, 10005, 99999"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                2. FIDO 단말 생체 인식 상태
              </label>

              <div style={{ display: 'flex', gap: '20px', marginTop: '4px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={biometricSuccess === true}
                    onChange={() => setBiometricSuccess(true)}
                  />
                  🟢 생체 인식 성공
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={biometricSuccess === false}
                    onChange={() => setBiometricSuccess(false)}
                  />
                  🔴 생체 인식 실패
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                3. 2차 TOTP 보안 코드
              </label>

              <div className="input-line">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="정답: 678123"
                />

                <button className="button primary" onClick={verifyIdentity}>
                  검증 실행
                </button>
              </div>
            </div>
          </div>

          {!result && (
            <div className="empty-timeline">
              인증서 번호, 생체 인증 상태, OTP 값을 입력하고 검증 실행을 누르면
              CRL 대조, FIDO 인증, TOTP 검증 결과가 표시됩니다.
            </div>
          )}

          {result && (
            <>
              <section className="protocol-timeline visible">
                <article className={`timeline-item ${result.certStatus.includes('실패') ? 'danger' : ''}`}>
                  <div className="timeline-index">01</div>
                  <div className="timeline-content">
                    <h3>인증서 폐지 여부 검증</h3>
                    <p>중앙 인증서 폐지 리스트(CRL)에서 인증서 일련번호를 대조합니다.</p>

                    <div className="check-row">
                      <span>X.509 검증 상태</span>
                      <strong className={result.certStatus === '통과' ? 'ok-text' : 'fail-text'}>
                        {result.certStatus}
                      </strong>
                    </div>
                  </div>
                </article>

                <article className={`timeline-item ${result.fidoStatus.includes('실패') ? 'danger' : ''}`}>
                  <div className="timeline-index">02</div>
                  <div className="timeline-content">
                    <h3>FIDO 생체 인증 및 개인키 활성화</h3>
                    <p>단말 보안 영역의 생체 인증 상태를 확인하고 개인키 사용 권한을 판단합니다.</p>

                    <div className="check-row">
                      <span>FIDO 인증 상태</span>
                      <strong className={result.fidoStatus === '통과' ? 'ok-text' : 'fail-text'}>
                        {result.fidoStatus}
                      </strong>
                    </div>
                  </div>
                </article>

                <article className={`timeline-item ${result.totpStatus.includes('실패') ? 'danger' : ''}`}>
                  <div className="timeline-index">03</div>
                  <div className="timeline-content">
                    <h3>TOTP 6자리 코드 검증</h3>
                    <p>사용자가 입력한 시간 기반 OTP 값을 서버 기준 값과 비교합니다.</p>

                    <div className="check-row">
                      <span>TOTP 검증 상태</span>
                      <strong className={result.totpStatus === '통과' ? 'ok-text' : 'fail-text'}>
                        {result.totpStatus}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="final-compare">
                <article className={`compare-card ${result.success ? 'ok' : 'warn'}`}>
                  <span>Multi-Factor Authentication Status</span>
                  <h3>{result.success ? '종합 신원 증명 완료' : 'MFA 보안 시스템 차단'}</h3>
                  <p>{result.message}</p>
                </article>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  )
}