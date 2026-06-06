'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function CertIssuePage() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      alert('유저 ID를 입력해주세요!')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/integrity-check/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })
      if (response.ok) {
        setResult(
          `🎉 [발급 성공] '${userId}' 사용자의 X.509 공개키 인증서(user.crt) 생성이 완료되었습니다!`
        )
      } else {
        setResult(
          '❌ 인증서 발급 중 오류가 발생했습니다. 백엔드 상태를 확인하세요.'
        )
      }
    } catch (error) {
      console.error(error)
      setResult('❌ 서버와 통신 중 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="site" style={{ paddingBottom: '80px' }}>
      <nav className="subnav">
        <Link href="/">← 프로젝트 홈</Link>
        <Link href="/signature-login">전자서명 로그인 ➔</Link>
      </nav>

      <header className="page-header">
        <div>
          <p className="eyebrow">X.509 Certificate Authority</p>
          <h1>사용자 등록 및 인증서 발급</h1>
          <p className="lead">
            인증기관(CA) 서버와 통신하여 사용자의 디지털 신원을 확인하고, RSA 공개키 구조 기반의 X.509 표준 인증서를 발급받습니다.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleCreateCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a202c' }}>
                사용자 ID 입력
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="인증서를 발급할 유저 ID를 입력하세요 (예: minjung)"
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
              {loading ? '인증서 생성 중...' : 'X.509 인증서 발급하기 ➔'}
            </button>
          </form>

          {result && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: result.includes('성공') ? '#e8f5e9' : '#fde8e8',
                border: result.includes('성공') ? '1px solid #10b981' : '1px solid #f85149',
                borderRadius: '6px',
                color: result.includes('성공') ? '#155724' : '#721c24',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {result}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
