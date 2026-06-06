'use client'

import React, { useState } from 'react'

export default function SteganographyPage() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      alert('유저 아이디를 입력해주세요!')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // 조장이 구축해둔 백엔드 인증서 발급 API로 요청을 보냅니다.
      const response = await fetch('/api/integrity-check/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setResult(
          `🎉 [성공] '${userId}' 사용자의 X.509 인증서(user.crt) 발급이 완료되었습니다!`,
        )
      } else {
        setResult(
          '❌ 인증서 발급 중 오류가 발생했습니다. 백엔드 상태를 확인하세요.',
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
    <div
      style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        🛡️ 1단계: X.509 인증서 발급 및 로그인
      </h1>
      <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '14px' }}>
        담당자: 조민정 (인증서 및 로그인 담당)
      </p>

      <div
        style={{
          background: '#1e1e1e',
          padding: '25px',
          borderRadius: '8px',
          border: '1px solid #333',
        }}
      >
        <form
          onSubmit={handleCreateCertificate}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>
              사용자 ID 입력
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="인증서를 발급할 유저 ID를 입력하세요 (예: minjung)"
              style={{
                padding: '12px',
                border: '1px solid #444',
                borderRadius: '6px',
                background: '#2a2a2a',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              backgroundColor: loading ? '#555' : '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '15px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '인증서 생성 중...' : 'X.509 인증서 발급하기'}
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              background: result.includes('성공') ? '#132d15' : '#3a1a1a',
              border: result.includes('성공')
                ? '1px solid #238636'
                : '1px solid #f85149',
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
