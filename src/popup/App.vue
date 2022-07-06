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
    <textarea disabled :class="{overing}" :value="codeContent" @drop="onDrop" @dragover="onDragOver" placeholder="拖动图片到此处"></textarea>
  </div>
</template>

<script lang="ts" setup>
import vSelect from '@/directives/vSelect'
import {ref} from 'vue'
import {useDragDrop} from '@/hooks/useDragDrop'
import {useQRCodeParse} from "@/hooks/useQRCodeParse"

const codeContent = ref('')

const {overing, onDragOver, onDrop} = useDragDrop(codeContent)
const {loading, url, loadQRCode, fetchQRCode} = useQRCodeParse(codeContent)

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
