'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import FlowNav from '@/components/FlowNav'

const END_MARKER = '<<<END_OF_MESSAGE>>>'

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function base64ToBytes(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function textToBits(text: string) {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)

  let bits = ''

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0')
  }

  return bits
}

function bitsToText(pixels: Uint8ClampedArray) {
  let bits = ''
  let text = ''

  for (let index = 0; index < pixels.length; index += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      bits += String(pixels[index + channel] & 1)

      if (bits.length === 8) {
        const charCode = parseInt(bits, 2)
        text += String.fromCharCode(charCode)
        bits = ''

        if (text.includes(END_MARKER)) {
          return text.split(END_MARKER)[0]
        }
      }
    }
  }

  return ''
}

async function createAesKey(password: string) {
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', passwordBytes)

  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

async function encryptMessage(message: string, password: string) {
  const encoder = new TextEncoder()
  const key = await createAesKey(password)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const messageBytes = encoder.encode(message)

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    messageBytes,
  )

  return JSON.stringify({
    algorithm: 'AES-GCM',
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encryptedBuffer)),
  })
}

async function decryptMessage(payload: string, password: string) {
  const decoder = new TextDecoder()
  const key = await createAesKey(password)

  const parsed = JSON.parse(payload) as {
    iv: string
    ciphertext: string
  }

  const iv = base64ToBytes(parsed.iv)
  const ciphertext = base64ToBytes(parsed.ciphertext)

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext,
  )

  return decoder.decode(decryptedBuffer)
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))

    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'))

    image.src = src
  })
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('이미지를 생성하지 못했습니다.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export default function SteganographyPage() {
  const [sendImage, setSendImage] = useState<File | null>(null)
  const [plainMessage, setPlainMessage] = useState('')
  const [sendPassword, setSendPassword] = useState('')
  const [ciphertext, setCiphertext] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [sendStatus, setSendStatus] = useState('원본 이미지, 평문 메시지, AES 키를 입력한 뒤 실행하세요.')

  const [receiveImage, setReceiveImage] = useState<File | null>(null)
  const [receivePassword, setReceivePassword] = useState('')
  const [extractedCiphertext, setExtractedCiphertext] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')
  const [receiveStatus, setReceiveStatus] = useState('secure_image.png와 동일한 AES 키를 입력한 뒤 복호화하세요.')

  function handleSendImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSendImage(file)
    setDownloadUrl('')
    setCiphertext('')
    setSendStatus(`선택된 원본 이미지: ${file.name}`)
  }

  function handleReceiveImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setReceiveImage(file)
    setExtractedCiphertext('')
    setDecryptedMessage('')
    setReceiveStatus(`선택된 수신 이미지: ${file.name}`)
  }

  async function handleEncryptAndHide() {
    try {
      if (!sendImage) {
        setSendStatus('먼저 원본 이미지를 선택해야 합니다.')
        return
      }

      if (!plainMessage.trim()) {
        setSendStatus('숨길 평문 메시지를 입력해야 합니다.')
        return
      }

      if (!sendPassword.trim()) {
        setSendStatus('AES 키를 입력해야 합니다.')
        return
      }

      const encryptedPayload = await encryptMessage(plainMessage, sendPassword)
      setCiphertext(encryptedPayload)

      const imageUrl = await fileToDataUrl(sendImage)
      const image = await loadImage(imageUrl)

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        setSendStatus('Canvas를 사용할 수 없습니다.')
        return
      }

      canvas.width = image.width
      canvas.height = image.height

      context.drawImage(image, 0, 0)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      const hiddenText = encryptedPayload + END_MARKER
      const bits = textToBits(hiddenText)
      const capacity = canvas.width * canvas.height * 3

      if (bits.length > capacity) {
        setSendStatus(`메시지가 너무 깁니다. 필요 bit: ${bits.length}, 이미지 용량 bit: ${capacity}`)
        return
      }

      let bitIndex = 0

      for (let index = 0; index < pixels.length; index += 4) {
        for (let channel = 0; channel < 3; channel += 1) {
          if (bitIndex >= bits.length) {
            break
          }

          pixels[index + channel] = (pixels[index + channel] & 254) | Number(bits[bitIndex])
          bitIndex += 1
        }

        if (bitIndex >= bits.length) {
          break
        }
      }

      context.putImageData(imageData, 0, 0)

      const blob = await canvasToPngBlob(canvas)
      const url = URL.createObjectURL(blob)

      setDownloadUrl(url)
      setSendStatus('AES 암호화 + LSB 이미지 은닉 완료. secure_image.png를 다운로드할 수 있습니다.')
    } catch {
      setSendStatus('처리 중 오류가 발생했습니다. 이미지, 메시지, AES 키를 다시 확인하세요.')
    }
  }

  async function handleExtractAndDecrypt() {
    try {
      if (!receiveImage) {
        setReceiveStatus('먼저 수신 이미지를 선택해야 합니다.')
        return
      }

      if (!receivePassword.trim()) {
        setReceiveStatus('AES 키를 입력해야 합니다.')
        return
      }

      const imageUrl = await fileToDataUrl(receiveImage)
      const image = await loadImage(imageUrl)

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        setReceiveStatus('Canvas를 사용할 수 없습니다.')
        return
      }

      canvas.width = image.width
      canvas.height = image.height

      context.drawImage(image, 0, 0)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const encryptedPayload = bitsToText(imageData.data)

      if (!encryptedPayload) {
        setReceiveStatus('이미지에서 숨겨진 암호문을 찾지 못했습니다.')
        return
      }

      setExtractedCiphertext(encryptedPayload)

      const originalMessage = await decryptMessage(encryptedPayload, receivePassword)

      setDecryptedMessage(originalMessage)
      setReceiveStatus('LSB 암호문 추출 + AES 복호화 완료.')
    } catch {
      setReceiveStatus('복호화 실패. 이미지나 AES 키가 올바른지 확인하세요.')
    }
  }

  return (
    <main className="site" style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      <FlowNav current="/steganography" />

      <p style={{ color: '#2563eb', fontWeight: 700 }}>SECURE MESSAGE TRANSFER</p>

      <h1>암호화 / 스테가노그래피 기반 메시지 전송</h1>

      <p>
        본 모듈은 전자서명 로그인 및 신원 확인 이후, 사용자 간 메시지를 안전하게
        전달하기 위한 보안 전송 단계입니다. 송신자는 평문 메시지를 AES로 암호화한 뒤
        암호문을 이미지 LSB에 숨기고, 수신자는 이미지에서 암호문을 추출한 뒤 동일한 AES
        키로 복호화하여 원본 메시지를 확인합니다.
      </p>

      <section style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', marginTop: '32px' }}>
        <h2>1. 송신자: 메시지 암호화 및 이미지 은닉</h2>

        <p>
          송신자는 원본 이미지, 평문 메시지, AES 키를 입력합니다. 입력된 메시지는
          AES-GCM 방식으로 암호화되고, 생성된 암호문은 이미지 픽셀의 R/G/B 최하위
          비트에 삽입됩니다.
        </p>

        <label>원본 이미지 선택</label>
        <input type="file" accept="image/png,image/jpeg" onChange={handleSendImageChange} />

        <label>숨길 평문 메시지</label>
        <textarea
          value={plainMessage}
          onChange={(event) => setPlainMessage(event.target.value)}
          placeholder="예: hello security"
          rows={4}
        />

        <label>AES 키</label>
        <input
          type="password"
          value={sendPassword}
          onChange={(event) => setSendPassword(event.target.value)}
          placeholder="송신자와 수신자가 공유할 키"
        />

        <button type="button" onClick={handleEncryptAndHide}>
          AES 암호화 후 이미지에 숨기기
        </button>

        <p>{sendStatus}</p>

        {ciphertext && (
          <div>
            <h3>AES 암호문</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{ciphertext}</pre>
          </div>
        )}

        {downloadUrl && (
          <a href={downloadUrl} download="secure_image.png">
            secure_image.png 다운로드
          </a>
        )}
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', marginTop: '32px' }}>
        <h2>2. 수신자: 암호문 추출 및 메시지 복호화</h2>

        <p>
          수신자는 전달받은 secure_image.png와 송신자와 공유한 AES 키를 입력합니다.
          시스템은 이미지의 LSB 영역에서 숨겨진 암호문을 추출하고, 동일한 AES 키로
          복호화하여 원본 메시지를 출력합니다.
        </p>

        <label>수신 이미지 선택</label>
        <input type="file" accept="image/png,image/jpeg" onChange={handleReceiveImageChange} />

        <label>AES 키</label>
        <input
          type="password"
          value={receivePassword}
          onChange={(event) => setReceivePassword(event.target.value)}
          placeholder="송신자가 사용한 키와 동일해야 합니다."
        />

        <button type="button" onClick={handleExtractAndDecrypt}>
          암호문 추출 후 AES 복호화
        </button>

        <p>{receiveStatus}</p>

        {extractedCiphertext && (
          <div>
            <h3>추출된 암호문</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {extractedCiphertext}
            </pre>
          </div>
        )}

        {decryptedMessage && (
          <div>
            <h3>복호화된 원본 메시지</h3>
            <p>{decryptedMessage}</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: '32px' }}>
        <h2>전체 데이터 흐름</h2>

        <ol>
          <li>사용자 등록, 인증서 발급, 신원 확인이 완료된 사용자가 메시지 전송 단계로 진입합니다.</li>
          <li>송신자가 평문 메시지와 AES 키를 입력합니다.</li>
          <li>평문 메시지를 AES-GCM 방식으로 암호화하여 암호문을 생성합니다.</li>
          <li>생성된 암호문을 이미지 픽셀의 LSB 영역에 숨깁니다.</li>
          <li>수신자는 전달받은 secure_image.png와 동일한 AES 키를 입력합니다.</li>
          <li>이미지에서 암호문을 추출하고 AES 복호화를 수행합니다.</li>
          <li>복호화된 원본 메시지를 화면에 출력합니다.</li>
        </ol>
      </section>
    </main>
  )
}