const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const path = require("path");

const keyDir = path.join(process.cwd(), "keys");

if (!fs.existsSync(keyDir)) {
  fs.mkdirSync(keyDir);
}

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

fs.writeFileSync(path.join(keyDir, "private_key.pem"), privateKey);
fs.writeFileSync(path.join(keyDir, "public_key.pem"), publicKey);

console.log("RSA 개인키와 공개키가 생성되었습니다.");
console.log("keys/private_key.pem");
console.log("keys/public_key.pem");