import jsQR from "jsqr"

/**
 * 本地解析二维码
 * @param dataURL 图片数据(dataURL格式)
 */
export async function decodeQrCodeLocal(dataURL: string): Promise<string> {
    const res = await Jimp.read(dataURL)
    const {data, width, height} = res.bitmap
    const qrcode = jsQR(data, width, height)
    if (qrcode?.data) {
        return qrcode.data
    }
    throw new Error('解析失败')
}
