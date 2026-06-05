import { NextResponse } from 'next/server';
import {
  checkCertificateRevocation,
  simulateFidoAuth,
  verifyTotpToken,
} from '@/lib/mfaCrypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, certSerial, biometricSuccess, otpCode } = body;

    // 1. 인증서 유효성 및 폐지 검증 (CRL)
    const isCertValid = checkCertificateRevocation(certSerial || '12345');
    if (!isCertValid) {
      return NextResponse.json(
        { success: false, message: '폐지된 인증서입니다.' },
        { status: 401 },
      );
    }

    // 2. FIDO 생체 인증 검증
    const isFidoValid = simulateFidoAuth(
      username || 'test_user',
      biometricSuccess !== false,
    );
    if (!isFidoValid) {
      return NextResponse.json(
        { success: false, message: 'FIDO 생체 인증에 실패했습니다.' },
        { status: 401 },
      );
    }

    // 3. 2차 다중 인증 (TOTP) 검증
    const isOtpValid = verifyTotpToken(otpCode);
    if (!isOtpValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'OTP 번호가 일치하지 않습니다. (정답: 678123)',
        },
        { status: 401 },
      );
    }

    // 모든 MFA 통과 시
    return NextResponse.json({
      success: true,
      message: '모든 다중 인증(MFA) 통과! 신원 확인 최종 승인 완료.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류 발생' },
      { status: 500 },
    );
  }
}
