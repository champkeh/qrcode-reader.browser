/**
 * 拷贝内容到剪贴板
 * @param text
 */
export async function copy2Clipboard(text: string) {
    await navigator.clipboard.writeText(text)
}
