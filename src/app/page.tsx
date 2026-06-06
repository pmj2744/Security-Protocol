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

          <p className="eyebrow">Security Protocol Project</p>

          <h1>공개키 기반 보안 프로토콜 시연</h1>

          <p className="lead">

            RSA 전자서명과 SHA-256 해시를 활용해 인증과 무결성 검증 과정을 웹

            환경에서 확인하는 팀 프로젝트입니다.

          </p>

        </div>



        <div className="header-panel">

          <span>Current Module</span>

          <strong>Digital Signature / MFA</strong>

          <p>전자서명 로그인 및 신원 확인(MFA) 구현 완료</p>

        </div>

      </header>



      <section className="section">

        <div className="section-head">

          <div>

            <p className="eyebrow">Modules</p>

            <h2>팀 프로젝트 기능 구성</h2>

          </div>

          <p>

            각 팀원 기능은 독립 페이지로 연결되며, 현재는 전자서명 관련 기능과

            정서님의 신원 확인 기능을 구현 완료했습니다.

          </p>

        </div>



        <div className="module-list">

          {modules.map((module) => (

            <article key={module.title} className="module-row">

              <div className="module-main">

                <div className="module-title-line">

                  <h3>{module.title}</h3>

                  <span className={module.enabled ? 'tag done' : 'tag muted'}>

                    {module.status}

                  </span>

                </div>

                <p>{module.description}</p>

              </div>



              <div className="module-meta">

                <span>담당</span>

                <strong>{module.owner}</strong>

              </div>



              {module.enabled ? (

                <Link className="text-link" href={module.href}>

                  열기

                </Link>

              ) : (

                <span className="text-link disabled">대기</span>

              )}

            </article>

          ))}

        </div>

      </section>



      <section className="section split">

        <div>

          <p className="eyebrow">Implemented Flow</p>

          <h2>정은미 파트 구현 흐름</h2>

        </div>



        <div className="flow-stack">

          <div className="flow-line">

            <span>01</span>

            <p>서버가 랜덤 Challenge를 생성합니다.</p>

          </div>

          <div className="flow-line">

            <span>02</span>

            <p>Challenge 또는 메시지 해시값에 RSA 개인키로 서명합니다.</p>

          </div>

          <div className="flow-line">

            <span>03</span>

            <p>서버는 공개키로 전자서명을 검증합니다.</p>

          </div>

          <div className="flow-line">

            <span>04</span>

            <p>원본 메시지와 변조 메시지의 검증 결과를 비교합니다.</p>

          </div>

        </div>

      </section>

    </main>

  );

} 
