import {ref, Ref} from 'vue'
import {pickFile} from "@/utils/file"
import {decodeQrCodeLocal} from "@/utils/qrcode"
import {download} from "@/utils/http"


export function useQRCodeParse(content: Ref<string>) {
    const loading = ref(false)
    const url = ref('')

    /**
     * 加载本地二维码
     */
    async function loadQRCode() {
        try {
            const dataURL = await pickFile('image/*', 'DataURL')
            content.value = await decodeQrCodeLocal(dataURL as string)
        } catch (e: any) {
            content.value = ''
            alert(e.message)
        }
    }

    /**
     * 解析远程二维码
     */
    function fetchQRCode() {
        loading.value = true
        let dataURLPromise: Promise<string>
        if (/data:image\/(png|jpeg);base64,.+/.test(url.value)) {
            dataURLPromise = Promise.resolve(url.value)
        } else {
            dataURLPromise = new Promise((resolve, reject) => {
                download(url.value).then(file => {
                    const reader = new FileReader()
                    reader.onloadend = (evt) => {
                        resolve(evt.target!.result as string)
                    }
                    reader.readAsDataURL(file)
                })
            })
        }
        dataURLPromise.then(decodeQrCodeLocal).then(res => {
            content.value = res
        }).catch(e => {
            content.value = ''
            alert(e.message)
        }).finally(() => {
            loading.value = false
        })
    }

    return {
        loading,
        url,
        loadQRCode,
        fetchQRCode,
    }
}
