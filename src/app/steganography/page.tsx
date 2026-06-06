'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';

const END_MARKER = '<<<END_OF_MESSAGE>>>';

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function textToBits(text: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);

  let bits = '';

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  return bits;
}

function bitsToTextFromImageData(pixels: Uint8ClampedArray) {
  let bits = '';
  let extractedText = '';

  for (let i = 0; i < pixels.length; i += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      bits += String(pixels[i + channel] & 1);

      if (bits.length === 8) {
        const charCode = parseInt(bits, 2);
        extractedText += String.fromCharCode(charCode);
        bits = '';

        if (extractedText.includes(END_MARKER)) {
          return extractedText.split(END_MARKER)[0];
        }
      }
    }
  }

  return '';
}

async function createAesKey(password: string) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const hash = await crypto.subtle.digest('SHA-256', passwordBytes);

  return crypto.subtle.importKey(
    'raw',
    hash,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptMessage(plainText: string, password: string) {
  const encoder = new TextEncoder();
  const key = await createAesKey(password);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plainBytes = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    plainBytes,
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  return JSON.stringify({
    algorithm: 'AES-GCM',
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(encryptedBytes),
  });
}

async function decryptMessage(encryptedPayload: string, password: string) {
  const decoder = new TextDecoder();
  const key = await createAesKey(password);

  const parsed = JSON.parse(encryptedPayload);
  const iv = base64ToBytes(parsed.iv);
  const ciphertext = base64ToBytes(parsed.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext,
  );

  return decoder.decode(decryptedBuffer);
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));

    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));

    image.src = src;
  });
}

export default function SteganographyPage() {
  const [sendImageFile, setSendImageFile] = useState<File | null>(null);
  const [plainMessage, setPlainMessage] = useState('');
  const [sendPassword, setSendPassword] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [ciphertextPreview, setCiphertextPreview] = useState('');
  const [sendStatus, setSendStatus] = useState(
    '원본 이미지, 메시지, AES 키를 입력한 뒤 실행 버튼을 눌러 주세요.',
  );

  const [receiveImageFile, setReceiveImageFile] = useState<File | null>(null);
  const [receivePassword, setReceivePassword] = useState('');
  const [extractedCiphertext, setExtractedCiphertext] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [receiveStatus, setReceiveStatus] = useState(
    'secure_image.png와 AES 키를 입력한 뒤 복호화 버튼을 눌러 주세요.',
  );

  function handleSendImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSendImageFile(file);
    setOutputUrl('');
    setCiphertextPreview('');
    setSendStatus(`선택된 원본 이미지: ${file.name}`);
  }

  function handleReceiveImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setReceiveImageFile(file);
    setExtractedCiphertext('');
    setDecryptedMessage('');
    setReceiveStatus(`선택된 수신 이미지: ${file.name}`);
  }

  async function encryptAndHideMessage() {
    try {
      if (!sendImageFile) {
        setSendStatus('먼저 원본 이미지를 선택해야 합니다.');
        return;
      }

      if (!plainMessage.trim()) {
        setSendStatus('숨길 메시지를 입력해야 합니다.');
        return;
      }

      if (!sendPassword.trim()) {
        setSendStatus('AES 키로 사용할 비밀번호를 입력해야 합니다.');
        return;
      }

      const encryptedPayload = await encryptMessage(plainMessage, sendPassword);
      setCiphertextPreview(encryptedPayload);

      const imageDataUrl = await readImageAsDataUrl(sendImageFile);
      const image = await loadImage(imageDataUrl);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        setSendStatus('Canvas를 사용할 수 없습니다.');
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const hiddenText = encryptedPayload + END_MARKER;
      const bits = textToBits(hiddenText);

      const capacity = canvas.width * canvas.height * 3;

      if (bits.length > capacity) {
        setSendStatus(`메시지가 너무 깁니다. 필요 bit: ${bits.length}, 이미지 용량 bit: ${capacity}`);
        return;
      }

      let bitIndex = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        for (let channel = 0; channel < 3; channel += 1) {
          if (bitIndex >= bits.length) {
            break;
          }

          pixels[i + channel] = (pixels[i + channel] & 254) | Number(bits[bitIndex]);
          bitIndex += 1;
        }

        if (bitIndex >= bits.length) {
          break;
        }
      }

      context.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          setSendStatus('결과 이미지를 생성하지 못했습니다.');
          return;
        }

        const url = URL.createObjectURL(blob);

        setOutputUrl(url);
        setSendStatus('AES 암호화 + LSB 은닉 완료. secure_image.png를 다운로드할 수 있습니다.');
      }, 'image/png');
    } catch (error) {
      setSendStatus('처리 중 오류가 발생했습니다. 입력값을 다시 확인해 주세요.');
    }
  }

  async function extractAndDecryptMessage() {
    try {
      if (!receiveImageFile) {
        setReceiveStatus('먼저 수신 이미지를 선택해야 합니다.');
        return;
      }

      if (!receivePassword.trim()) {
        setReceiveStatus('AES 키로 사용할 비밀번호를 입력해야 합니다.');
        return;
      }

      const imageDataUrl = await readImageAsDataUrl(receiveImageFile);
      const image = await loadImage(imageDataUrl);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        setReceiveStatus('Canvas를 사용할 수 없습니다.');
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const encryptedPayload = bitsToTextFromImageData(pixels);

      if (!encryptedPayload) {
        setReceiveStatus('숨겨진 암호문을 찾지 못했습니다.');
        return;
      }

      setExtractedCiphertext(encryptedPayload);

      const originalMessage = await decryptMessage(encryptedPayload, receivePassword);

      setDecryptedMessage(originalMessage);
      setReceiveStatus('LSB 추출 + AES 복호화 완료. 원본 메시지를 확인할 수 있습니다.');
    } catch (error) {
      setReceiveStatus('복호화에 실패했습니다. 이미지나 AES 키가 올바른지 확인해 주세요.');
    }
  }

  return (
    <main
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '48px 24px',
        lineHeight: '1.7',
      }}
    >
      <p style={{ color: '#2563eb', fontWeight: 700, marginBottom: '8px' }}>
        SECURE MESSAGE TRANSFER
      </p>

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
        암호화 / 스테가노그래피 기반 메시지 전송
      </h1>

      <p style={{ fontSize: '16px', color: '#444', marginBottom: '32px' }}>
       <p style={{ fontSize: '16px', color: '#444', marginBottom: '32px' }}>
  본 모듈은 전자서명 로그인 및 신원 확인 이후, 사용자 간 메시지를 안전하게 전달하기 위한 보안 전송 단계입니다.
  송신자는 평문 메시지를 AES로 암호화한 뒤 암호문을 이미지 LSB에 숨기고,
  수신자는 이미지에서 암호문을 추출한 뒤 동일한 AES 키로 복호화하여 원본 메시지를 확인합니다.
</p>

      <section
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          backgroundColor: '#ffffff',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          1. 송신자: 메시지 암호화 및 이미지 은닉
        </h2>

        <p style={{ color: '#4b5563', marginBottom: '20px' }}>
          송신자는 원본 이미지, 평문 메시지, AES 키를 입력합니다.
          입력된 메시지는 먼저 AES-GCM 방식으로 암호화되고,
          생성된 암호문은 이미지 픽셀의 R/G/B 최하위 비트에 삽입됩니다.
        </p>

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
          원본 이미지 선택
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleSendImageChange}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        />

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
          숨길 평문 메시지
        </label>

        <textarea
          value={plainMessage}
          onChange={(event) => setPlainMessage(event.target.value)}
          placeholder="예: hello security"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '20px',
            resize: 'vertical',
          }}
        />

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
          AES 키
        </label>

        <input
          type="password"
          value={sendPassword}
          onChange={(event) => setSendPassword(event.target.value)}
          placeholder="송신자와 수신자가 공유할 키"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        />

        <button
          type="button"
          onClick={encryptAndHideMessage}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          AES 암호화 후 이미지에 숨기기
        </button>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        >
          <strong>실행 상태</strong>
          <p style={{ margin: '8px 0 0 0' }}>{sendStatus}</p>
        </div>

        {ciphertextPreview && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#111827',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            <strong>AES 암호문</strong>
            <p>{ciphertextPreview}</p>
          </div>
        )}

        {outputUrl && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
            }}
          >
            <strong>결과 이미지 생성 완료</strong>

            <p>아래 버튼을 누르면 암호문이 숨겨진 이미지를 다운로드할 수 있습니다.</p>

            <a
              href={outputUrl}
              download="secure_image.png"
              style={{
                display: 'inline-block',
                marginTop: '8px',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              secure_image.png 다운로드
            </a>
          </div>
        )}
      </section>

      <section
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          backgroundColor: '#ffffff',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          2. 수신자: 이미지에서 암호문 추출 밒 AES 복호화
        </h2>

        <p style={{ color: '#4b5563', marginBottom: '20px' }}>
           수신자는 전달받은 secure_image.png와 송신자와 공유한 AES 키를 입력합니다.
           시스템은 이미지의 LSB 영역에서 숨겨진 암호문을 추출하고,
           동일한 AES 키로 복호화하여 원본 메시지를 출력합니다.
        </p>

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
          수신 이미지 선택
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleReceiveImageChange}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        />

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
          AES 키
        </label>

        <input
          type="password"
          value={receivePassword}
          onChange={(event) => setReceivePassword(event.target.value)}
          placeholder="송신자가 사용한 키와 동일해야 합니다."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        />

        <button
          type="button"
          onClick={extractAndDecryptMessage}
          style={{
            backgroundColor: '#111827',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          암호문 추출 후 AES 복호화
        </button>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        >
          <strong>실행 상태</strong>
          <p style={{ margin: '8px 0 0 0' }}>{receiveStatus}</p>
        </div>

        {extractedCiphertext && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#111827',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            <strong>추출된 암호문</strong>
            <p>{extractedCiphertext}</p>
          </div>
        )}

        {decryptedMessage && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
            }}
          >
            <strong>복호화된 원본 메시지</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 700 }}>
              {decryptedMessage}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
          전체 데이터 흐름
        </h2>

        <ol>
          <li>전자서명 로그인 및 신원 확인이 완료된 사용자가 메시지 전송 단계로 진입합니다.</li>
          <li>송신자가 평문 메시지와 AES 키를 입력합니다.</li>
          <li>평문 메시지를 AES-GCM 방식으로 암호화하여 암호문을 생성합니다.</li>
          <li>생성된 암호문을 이미지 픽셀의 LSB 영역에 숨깁니다.</li>
          <li>수신자는 전달받은 secure_image.png와 동일한 AES 키를 입력합니다.</li>
          <li>이미지에서 암호문을 추출하고 AES 복호화를 수행합니다.</li>
          <li>복호화된 원본 메시지를 화면에 출력합니다.</li>
        </ol>
      </section>
    </main>
  );
}