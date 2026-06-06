import crypto from "crypto";

const DEMO_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiIw/1pSZSAr+E
s2XeJUWurkfvZADbJuUIX24NpS6s+25CiVfXrG1KUBmByg9v8W5izTk3NPiheUDC
YEQotsF6UtU0nT/aPTlNmUjHsNcIHYSbRjxafINoeg3ilIKeATrdpTaxv9MenffJ
JzfoiLd4J+rghMKS4hwsjZvnOUUHSxqXo+0LqxHj/q8UBE8iNOzPyzm6phNMVhNf
2T7BjP0kxMvkOd5RKhx0teIR7n01Wb38Nrk58EoMCHvJMBpQzEpR9nvwYPUR0VdU
PgKizvpTyGpalJ2LOVNGrKVWoBWQ/5vydD3P8PBAUrqYfy/j8l/vW1PYcCTNFei/
jS2T+gE5AgMBAAECggEAOQkR4emFCENELcKXq1doQ14Wq6Tj6GJfeuSi29MxOhTy
YtrEKpQFPqyEOm2NxjS1HDtZtnhoS0XLVRs1pbUuiF0zBCGzNKajeNRz/FW4boYP
Z6Bn4YStGiFKtj6x0QtLXxLoAB37MCo0kGoRWld9OtOKlJU3hBd+dqhCzadupx9L
PuibBdguiN9Gk9b6Ufnuf8DDu3/P3BWjRoiAa8GRMAXe8fxJakDVrwTKTsUagzvh
u0ZyfpwpvVKEQTc/u2zDEcd0gKYBSncfHndkhf7LZZiq2EBUXACd4C47sv00OXlp
HsQAkhryYS3LtahXQX4hiI3wOb/AoyYPnI/gpzyNrwKBgQD6T9SGdma+kzAePw/g
QcD/BK77e3eRkQjEr97uqn8ONErWflFxBCTnrn9AJJkjS7566swOkDyeMmwfV5Cr
NEoPty1+XpW9M99d5Czb4zGxgl90OiQIgxGsiZcmntC8EQlOibEbxFVn2OZmy4T4
llWJzdMZoTNHrBRvx2LPa9mNjwKBgQDnRpjBF7L6PRofQrC8JPklCMj5nCrubJw3
2TdzSASqPE9SdOtfAVw3Nz/B4HT64FDOedqFSm+fKIXvHzq8QHCQyLKDis0V3V2k
UzazbD+KXtE5U/yyDNsPWhAtSgtIZCUA3BZ1Q/tMvo2KvEX9YfUJgf0NgCUzYVB6
UJ1T8OUwtwKBgQC09JU9h8cLKrj0hL5jbuWo9qfRYha0g1cFaecOPu+PQzp/Cd6y
hz5uxvVzV4HlxFI15hwSwy8vZmBH4DPTsP+BkPkwjAxQNXnbFKNha0N3gjqjeYyn
IqnaQ7Wj09guvVovDtecrTjY1DLsSWEdnQDFmKhttN2viLVVgZzrOpqR/QKBgGt6
K1LQqKQR8SnF3EwTApVrV7poEKtsXcy2bUZtmX1jOZmgLCGiiDBAxKhcnwBXbjYF
+r8msGjOdC+D28/QQn+GRS9MObKHhRTwduM60uyC08hId45m2wZvXEUvu76Qi4Gy
xd0JEqe/hheLFxuBglZAylCT1LXj63psLDDuKhRRAoGBAKd+1N0b+hlev7y6IBAA
gLwWPJ9V17impqNCNvv5cfbj0FsS/pnUO4Nh43RfLuStRrul4oHaW/CLMLghNOAs
6rBidphPlEj4ZTi/6tqJIp7F4KCGA46J4joQf/SL+Yy0vcTqdPUdWe54V3TNzWoS
FKF2HxRte8Fl4F20blWBBdSN
-----END PRIVATE KEY-----`;

const DEMO_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4iMP9aUmUgK/hLNl3iVF
rq5H72QA2yblCF9uDaUurPtuQolX16xtSlAZgcoPb/FuYs05NzT4oXlAwmBEKLbB
elLVNJ0/2j05TZlIx7DXCB2Em0Y8WnyDaHoN4pSCngE63aU2sb/THp33ySc36Ii3
eCfq4ITCkuIcLI2b5zlFB0sal6PtC6sR4/6vFARPIjTsz8s5uqYTTFYTX9k+wYz9
JMTL5DneUSocdLXiEe59NVm9/Da5OfBKDAh7yTAaUMxKUfZ78GD1EdFXVD4Cos76
U8hqWpSdizlTRqylVqAVkP+b8nQ9z/DwQFK6mH8v4/Jf71tT2HAkzRXov40tk/oB
OQIDAQAB
-----END PUBLIC KEY-----`;

export type SignatureVerificationResult = {
  verified: boolean;
  reason: string;
};

export function createChallenge(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createSignature(data: string): string {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data, "utf8");
  signer.end();

  return signer.sign(DEMO_PRIVATE_KEY, "base64");
}

export function verifySignature(data: string, signature: string): boolean {
  return verifySignatureDetail(data, signature).verified;
}

export function verifySignatureDetail(
  data: string,
  signature: string,
): SignatureVerificationResult {
  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(data, "utf8");
    verifier.end();

    const verified = verifier.verify(DEMO_PUBLIC_KEY, signature, "base64");

    return {
      verified,
      reason: verified
        ? "공개키 검증 성공: Challenge와 전자서명이 일치합니다."
        : "공개키 검증 실패: Challenge 또는 전자서명이 원본과 다릅니다.",
    };
  } catch {
    return {
      verified: false,
      reason: "검증 실패: 전자서명 형식이 올바르지 않습니다.",
    };
  }
}