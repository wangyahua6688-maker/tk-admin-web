import http from '@/services/http';

export interface UploadResponse {
  url: string;
}

const uploadAPI = {
  /**
   * 上传图片。
   * 使用 multipart/form-data 格式发送文件。
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return await http.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default uploadAPI;
