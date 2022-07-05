import {Ref, ref} from "vue"
import {decodeQrCodeLocal} from "@/utils/qrcode"

function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('loadend', (evt) => {
            resolve(evt.target?.result as string)
        })
        reader.readAsDataURL(file)
    })
}

function processFiles(files: File[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        Promise.allSettled(files.map(file => readFile(file).then(decodeQrCodeLocal))).then(results => {
            const contents = results
                .filter(result => result.status === 'fulfilled')
                .map((result: PromiseSettledResult<string>) =>
                    (result as PromiseFulfilledResult<string>).value
                )
            resolve(contents)
        })
    })
}


export function useDragDrop(content: Ref<string>) {
    const overing = ref(false)
    const loading = ref(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    function onDrop(event: DragEvent) {
        event.preventDefault()

        loading.value = true
        const files = []
        if (event.dataTransfer?.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()
                    file && files.push(file)
                }
            }
        } else if (event.dataTransfer?.files) {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                const file = event.dataTransfer.files[i]
                files.push(file)
            }
        }

        processFiles(files).then(contents => {
            content.value = contents.join('\n\n================================\n\n')
            loading.value = false
        })
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault()

        overing.value = true
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            overing.value = false
        }, 200)
    }

    return {
        overing,
        loading,
        onDrop,
        onDragOver,
    }
}