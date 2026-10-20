// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resizeImageDataUrlToExactSize } from './canvasImage'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function mockImage(width: number, height: number) {
  vi.stubGlobal('Image', class {
    naturalWidth = width
    naturalHeight = height
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) { this.onload?.() }
  })
}

describe('resizeImageDataUrlToExactSize', () => {
  it('keeps an image unchanged when it already matches the selected size', async () => {
    mockImage(1024, 1024)
    const dataUrl = 'data:image/jpeg;base64,original'
    expect(await resizeImageDataUrlToExactSize(dataUrl, '1024x1024')).toBe(dataUrl)
  })

  it('resizes a larger square to the exact pixel size', async () => {
    mockImage(1254, 1254)
    const drawImage = vi.fn()
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
    const encode = vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,resized')
    vi.spyOn(document, 'createElement').mockReturnValue(canvas)

    expect(await resizeImageDataUrlToExactSize('data:image/jpeg;base64,original', '1024x1024', 80))
      .toBe('data:image/jpeg;base64,resized')
    expect([canvas.width, canvas.height]).toEqual([1024, 1024])
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1254, 1254, 0, 0, 1024, 1024)
    expect(encode).toHaveBeenCalledWith('image/jpeg', 0.8)
  })

  it('center crops when the returned image has a different ratio', async () => {
    mockImage(1600, 1000)
    const drawImage = vi.fn()
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,resized')
    vi.spyOn(document, 'createElement').mockReturnValue(canvas)

    await resizeImageDataUrlToExactSize('data:image/png;base64,original', '1024x1024')
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 300, 0, 1000, 1000, 0, 0, 1024, 1024)
  })
})
