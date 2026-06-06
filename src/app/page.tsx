import Link from 'next/link';

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
    href: '#',
    enabled: false,
  },
  {
    title: '암호화 / 스테가노그래피',
    description: '이미지에 비밀 메시지를 숨기는 LSB 기반 스테가노그래피 기능을 구현했습니다.',
    href: '#',
    enabled: true,
  },
  {
    title: '신원 확인',
    description: '인증서 실시간 폐지 검증(CRL), FIDO 생체 인증, TOTP 다중 인증 흐름을 수행합니다.',
    href: '/identity-check',
    enabled: true,
  },
];

export default function Home() {
  return (
    <main className="site" style={{ width: '100%', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 1. 상단 타이틀 및 부제목 구역 */}
      <header className="site-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 20px 40px 20px', width: '100%' }}>
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

      {/* 👥 중앙 밸런스를 잡아주는 팀 프로젝트 참여 조원 정보 박스 */}
      <section style={{ maxWidth: '800px', margin: '20px auto 40px auto', padding: '0 20px', width: '100%' }}>
        <div className="team-panel" style={{ padding: '24px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6c757d', letterSpacing: '1px', fontWeight: 'bold' }}>TEAM MEMBERS & ROLES</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#2d3748' }}>
            <div><strong>박민지</strong> 
            <div><strong>조민정</strong> 
            <div><strong>정은미</strong> 
            <div><strong>유채원</strong> 
            <div><strong>김정서</strong>
          </div>
        </div>
      </section>

      {/* 2. 하단 기능 카드 리스트 구역 */}
      <section className="section" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', width: '100%' }}>
        <div className="module-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {modules.map((module) => (
            <article key={module.title} className="module-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* 기능 소개 텍스트는 왼쪽 정렬 */}
              <div className="module-main" style={{ flex: 1, textAlign: 'left', paddingRight: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>{module.title}</h3>
                <p style={{ color: '#718096', marginTop: '6px', marginBottom: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{module.description}</p>
              </div>

              {/* 화살표 버튼/대기 마크는 카드 오른쪽 끝 정렬 */}
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
  );
}
