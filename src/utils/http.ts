import axios from "axios"

const http = axios.create({
    timeout: 0,
})

export default http

export function download(url: string): Promise<Blob> {
    return http.get(url, {
        responseType: "blob"
    }).then(resp => {
        return resp.data
    })
}

interface UploadConfig {
    url: string
    query?: Record<string, any>
    params?: Record<string, any>
    files?: Record<string, File>
}

export function upload(config: UploadConfig) {
    const formData = new FormData()
    config.params && Object.keys(config.params).forEach(k => {
        formData.append(k, config.params![k])
    })
    config.files && Object.keys(config.files).forEach(k => {
        formData.append(k, config.files![k])
    })

    let query = ''
    if (config.query) {
        const q = Object.keys(config.query).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(config.query![k])}`).join('&')
        query = `?${q}`
    }

    return http.post(config.url + query, formData)
}

