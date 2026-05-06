import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENC_PREFIX = 'enc:'

function getKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      'APP_ENCRYPTION_KEY ist nicht gesetzt. Bitte eine 64-stellige Hex-Zeichenkette in der .env konfigurieren.'
    )
  }
  const key = Buffer.from(raw, 'hex')
  if (key.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY muss genau 32 Bytes (64 Hex-Zeichen) lang sein.')
  }
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return ENC_PREFIX + [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

export function decrypt(value: string): string {
  if (!value.startsWith(ENC_PREFIX)) {
    // Noch unverschlüsselter Altwert – direkt zurückgeben
    return value
  }
  const key = getKey()
  const parts = value.slice(ENC_PREFIX.length).split(':')
  if (parts.length !== 3) throw new Error('Ungültiges verschlüsseltes Format')
  const [ivHex, tagHex, dataHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(data).toString('utf8') + decipher.final('utf8')
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(ENC_PREFIX)
}
