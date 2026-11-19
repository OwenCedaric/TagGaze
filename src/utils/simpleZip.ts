/**
 * Zero-dependency, pure TypeScript ZIP archive creator (Store method, 0x0000).
 * Perfectly suited for bundling pre-compressed images (JPEG, PNG, WebP) and JSON
 * with maximum performance, minimal memory overhead, and 100% standard zip compliance.
 */

// Precomputed CRC32 lookup table
const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[i] = c
}

export function computeCRC32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

interface ZipEntry {
  filename: string
  data: Uint8Array
  crc: number
  modTime: number
  modDate: number
  offset?: number
}

export class SimpleZip {
  private entries: ZipEntry[] = []

  /**
   * Add a file to the ZIP archive
   */
  async addFile(filename: string, content: Uint8Array | Blob | ArrayBuffer | string): Promise<void> {
    let bytes: Uint8Array
    if (typeof content === 'string') {
      bytes = new TextEncoder().encode(content)
    } else if (content instanceof Blob) {
      const buffer = await content.arrayBuffer()
      bytes = new Uint8Array(buffer)
    } else if (content instanceof ArrayBuffer) {
      bytes = new Uint8Array(content)
    } else {
      bytes = content
    }

    const now = new Date()
    // Convert current time to MS-DOS time and date
    const modTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff
    const modDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff
    const crc = computeCRC32(bytes)

    this.entries.push({
      filename,
      data: bytes,
      crc,
      modTime,
      modDate
    })
  }

  /**
   * Generate standard ZIP archive as a Blob
   */
  generateBlob(): Blob {
    const encoder = new TextEncoder()
    const parts: Uint8Array[] = []
    let currentOffset = 0

    // 1. Write Local File Headers + File Data
    for (const entry of this.entries) {
      entry.offset = currentOffset
      const nameBytes = encoder.encode(entry.filename)
      const dataBytes = entry.data

      const localHeader = new Uint8Array(30 + nameBytes.length)
      const view = new DataView(localHeader.buffer)

      // Signature: 0x04034b50 (Little Endian)
      view.setUint32(0, 0x04034b50, true)
      // Version needed to extract: 20 (2.0)
      view.setUint16(4, 20, true)
      // General purpose bit flag: bit 11 = UTF-8 (0x0800)
      view.setUint16(6, 0x0800, true)
      // Compression method: 0 (Store)
      view.setUint16(8, 0, true)
      // File modification time & date
      view.setUint16(10, entry.modTime, true)
      view.setUint16(12, entry.modDate, true)
      // CRC-32
      view.setUint32(14, entry.crc, true)
      // Compressed size
      view.setUint32(18, dataBytes.length, true)
      // Uncompressed size
      view.setUint32(22, dataBytes.length, true)
      // Filename length
      view.setUint16(26, nameBytes.length, true)
      // Extra field length
      view.setUint16(28, 0, true)

      // Filename
      localHeader.set(nameBytes, 30)

      parts.push(localHeader)
      parts.push(dataBytes)

      currentOffset += localHeader.length + dataBytes.length
    }

    const centralDirectoryStart = currentOffset
    let centralDirectorySize = 0

    // 2. Write Central Directory Headers
    for (const entry of this.entries) {
      const nameBytes = encoder.encode(entry.filename)
      const cdHeader = new Uint8Array(46 + nameBytes.length)
      const view = new DataView(cdHeader.buffer)

      // Central directory file header signature: 0x02014b50
      view.setUint32(0, 0x02014b50, true)
      // Version made by: 20 (UNIX/DOS)
      view.setUint16(4, 20, true)
      // Version needed to extract: 20
      view.setUint16(6, 20, true)
      // General purpose bit flag: UTF-8
      view.setUint16(8, 0x0800, true)
      // Compression method: 0 (Store)
      view.setUint16(10, 0, true)
      // Mod time & date
      view.setUint16(12, entry.modTime, true)
      view.setUint16(14, entry.modDate, true)
      // CRC-32
      view.setUint32(16, entry.crc, true)
      // Compressed size
      view.setUint32(20, entry.data.length, true)
      // Uncompressed size
      view.setUint32(24, entry.data.length, true)
      // Filename length
      view.setUint16(28, nameBytes.length, true)
      // Extra field length
      view.setUint16(30, 0, true)
      // File comment length
      view.setUint16(32, 0, true)
      // Disk number start
      view.setUint16(34, 0, true)
      // Internal file attributes
      view.setUint16(36, 0, true)
      // External file attributes
      view.setUint32(38, 0, true)
      // Relative offset of local header
      view.setUint32(42, entry.offset || 0, true)

      // Filename
      cdHeader.set(nameBytes, 46)

      parts.push(cdHeader)
      centralDirectorySize += cdHeader.length
      currentOffset += cdHeader.length
    }

    // 3. Write End of Central Directory Record (EOCD)
    const eocd = new Uint8Array(22)
    const eocdView = new DataView(eocd.buffer)

    // End of central dir signature: 0x06054b50
    eocdView.setUint32(0, 0x06054b50, true)
    // Number of this disk: 0
    eocdView.setUint16(4, 0, true)
    // Disk where central directory starts: 0
    eocdView.setUint16(6, 0, true)
    // Number of central directory records on this disk
    eocdView.setUint16(8, this.entries.length, true)
    // Total number of central directory records
    eocdView.setUint16(10, this.entries.length, true)
    // Size of central directory (bytes)
    eocdView.setUint32(12, centralDirectorySize, true)
    // Offset of start of central directory
    eocdView.setUint32(16, centralDirectoryStart, true)
    // Comment length: 0
    eocdView.setUint16(20, 0, true)

    parts.push(eocd)

    return new Blob(parts as BlobPart[], { type: 'application/zip' })
  }
}
