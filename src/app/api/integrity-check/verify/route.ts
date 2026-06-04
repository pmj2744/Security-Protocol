import { NextRequest, NextResponse } from "next/server";
import {
  createIntegrityPacket,
  verifyIntegrityPacket,
} from "@/lib/integrityCrypto";

type IntegrityVerifyRequestBody = {
  message?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as IntegrityVerifyRequestBody;

  const { message } = body;

  if (!message) {
    return NextResponse.json(
      {
        success: false,
        error: "메시지를 입력해야 합니다.",
      },
      { status: 400 }
    );
  }

  const packet = createIntegrityPacket(message);

  const normalResult = verifyIntegrityPacket(
    packet.message,
    packet.hash,
    packet.signature
  );

  const tamperedMessage = `${packet.message} 변조됨`;

  const tamperedResult = verifyIntegrityPacket(
    tamperedMessage,
    packet.hash,
    packet.signature
  );

  return NextResponse.json({
    success: true,
    packet,
    normalResult,
    tamperedMessage,
    tamperedResult,
  });
}