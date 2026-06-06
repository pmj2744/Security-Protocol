// Next.js 환경에서 동작하는 신원 확인 및 MFA 암호 로직

// 1. 가상 CRL (인증서 폐지 목록) 블랙리스트
const VIRTUAL_CRL_LIST = ['10002', '10005', '99999'];

/**
 * 인증서 실시간 상태 검증 (CRL 검증)
 * @param serialNumber 인증서 시리얼 번호
 */
export function checkCertificateRevocation(serialNumber: string): boolean {
  if (VIRTUAL_CRL_LIST.includes(serialNumber)) {
    console.warn(
      `[보안 경고] 폐지된 인증서 접속 시도 감지! Serial: ${serialNumber}`,
    );
    return false;
  }
  console.log(`[검증 통과] 유효한 인증서입니다. Serial: ${serialNumber}`);
  return true;
}

/**
 * FIDO 기반 생체 인증 시뮬레이션
 * @param username 사용자 ID
 * @param biometricSuccess 프론트에서 넘어온 생체인증 성공 여부
 */
export function simulateFidoAuth(
  username: string,
  biometricSuccess: boolean,
): boolean {
  if (!biometricSuccess) {
    console.error(`[FIDO 인증 실패] ${username}의 생체 정보 불일치.`);
    return false;
  }
  console.log(
    `[FIDO 인증 성공] ${username} 생체 인증 완료 -> 기기 내 개인키 활성화.`,
  );
  return true;
}

/**
 * TOTP 일회용 비밀번호 검증 (구글 OTP 번호 검증 시뮬레이션)
 * 원래는 OTP 라이브러리를 쓰지만, 팀원들과 가볍게 시연하기 위한 고정 검증 로직 구현
 * @param userOtpInput 사용자가 입력한 6자리 번호
 */
export function verifyTotpToken(userOtpInput: string): boolean {
  // 테스트용 고정 OTP 번호 혹은 간단한 규칙성 검증 (시연용)
  const masterOtp = '678123'; // 스크린샷 2026-04-26 213844.png 피피티에 있던 번호 예시
  return userOtpInput === masterOtp;
}
