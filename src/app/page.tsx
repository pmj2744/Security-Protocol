import Link from 'next/link'

const modules = [
  {
    title: '사용자 등록 / 인증서 발급',
    description: '사용자 등록과 공개키 생성을 수행하고, X.509 인증서를 발급합니다.',
    href: '/cert-issue',
    status: '완료',
    enabled: true,
  },
  {
    title: '신원 확인 / MFA',
    description: '승인 토큰, TOTP 시드 공유, FIDO 생체 인증, OCSP/CRL 상태 검증을 수행합니다.',
    href: '/identity-check',
    enabled: true,
  },
  {
    title: '전자서명 로그인',
    description: 'Challenge-Response 방식으로 개인키 서명과 공개키 검증을 수행합니다.',
    href: '/signature-login',
    enabled: true,
  },
  {
    title: '메시지 무결성 검증',
    description: 'SHA-256 해시와 전자서명 검증으로 메시지 변조 여부를 확인합니다.',
    href: '/integrity-check',
    enabled: true,
  },
  {
    title: '암호화 / 스테가노그래피',
    description: '인증 완료 후 메시지를 AES로 암호화하고, 암호문을 이미지 LSB에 은닉합니다.',
    href: '/steganography',
    status: '완료',
    enabled: true,
  },
]

export default function Home() {
  return (
    <main className="site" style={{ width: '100%', minHeight: '100vh', paddingBottom: '80px' }}>
      <header
        className="site-header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '80px 20px 30px 20px',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '2.7rem',
              marginBottom: '40px',
              wordBreak: 'keep-all',
              fontWeight: 'bold',
              letterSpacing: '-0.5px',
            }}
          >
            보안 프로토콜 시연 시스템
          </h1>

          <p
            className="lead"
            style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#4a5568',
              wordBreak: 'keep-all',
              margin: 0,
            }}
          >
            본 시스템은 팀 프로젝트로 구현된 보안 대시보드입니다.
            <br />
            X.509 인증서 발급, 신원 확인, 전자서명 로그인, 무결성 검증,
            <br />
            AES-256/LSB 암호화 통신까지 계획서에 설계된 보안 프로토콜의 전체 흐름을 시연하고 검증합니다.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: '800px', margin: '0 auto 40px auto', padding: '0 20px', width: '100%' }}>
        <div
          className="team-panel"
          style={{
            padding: '10px 24px',
            background: 'transparent',
            borderRadius: 0,
            border: 'none',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: '#4a5568',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            <span>박민지</span>
            <span>조민정</span>
            <span>정은미</span>
            <span>유채원</span>
            <span>김정서</span>
          </div>

          <a
            href="https://www.miricanvas.com/v2/ko/design2/5230c798-317a-4d8e-8fc0-6180a29f11cd"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#fff',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s',
            }}
          >
            결과 보고서 확인하기 ↗
          </a>
        </div>
      </section>

      <section className="section" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', width: '100%' }}>
        <div className="module-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map((module) => (
            <article
              key={module.title}
              className="module-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '24px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div className="module-main" style={{ flex: 1, textAlign: 'left', paddingRight: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>
                  {module.title}
                </h3>
                <p
                  style={{
                    color: '#718096',
                    marginTop: '6px',
                    marginBottom: 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                  }}
                >
                  {module.description}
                </p>
              </div>

              <div className="module-action">
                <Link
                  href={module.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    transition: 'background 0.2s',
                  }}
                >
                  ➔
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}