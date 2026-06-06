'use client'

import { useState } from 'react'
import Link from 'next/link'

type IntegrityPacket = {
  message: string
  hash: string
  signature: string
}

type IntegrityResult = {
  recalculatedHash: string
  hashMatch: boolean
  signatureValid: boolean
  integrityValid: boolean
}

type IntegrityApiResponse = {
  success: boolean
  packet: IntegrityPacket
  normalResult: IntegrityResult
  tamperedMessage: string
  tamperedResult: IntegrityResult
}

export default function IntegrityCheckPage() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<IntegrityApiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const showResult = Boolean(result?.success)
  const hashValue = result?.packet.hash ?? ''
  const signatureValue = result?.packet.signature ?? ''

  const verifyIntegrity = async () => {
    if (!message.trim()) {
      alert('메시지를 입력하세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/integrity-check/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('무결성 검증 API 요청에 실패했습니다.')
      }

      const data = (await response.json()) as IntegrityApiResponse
      setResult(data)
    } catch {
      alert('무결성 검증 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="site">

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

            <button
              className="button primary"
              onClick={verifyIntegrity}
              disabled={loading}
            >
              {loading ? '검증 중...' : '검증 실행'}
            </button>
          </div>

          {!result && (
            <div className="empty-timeline">
              메시지를 입력하고 검증을 실행하면 해시 생성, 전자서명,
              원본 검증, 변조 검증 과정이 순서대로 표시됩니다.
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
                    <div className="code-box compact">
                      {result.packet.message}
                    </div>
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
                    <div className="code-box compact">
                      {result.packet.hash}
                    </div>
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
                      <strong
                        className={
                          result.normalResult.hashMatch
                            ? 'ok-text'
                            : 'fail-text'
                        }
                      >
                        {result.normalResult.hashMatch ? '통과' : '실패'}
                      </strong>
                    </div>

                    <div className="check-row">
                      <span>전자서명 검증</span>
                      <strong
                        className={
                          result.normalResult.signatureValid
                            ? 'ok-text'
                            : 'fail-text'
                        }
                      >
                        {result.normalResult.signatureValid ? '통과' : '실패'}
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
                      <strong
                        className={
                          result.tamperedResult.hashMatch
                            ? 'ok-text'
                            : 'fail-text'
                        }
                      >
                        {result.tamperedResult.hashMatch ? '통과' : '실패'}
                      </strong>
                    </div>

                    <div className="check-row">
                      <span>최종 무결성</span>
                      <strong
                        className={
                          result.tamperedResult.integrityValid
                            ? 'ok-text'
                            : 'fail-text'
                        }
                      >
                        {result.tamperedResult.integrityValid
                          ? '검증 성공'
                          : '변조 탐지'}
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

              {/* 검증 성공 시 로그 및 파란색 워프 링크 버튼 활성화 레이아웃 */}
              {showResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <strong>[1] 생성된 해시 (M):</strong>{' '}
                      <code
                        style={{
                          background: '#e2e8f0',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {hashValue}
                      </code>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>[2] 메시지 전자서명 (S):</strong>{' '}
                      <code
                        style={{
                          background: '#e2e8f0',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {signatureValue}
                      </code>
                    </div>

                    <div
                      style={{
                        marginTop: '14px',
                        padding: '10px',
                        backgroundColor: '#e8f5e9',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        color: '#155724',
                        fontWeight: '500',
                      }}
                    >
                      🎉 [무결성 검증 완벽] 전송 과정 중 단 1비트의 무단 조작이나
                      데이터 누락도 발생하지 않은 클린 상태임이 수학적으로
                      검증되었습니다!
                    </div>
                  </div>

                  {/* [시연 전용 핵심 스위치] 다음 단계 암호화로 워프하는 파란색 하이라이트 버튼 */}
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <Link
                      href="/steganography"
                      style={{
                        display: 'inline-block',
                        padding: '10px 24px',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      다음 단계: 메시지 암호화 및 은닉 시연하기 ➔
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  )
}