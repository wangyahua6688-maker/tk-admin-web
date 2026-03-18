<template>
  <div class="image-upload-field">
    <el-upload
      :show-file-list="false"
      :auto-upload="false"
      accept="image/*"
      :on-change="handleChange"
      :disabled="uploading"
    >
      <el-button type="primary" plain :loading="uploading">上传图片</el-button>
    </el-upload>

    <div class="preview-wrap" v-if="modelValue">
      <img :src="modelValue" alt="preview" />
      <el-button text type="danger" @click="$emit('update:modelValue', '')">清除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import uploadAPI from '@/features/ui/api/upload';

const props = defineProps<{ modelValue: string }>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const uploading = ref(false);

async function handleChange(file: UploadFile) {
  const raw = file.raw;
  if (!raw) return;

  uploading.value = true;
  try {
    const resp = await uploadAPI.uploadImage(raw as File);
    emit('update:modelValue', resp.url);
    ElMessage.success('图片上传成功');
  } catch (err: any) {
    ElMessage.error(err.message || '图片上传失败');
  } finally {
    uploading.value = false;
  }
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
