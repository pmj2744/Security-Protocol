import { NextResponse } from "next/server";
import { createChallenge, createSignature } from "@/lib/signatureCrypto";

export const runtime = "nodejs";

export async function GET() {
  const challenge = createChallenge();
  const signature = createSignature(challenge);

  return NextResponse.json({
    challenge,
    signature,
    signatureLength: Buffer.byteLength(signature, "base64"),
  });
}