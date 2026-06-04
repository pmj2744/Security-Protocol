import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/signatureCrypto";

type VerifyLoginRequestBody = {
  challenge?: string;
  signature?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as VerifyLoginRequestBody;

  const { challenge, signature } = body;

  if (!challenge || !signature) {
    return NextResponse.json(
      {
        success: false,
        message: "Challenge 또는 전자서명 값이 없습니다.",
      },
      { status: 400 }
    );
  }

  const verified = verifySignature(challenge, signature);

  if (verified) {
    return NextResponse.json({
      success: true,
      message: "로그인 성공: 전자서명 검증이 완료되었습니다.",
    });
  }

  return NextResponse.json({
    success: false,
    message: "로그인 실패: 전자서명 검증에 실패했습니다.",
  });
}