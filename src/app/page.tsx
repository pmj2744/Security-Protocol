import Link from 'next/link'

const modules = [
  {
    title: '전자서명 로그인',
    description: 'Challenge-Response 방식으로 RSA 전자서명 인증을 수행합니다.',
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
    title: '사용자 등록 / 인증서 발급',
    description: '사용자 공개키 등록 및 인증서 발급 기능을 연결할 예정입니다.',
    href: '/cert-issue', 
    status: '완료',          
    enabled: true,          
  },
  {
    title: '암호화 / 스테가노그래피',
    // 채원님이 작성한 상세 설명으로 업데이트 완료
    description: '로그인 이후 메시지를 AES로 암호화하고, 암호문을 이미지 LSB에 은닉하여 안전한 메시지 전달을 시뮬레이션합니다.',
    href: '/steganography', // 채원님이 스테가노그래피 실제 페이지 주소 연결 완료
    status: '완료',
    enabled: true,
  },
  {
    title: '신원 확인',
    description: '인증서 실시간 폐지 검증(CRL), FIDO 생체 인증, TOTP 다중 인증 흐름을 수행합니다.',
    href: '/identity-check',
    enabled: true,
  },
]

export default function Home() {
  return (
    <main className="site" style={{ width: '100%', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 1. 상단 타이틀 및 부제목 구역 */}
      <header className="site-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 20px 30px 20px', width: '100%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.7rem', marginBottom: '40px', wordBreak: 'keep-all', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            보안 프로토콜 시연 시스템
          </h1>
          <p className="lead" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#4a5568', wordBreak: 'keep-all', margin: 0 }}>
            본 시스템은 팀 프로젝트로 구현된 보안 대시보드입니다.
            <br />
            X.509 인증서 발급과 전자서명 로그인부터 AES-256/LSB 암호화 통신 및 TOTP 다중 인증(MFA)까지, 
            <br />
            계획서에 설계된 보안 프로토콜의 전체 흐름을 시연하고 검증합니다.
          </p>
        </div>
      </header>

      {/* [희미한 선 및 배경 제거] 투명하게 정돈된 조원 이름 & PPT 버튼 구역 */}
      <section style={{ maxWidth: '800px', margin: '0 auto 40px auto', padding: '0 20px', width: '100%' }}>
        <div className="team-panel" style={{ padding: '10px 24px', background: 'transparent', borderRadius: 0, border: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          {/* 조원 이름 레이아웃 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '14px', color: '#4a5568', fontWeight: '500', letterSpacing: '0.5px' }}>
            <span>박민지</span>
            <span>조민정</span>
            <span>정은미</span>
            <span>유채원</span>
            <span>김정서</span>
          </div>

          {/* PPT 링크 버튼 */}
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
              transition: 'all 0.2s'
            }}
          >
             결과 보고서 확인하기 ↗
          </a>

        </div>
      </section>

      {/* 2. 하단 기능 카드 리스트 구역 */}
      <section className="section" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', width: '100%' }}>
        <div className="module-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {modules.map((module) => (
            <article key={module.title} className="module-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              <div className="module-main" style={{ flex: 1, textAlign: 'left', paddingRight: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>{module.title}</h3>
                <p style={{ color: '#718096', marginTop: '6px', marginBottom: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{module.description}</p>
              </div>

              <div className="module-action">
                {module.enabled ? (
                  <Link href={module.href} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold', transition: 'background 0.2s' }}>
                    ➔
                  </Link>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#a0aec0', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                    대기
                  </span>
                )}
              </div>

            </article>
          ))}
        </div>
      </section>

    </main>
  )
}
