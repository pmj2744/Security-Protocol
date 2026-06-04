import crypto from "crypto";
import fs from "fs";
import path from "path";

const privateKeyPath = path.join(process.cwd(), "keys", "private_key.pem");
const publicKeyPath = path.join(process.cwd(), "keys", "public_key.pem");

export function createChallenge(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createSignature(data: string): string {
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data, "utf8");
  signer.end();

  return signer.sign(privateKey, "hex");
}

export function verifySignature(data: string, signature: string): boolean {
  try {
    const publicKey = fs.readFileSync(publicKeyPath, "utf8");

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(data, "utf8");
    verifier.end();

    return verifier.verify(publicKey, signature, "hex");
  } catch {
    return false;
  }
}