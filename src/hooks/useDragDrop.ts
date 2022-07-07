import {Ref, ref} from "vue"

export function useDragDropFile(placeholder: Ref<string>) {
    const overing = ref(false)
    const files = ref<File[]>([])
    let timer: ReturnType<typeof setTimeout> | null = null
    const dropAction = ref(0)

    function onDrop(event: DragEvent) {
        event.preventDefault()
        files.value.length = 0
        dropAction.value = Math.random()

        placeholder.value = '解析中...'
        if (event.dataTransfer?.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()
                    file && files.value.push(file)
                }
            }
        } else if (event.dataTransfer?.files) {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                const file = event.dataTransfer.files[i]
                files.value.push(file)
            }
        }
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
        files,
        dropAction,
        onDrop,
        onDragOver,
    }
}
