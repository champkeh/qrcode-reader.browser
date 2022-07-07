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
    <textarea
        disabled
        :class="{overing}"
        :value="codeContent"
        @drop="onDrop"
        @dragover="onDragOver"
        placeholder="拖动图片到此处"
    />
  </div>
  <div class="result" v-if="success || fail">
    <h3>解析结果：</h3>
    <p class="success">成功: {{success}}</p>
    <p class="fail">失败: {{fail}} <button v-if="!hasRetried" :disabled="disabled" class="text" @click="callRemoteApi">采用在线 API 重试？</button></p>
  </div>
</template>

<script lang="ts" setup>
import vSelect from '@/directives/vSelect'
import {ref, watchEffect} from 'vue'
import {useDragDropFile} from '@/hooks/useDragDrop'
import {useQRCodeParse} from "@/hooks/useQRCodeParse"
import {parseFilesLocal, parseFilesRemote, QRCodeParseSuccess} from '@/utils/qrcode'

const codeContent = ref('')

const {overing, files, dropAction, onDragOver, onDrop} = useDragDropFile(codeContent)
const {loading, url, loadQRCode, fetchQRCode} = useQRCodeParse(codeContent)

const success = ref(0)
const fail = ref(0)
const failFileList = ref<File[]>([])
const hasRetried = ref(false)
const disabled = ref(false)

const delimiter = '\n\n================================\n\n'

watchEffect(() => {
  parseFilesLocal(files.value).then(parseResults => {
    codeContent.value = parseResults.filter(res => res.success).map(res => (res as QRCodeParseSuccess).data).join(delimiter)
    success.value = parseResults.filter(res => res.success).length
    fail.value = parseResults.filter(res => !res.success).length
    failFileList.value = parseResults.filter(res => !res.success).map(res => res.file)
    if (success.value === 0) {
      codeContent.value = ''
    }
  })
})
watchEffect(() => {
  console.log(dropAction.value)
  hasRetried.value = false
  disabled.value = false
})

async function callRemoteApi() {
  disabled.value = true
  const urls = await parseFilesRemote(failFileList.value)

  if (urls.length > 0) {
    if (codeContent.value) {
      codeContent.value += delimiter + urls.join(delimiter)
    } else {
      codeContent.value += urls.join(delimiter)
    }
    success.value += urls.length
    fail.value -= urls.length
  }

  hasRetried.value = true
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

.result {
  .success {
    color: forestgreen;
  }
  .fail {
    color: red;
  }
  button.text {
    background-color: transparent;
    margin-left: 10px;
    color: #aaa3a3;
    transition: all .2s;
    &:hover {
      color: #000;
      text-decoration: underline;
    }
    &[disabled] {
      opacity: .3;
    }
  }
}
</style>
