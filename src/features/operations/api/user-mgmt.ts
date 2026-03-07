import http from '@/services/http';

export type UserType = 'natural' | 'official' | 'robot';

export interface ClientUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  user_type: UserType;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface PostArticle {
  id: number;
  user_id: number;
  title: string;
  cover_image: string;
  content: string;
  is_official: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface HotComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number;
  content: string;
  likes: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface PostCommentItem extends HotComment {
  username?: string;
  nickname?: string;
  user_type?: UserType;
}

export interface CreateClientUserPayload {
  username: string;
  nickname?: string;
  avatar?: string;
  user_type?: UserType;
  status?: number;
}

export interface UpdateClientUserPayload {
  nickname?: string;
  avatar?: string;
  user_type?: UserType;
  status?: number;
}

export interface CreatePostArticlePayload {
  user_id: number;
  title: string;
  cover_image?: string;
  content?: string;
  status?: number;
}

export interface UpdatePostArticlePayload {
  user_id?: number;
  title?: string;
  cover_image?: string;
  content?: string;
  status?: number;
}

export interface CreatePostCommentPayload {
  user_id: number;
  parent_id?: number;
  content: string;
  status?: number;
}

export interface UpdateHotCommentPayload {
  content?: string;
  likes?: number;
  status?: number;
}

const userMgmtAPI = {
  async getClientUsers(userType?: UserType): Promise<{ items: ClientUser[] }> {
    return await http.get('/api/user-mgmt/client-users', {
      params: userType ? { user_type: userType } : undefined
    });
  },

  async createClientUser(payload: CreateClientUserPayload): Promise<ClientUser> {
    return await http.post('/api/user-mgmt/client-users', payload);
  },

  async updateClientUser(id: number, payload: UpdateClientUserPayload): Promise<{ id: number }> {
    return await http.put(`/api/user-mgmt/client-users/${id}`, payload);
  },

  async deleteClientUser(id: number): Promise<void> {
    await http.delete(`/api/user-mgmt/client-users/${id}`);
  },

  async getPostArticles(): Promise<{ items: PostArticle[] }> {
    return await http.get('/api/user-mgmt/post-articles');
  },

  async createPostArticle(payload: CreatePostArticlePayload): Promise<PostArticle> {
    return await http.post('/api/user-mgmt/post-articles', payload);
  },

  async updatePostArticle(id: number, payload: UpdatePostArticlePayload): Promise<{ id: number }> {
    return await http.put(`/api/user-mgmt/post-articles/${id}`, payload);
  },

  async deletePostArticle(id: number): Promise<void> {
    await http.delete(`/api/user-mgmt/post-articles/${id}`);
  },

  async getPostComments(postID: number): Promise<{ items: PostCommentItem[] }> {
    return await http.get(`/api/user-mgmt/post-articles/${postID}/comments`);
  },

  async createPostComment(postID: number, payload: CreatePostCommentPayload): Promise<PostCommentItem> {
    return await http.post(`/api/user-mgmt/post-articles/${postID}/comments`, payload);
  },

  async getHotComments(): Promise<{ items: HotComment[] }> {
    return await http.get('/api/user-mgmt/hot-comments');
  },

  async updateHotComment(id: number, payload: UpdateHotCommentPayload): Promise<{ id: number }> {
    return await http.put(`/api/user-mgmt/hot-comments/${id}`, payload);
  },

  async deleteHotComment(id: number): Promise<void> {
    await http.delete(`/api/user-mgmt/hot-comments/${id}`);
  }
};

export default userMgmtAPI;
