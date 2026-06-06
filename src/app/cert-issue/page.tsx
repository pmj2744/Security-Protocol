'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import FlowNav from '@/components/FlowNav'

export default function CertIssuePage() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [step, setStep] = useState<number>(0)

  const handleCreateCertificate = (event: React.FormEvent) => {
    event.preventDefault()

    if (!userId.trim()) {
      alert('유저 ID를 입력해주세요!')
      return
    }

    setLoading(true)
    setResult(null)
    setStep(1)

    setTimeout(() => {
      setStep(2)

      setTimeout(() => {
        setStep(3)
        setResult(`[발급 성공] '${userId}' 사용자의 X.509 표준 인증서(user.crt) 생성이 완료되었습니다!`)
        setLoading(false)
      }, 1000)
    }, 1000)
  }

  return (
    <main className="site" style={{ paddingBottom: '80px' }}>
      <FlowNav current="/cert-issue" />

      <header className="page-header">
        <div>
          <p className="eyebrow">X.509 Certificate Authority</p>
          <h1>사용자 등록 및 인증서 발급</h1>
          <p className="lead">
            인증기관(CA) 서버와 통신하여 사용자의 디지털 신원을 확인하고,
            RSA 공개키 구조 기반의 X.509 표준 인증서를 발급받습니다.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          }}
        >
          <form onSubmit={handleCreateCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a202c' }}>
                사용자 ID 입력
              </label>

              <input
                type="text"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="인증서를 발급할 유저 ID를 입력하세요. 예: minjung"
                style={{
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#1a202c',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                backgroundColor: loading ? '#cbd5e1' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                transition: 'background 0.2s',
              }}
            >
              {loading ? '인증 키 쌍 생성 및 CA 발급 요청 중...' : 'X.509 인증서 발급하기 ➔'}
            </button>
          </form>

          {step > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  background: step >= 1 ? '#e8f5e9' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  opacity: step >= 1 ? 1 : 0.5,
                }}
              >
                <strong style={{ display: 'block', color: step >= 1 ? '#2e7d32' : '#1a202c', fontSize: '14px' }}>
                  1. 로컬 RSA 키 쌍 생성 및 CSR 구조화 완료
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: step >= 2 ? '#e8f5e9' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  opacity: step >= 2 ? 1 : 0.5,
                }}
              >
                <strong style={{ display: 'block', color: step >= 2 ? '#2e7d32' : '#1a202c', fontSize: '14px' }}>
                  2. CA 인증기관 디렉터리에 사용자 공개키 등록 성공
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: step >= 3 ? '#e8f5e9' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  opacity: step >= 3 ? 1 : 0.5,
                }}
              >
                <strong style={{ display: 'block', color: step >= 3 ? '#2e7d32' : '#1a202c', fontSize: '14px' }}>
                  3. X.509 인증서 발급 및 사용자 인증 준비 완료
                </strong>
              </div>
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: '#e8f5e9',
                border: '1px solid #10b981',
                borderRadius: '6px',
                color: '#155724',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {result}

              {/* 🎯 [시연 핵심 교정] 발급 완료 후 -> 전자서명 로그인으로 정상 워프하도록 링크 수정 */}
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <Link
                  href="/signature-login"
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  다음 단계: 전자서명 로그인 진행하기 ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
