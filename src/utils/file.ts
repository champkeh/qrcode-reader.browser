import {upload} from './http'

type ReadAs = 'DataURL' | 'Text' | 'ArrayBuffer' | 'BinaryString'
type Accept = 'image/*' | 'application/json'

/**
 * 从文件系统选择文件并读取其内容
 * @param accept 文件类型
 * @param readAs 读取结果类型
 */
export function pickFile(accept: Accept, readAs: ReadAs) {
    return new Promise((resolve, reject) => {
        const fileEl = document.createElement('input')
        fileEl.type = 'file'
        fileEl.accept = accept
        fileEl.style.visibility = 'hidden'
        fileEl.style.width = '0'
        fileEl.style.height = '0'
        document.body.appendChild(fileEl)
        fileEl.addEventListener('change', (event) => {
            const file = (event.target as HTMLInputElement).files![0]
            if (file) {
                const reader = new FileReader()
                reader.onloadend = (evt) => {
                    resolve(evt.target!.result)
                }
                if (readAs === 'DataURL') {
                    reader.readAsDataURL(file)
                } else if (readAs === 'Text') {
                    reader.readAsText(file)
                } else if (readAs === 'ArrayBuffer') {
                    reader.readAsArrayBuffer(file)
                } else if (readAs === 'BinaryString') {
                    reader.readAsBinaryString(file)
                } else {
                    throw new Error(`readAs: ${readAs} not supported.`)
                }
            }
            setTimeout(() => {
                document.body.removeChild(fileEl)
            }, 0)
        })
        fileEl.click()
    })
}

/**
 * 下载 Blob 文件
 * @param blob
 * @param filename
 */
export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', decodeURIComponent(filename))
    document.body.appendChild(link)

    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }, 0)
}

/**
 * 读取 File 的内容
 * @param file
 */
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('loadend', (evt) => {
            resolve(evt.target?.result as string)
        })
        reader.readAsDataURL(file)
    })
}

/**
 * dataURL 转 File 对象
 * @param dataURL
 */
export function dataURL2File(dataURL: string): Promise<Blob> {
    return fetch(dataURL).then(res => res.blob())
}

/**
 * 上传文件，返回文件url
 * @param file
 */
export function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        upload({
            url: 'https://upload.api.cli.im/upload.php',
            query: {kid: 'cliim'},
            files: {Filedata: file},
        }).then(resp => {
            const {status, info, data} = resp.data
            if (status === '1') {
                resolve(data.path)
            } else {
                reject(new Error(info))
            }
        })
    })
}
