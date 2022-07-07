import jsQR from "jsqr"
import {readFileAsDataURL, uploadFile} from './file'
import http from './http'

/**
 * 本地解析二维码
 * @param dataURL 图片数据(dataURL格式)
 */
export async function decodeQrCodeLocal(dataURL: string): Promise<string> {
    const res = await Jimp.read(dataURL)
    console.debug(res)
    const {data, width, height} = res.bitmap
    const qrcode = jsQR(data, width, height)
    console.debug(qrcode)
    if (qrcode?.data) {
        return qrcode.data
    }
    throw new Error('解析失败')
}

export function decodeQrCodeRemote(url: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const payload = `img=${encodeURIComponent(url)}`
        http.post('https://cli.im/apis/up/deqrimg', payload).then(resp => {
            const {status, info} = resp.data
            if (status === 1) {
                if (info.status === 1) {
                    resolve(info.data)
                } else {
                    reject(new Error(info.info))
                }
            } else {
                reject(new Error(info))
            }
        })
    })
}

export interface QRCodeParseSuccess {
    success: true
    data: string
    file: File
}

export interface QRCodeParseFail {
    success: false
    file: File
}

export type QRCodeParseResult = QRCodeParseSuccess | QRCodeParseFail

export function parseFilesLocal(files: File[]): Promise<QRCodeParseResult[]> {
    return new Promise((resolve, reject) => {
        Promise.allSettled(
            files.map(file => readFileAsDataURL(file).then(decodeQrCodeLocal))
        ).then(results => {
            const parseResults: QRCodeParseResult[] = []
            results.forEach((res, index) => {
                if (res.status === 'fulfilled') {
                    parseResults.push({success: true, file: files[index], data: res.value})
                } else if (res.status === 'rejected') {
                    parseResults.push({success: false, file: files[index]})
                }
            })
            resolve(parseResults)
        })
    })
}

export function parseFilesRemote(files: File[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        Promise.allSettled(
            files.map(file => uploadFile(file).then(decodeQrCodeRemote))
        ).then(results => {
            const contents = results
                .filter(result => result.status === 'fulfilled')
                .flatMap(result => (result as PromiseFulfilledResult<string[]>).value)
            resolve(contents)
        })
    })
}
