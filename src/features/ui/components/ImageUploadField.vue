<template>
  <div class="image-upload-field">
    <el-upload
      :show-file-list="false"
      :auto-upload="false"
      accept="image/*"
      :on-change="handleChange"
    >
      <el-button type="primary" plain>上传图片</el-button>
    </el-upload>

    <div class="preview-wrap" v-if="modelValue">
      <img :src="modelValue" alt="preview" />
      <el-button text type="danger" @click="$emit('update:modelValue', '')">清除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus';

const props = defineProps<{ modelValue: string }>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function handleChange(file: UploadFile) {
  const raw = file.raw;
  if (!raw) return;

  const reader = new FileReader();
  reader.onload = () => {
    emit('update:modelValue', String(reader.result || ''));
  };
  reader.readAsDataURL(raw);
}
</script>

<style scoped>
.image-upload-field {
  display: grid;
  gap: 10px;
}

.preview-wrap {
  display: grid;
  gap: 8px;
}

.preview-wrap img {
  width: 180px;
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #dbe3ef;
}
</style>
