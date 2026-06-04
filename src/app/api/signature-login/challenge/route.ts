import { NextResponse } from "next/server";
import { createChallenge, createSignature } from "@/lib/signatureCrypto";

export async function GET() {
  const challenge = createChallenge();

  // 시연용: 서버 내부에서 서명값까지 함께 생성
  const signature = createSignature(challenge);

  return NextResponse.json({
    challenge,
    signature,
  });
}