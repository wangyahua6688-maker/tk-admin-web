<template>
  <div class="rich-editor">
    <Toolbar
      class="rich-toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
    />

    <Editor
      class="rich-body"
      v-model="htmlValue"
      :default-config="editorConfig"
      mode="default"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';
import uploadAPI from '@/features/ui/api/upload';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const editorRef = shallowRef<IDomEditor>();
const htmlValue = ref(props.modelValue || '');

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'bold',
    'italic',
    'underline',
    '|',
    'fontSize',
    'color',
    'bgColor',
    '|',
    'head',
    'blockquote',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'insertLink',
    'uploadImage',
    'insertTable',
    '|',
    'undo',
    'redo'
  ]
};

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
        try {
          const resp = await uploadAPI.uploadImage(file);
          insertFn(resp.url, file.name, resp.url);
        } catch (err: any) {
          console.error('富文本编辑器上传图片失败:', err);
        }
      }
    }
  }
};

watch(
  () => props.modelValue,
  (val) => {
    const next = val || '';
    if (next !== htmlValue.value) {
      htmlValue.value = next;
    }
  }
);

watch(htmlValue, (val) => {
  emit('update:modelValue', val || '');
});

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
}

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    editor.destroy();
  }
});
</script>

<style scoped>
.rich-editor {
  width: 100%;
  border: 1px solid #d8e2ef;
  border-radius: 10px;
  overflow: hidden;
}

.rich-toolbar {
  border-bottom: 1px solid #e5ecf5;
}

.rich-body {
  min-height: 320px;
}

.rich-editor :deep(.w-e-text-container) {
  min-height: 280px;
}

.rich-editor :deep(.w-e-bar) {
  flex-wrap: wrap;
}
</style>
