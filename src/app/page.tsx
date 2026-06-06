import Link from 'next/link';



const modules = [

  {

    title: '전자서명 로그인',

    owner: '정은미',

    description: 'Challenge-Response 방식으로 RSA 전자서명 인증을 수행합니다.',

    href: '/signature-login',

    status: '완료',

    enabled: true,

  },

  {

    title: '메시지 무결성 검증',

    owner: '정은미',

    description:

      'SHA-256 해시와 전자서명 검증으로 메시지 변조 여부를 확인합니다.',

    href: '/integrity-check',

    status: '완료',

    enabled: true,

  },

  {

    title: '사용자 등록 / 인증서 발급',

    owner: '조민정',

    description: '사용자 공개키 등록 및 인증서 발급 기능을 연결할 예정입니다.',

    href: '#',

    status: '예정',

    enabled: false,

  },

  {

    title: '암호화 / 스테가노그래피',

    owner: '유채원',

    description: '이미지에 비밀 메시지를 숨기는 LSB 기반 스테가노그래피 기능을 구현했습니다.',

    href: '#',

    status: '예정',

    enabled: true,

  },

  {

    title: '신원 확인',

    owner: '김정서',

    description:

      '인증서 실시간 폐지 검증(CRL), FIDO 생체 인증, TOTP 다중 인증 흐름을 수행합니다.',

    href: '/identity-check', // 💡 정서 전용 새 주소 연결!

    status: '완료', // 💡 완료 상태로 수정!

    enabled: true, // 💡 열기 활성화!

  },

];



export default function Home() {

  return (

    <main className="site">

      <header className="site-header">

        <div>

          <h1>공개키 기반 보안 프로토콜 시연</h1>

          <p className="lead">

본 시스템은 정보보호학과 팀 프로젝트로, RSA 전자서명, SHA-256 해시 및 차세대 다중 인증(MFA) 메커니즘을 결합하여 웹 환경에서 전체적인 암호학 보안 프로토콜 흐름을 검증하고 시연합니다.

          </p>

        </div>
        
      </header>



      <section className="section">

        <div className="section-head">

          <div>

            <h2>팀 프로젝트 기능 구성</h2>

          </div>

        </div>



        <div className="module-list">

          {modules.map((module) => (

            <article key={module.title} className="module-row">

              <div className="module-main">

                <div className="module-title-line">

                  <h3>{module.title}</h3>

                </div>

                <p>{module.description}</p>

              </div>



              {module.enabled ? (

                <Link className="text-link" href={module.href}>

                  시연하기 ➡️

                </Link>

              ) : (

                <span className="text-link disabled">대기</span>

              )}

            </article>

          ))}

        </div>

      </section>

    </main>

  );

} 
