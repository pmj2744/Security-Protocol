import crypto from "crypto";
import { createSignature, verifySignature } from "@/lib/signatureCrypto";

export type IntegrityPacket = {
  message: string;
  hash: string;
  signature: string;
};

export type IntegrityResult = {
  recalculatedHash: string;
  hashMatch: boolean;
  signatureValid: boolean;
  integrityValid: boolean;
};

export function createHash(message: string): string {
  return crypto.createHash("sha256").update(message, "utf8").digest("hex");
}

export function createIntegrityPacket(message: string): IntegrityPacket {
  const hash = createHash(message);
  const signature = createSignature(hash);

  return {
    message,
    hash,
    signature,
  };
}

export function verifyIntegrityPacket(
  message: string,
  originalHash: string,
  signature: string
): IntegrityResult {
  const recalculatedHash = createHash(message);

  const hashMatch = recalculatedHash === originalHash;
  const signatureValid = verifySignature(originalHash, signature);

  return {
    recalculatedHash,
    hashMatch,
    signatureValid,
    integrityValid: hashMatch && signatureValid,
  };
}