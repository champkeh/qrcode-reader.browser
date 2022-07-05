<template>
  <h1>QRCode Reader</h1>

  <form @submit.prevent="fetchQRCode">
    <p class="flex-row">
      <input class="flex-1 font-sm" type="url" v-select v-model="url" placeholder="二维码图片地址 (支持DataURL)" required
             autocomplete="off">
      <button class="btn" :disabled="loading">提取在线二维码</button>
      <button class="btn" @click.prevent="loadQRCode">本地二维码</button>
    </p>
  </form>

  <div>
    <textarea disabled :class="{overing}" :value="codeContent" @drop="onDrop" @dragover="onDragOver" placeholder="拖动文件到此处"></textarea>
  </div>
</template>

<script lang="ts" setup>
import vSelect from '@/directives/vSelect'
import {ref} from 'vue'
import {decodeQrCodeLocal} from '@/utils/qrcode'
import {download} from '@/utils/http'
import {readFileContent} from '@/utils/file'
import {useDragDrop} from '@/hooks/useDragDrop'

const url = ref('')
const loading = ref(false)
const codeContent = ref('')

const {overing, onDragOver, onDrop} = useDragDrop(codeContent)

/**
 * 加载本地二维码
 */
async function loadQRCode() {
  try {
    const dataURL = await readFileContent('image/*', 'DataURL')
    codeContent.value = await decodeQrCodeLocal(dataURL as string)
  } catch (e: any) {
    codeContent.value = ''
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
    codeContent.value = res
  }).catch(e => {
    codeContent.value = ''
    alert(e.message)
  }).finally(() => {
    loading.value = false
  })
}


</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
  margin-bottom: 50px;
}

input {
  font-size: 16px;
  padding: 10px;

  &::placeholder {
    color: #9ea2a6;
  }
}

.flex-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.flex-1 {
  flex: 1;
}

.font-sm {
  font-size: 14px;
}

form {
  margin-top: 20px;
}

textarea {
  position: relative;
  color: forestgreen;
  font-family: monospace, serif;
  line-height: 1.4;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  resize: none;
  border-radius: 4px;
  min-height: 300px;

  &::placeholder {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 30px;
    font-family: 'Xingkai SC', serif;
    color: #aaa3a3;
  }
}

.overing {
  box-shadow: 0 0 0 3px forestgreen;
}

button.btn {
  padding: 10px 20px;
  background-color: #eaeaea;
  color: blueviolet;
  border-radius: 3px;
  font-size: 18px;
  border: 1px solid transparent;
  margin-left: 10px;
  transition: all .3s;

  &:focus {
    border: 1px solid -webkit-focus-ring-color;
  }

  &:hover {
    color: white;
    background-color: blueviolet;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.3;
  }
}
</style>
