import Link from 'next/link'

type FlowStep = {
  href: string
  label: string
  shortLabel: string
}

const flowSteps: FlowStep[] = [
  {
    href: '/cert-issue',
    label: '사용자 등록 / 인증서 발급',
    shortLabel: '인증서 발급',
  },
  {
    href: '/identity-check',
    label: '신원 확인 / MFA',
    shortLabel: '신원 확인',
  },
  {
    href: '/signature-login',
    label: '전자서명 로그인',
    shortLabel: '전자서명 로그인',
  },
  {
    href: '/integrity-check',
    label: '메시지 무결성 검증',
    shortLabel: '무결성 검증',
  },
  {
    href: '/steganography',
    label: '암호화 / 스테가노그래피',
    shortLabel: '스테가노그래피',
  },
]

type FlowNavProps = {
  current: string
}

export default function FlowNav({ current }: FlowNavProps) {
  const currentIndex = flowSteps.findIndex((step) => step.href === current)

  const previousStep = currentIndex > 0 ? flowSteps[currentIndex - 1] : null

  const currentStep = currentIndex >= 0 ? flowSteps[currentIndex] : null

  const nextStep =
    currentIndex >= 0 && currentIndex < flowSteps.length - 1
      ? flowSteps[currentIndex + 1]
      : null

  return (
    <nav className="subnav flow-nav">
      <Link href="/">← 프로젝트 홈</Link>

      <div className="flow-nav-center">
        {currentStep && (
          <>
            <span className="flow-nav-step">
              {String(currentIndex + 1).padStart(2, '0')} / {flowSteps.length}
            </span>
            <span className="flow-nav-title">{currentStep.shortLabel}</span>
          </>
        )}
      </div>

      <div className="flow-nav-right">
        {previousStep && (
          <Link href={previousStep.href}>← 이전: {previousStep.shortLabel}</Link>
        )}

        {nextStep ? (
          <Link href={nextStep.href}>다음: {nextStep.shortLabel} →</Link>
        ) : (
          <Link href="/">처음으로 돌아가기 →</Link>
        )}
      </div>
    </nav>
  )
}