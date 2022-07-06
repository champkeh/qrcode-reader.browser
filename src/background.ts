export {}

chrome.runtime.onInstalled.addListener(async details => {
    chrome.contextMenus.create({
        id: 'qrcode',
        title: '提取二维码内容',
        contexts: ['image'],
        documentUrlPatterns: ['<all_urls>'],
    })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info)
    console.log(tab)
})
