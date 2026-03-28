import http from '@/services/http';

export interface BannerItem {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  type: string;
  position: string;
  positions: string;
  jump_type: string;
  jump_post_id: number;
  jump_url: string;
  content_html: string;
  status: number;
  sort: number;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BroadcastItem {
  id: number;
  title: string;
  content: string;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface SpecialLotteryItem {
  id: number;
  name: string;
  code: string;
  current_issue: string;
  next_draw_at: string;
  live_enabled: number;
  live_status: string;
  live_stream_url: string;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface LotteryInfoItem {
  id: number;
  special_lottery_id: number;
  category_id: number;
  category_name?: string;
  category_tag: string;
  issue: string;
  year: number;
  title: string;
  cover_image_url: string;
  detail_image_url: string;
  draw_code: string;
  normal_draw_result: string;
  special_draw_result: string;
  draw_result: string;
  draw_at: string;
  playback_url: string;
  likes_count: number;
  comment_count: number;
  favorite_count: number;
  read_count: number;
  poll_enabled: number;
  poll_default_expand: number;
  recommend_info_ids: string;
  is_current: number;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface DrawRecordItem {
  id: number;
  special_lottery_id: number;
  issue: string;
  year: number;
  draw_at: string;
  normal_draw_result: string;
  special_draw_result: string;
  draw_result: string;
  draw_labels: string;
  color_labels: string;
  zodiac_labels: string;
  wuxing_labels: string;
  playback_url: string;
  special_single_double: string;
  special_big_small: string;
  sum_single_double: string;
  sum_big_small: string;
  recommend_six: string;
  recommend_four: string;
  recommend_one: string;
  recommend_ten: string;
  special_code: string;
  normal_code: string;
  zheng1: string;
  zheng2: string;
  zheng3: string;
  zheng4: string;
  zheng5: string;
  zheng6: string;
  is_current: number;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface LotteryCategoryItem {
  id: number;
  category_key: string;
  name: string;
  search_keywords: string;
  show_on_home: number;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface OfficialPostItem {
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

export interface ExternalLinkItem {
  id: number;
  name: string;
  url: string;
  position: string;
  icon_url: string;
  group_key: string;
  status: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomePopupItem {
  id: number;
  title: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  position: string;
  show_once: number;
  status: number;
  sort: number;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SMSChannelItem {
  id: number;
  provider: string;
  channel_name: string;
  access_key: string;
  access_secret: string;
  endpoint: string;
  sign_name: string;
  template_code_login: string;
  template_code_register: string;
  daily_limit: number;
  minute_limit: number;
  code_ttl_seconds: number;
  mock_mode: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface BannerPayload {
  title: string;
  image_url: string;
  link_url?: string;
  type: string;
  positions: string[];
  jump_type: 'none' | 'post' | 'external' | 'custom';
  jump_post_id?: number;
  jump_url?: string;
  content_html?: string;
  status?: number;
  sort?: number;
  start_at?: string;
  end_at?: string;
}

export interface BroadcastPayload {
  title: string;
  content: string;
  status?: number;
  sort?: number;
}

export interface SpecialLotteryPayload {
  name: string;
  code: string;
  current_issue?: string;
  next_draw_at?: string;
  live_enabled?: number;
  live_status?: string;
  live_stream_url?: string;
  status?: number;
  sort?: number;
}

export interface LotteryInfoPayload {
  special_lottery_id?: number;
  category_id: number;
  category_tag?: string;
  issue: string;
  year?: number;
  title: string;
  cover_image_url?: string;
  detail_image_url?: string;
  draw_code?: string;
  normal_draw_result?: string;
  special_draw_result?: string;
  draw_result?: string;
  draw_at?: string;
  playback_url?: string;
  likes_count?: number;
  comment_count?: number;
  favorite_count?: number;
  read_count?: number;
  poll_enabled?: number;
  poll_default_expand?: number;
  recommend_info_ids?: string;
  option_names?: string[];
  is_current?: number;
  status?: number;
  sort?: number;
}

export interface DrawRecordPayload {
  special_lottery_id: number;
  issue: string;
  year?: number;
  draw_at?: string;
  normal_draw_result?: string;
  special_draw_result?: string;
  draw_result?: string;
  draw_labels?: string;
  color_labels?: string;
  zodiac_labels?: string;
  wuxing_labels?: string;
  playback_url?: string;
  special_single_double?: string;
  special_big_small?: string;
  sum_single_double?: string;
  sum_big_small?: string;
  recommend_six?: string;
  recommend_four?: string;
  recommend_one?: string;
  recommend_ten?: string;
  special_code?: string;
  normal_code?: string;
  zheng1?: string;
  zheng2?: string;
  zheng3?: string;
  zheng4?: string;
  zheng5?: string;
  zheng6?: string;
  is_current?: number;
  status?: number;
  sort?: number;
}

export interface LotteryCategoryPayload {
  category_key: string;
  name: string;
  search_keywords?: string;
  show_on_home?: number;
  status?: number;
  sort?: number;
}

export interface OfficialPostPayload {
  user_id: number;
  title: string;
  cover_image?: string;
  content?: string;
  status?: number;
}

export interface ExternalLinkPayload {
  name: string;
  url: string;
  position: string;
  icon_url?: string;
  group_key?: string;
  status?: number;
  sort?: number;
}

export interface HomePopupPayload {
  title: string;
  content?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  position?: string;
  show_once?: number;
  status?: number;
  sort?: number;
  start_at?: string;
  end_at?: string;
}

export interface SMSChannelPayload {
  provider: string;
  channel_name: string;
  access_key?: string;
  access_secret?: string;
  endpoint?: string;
  sign_name?: string;
  template_code_login?: string;
  template_code_register?: string;
  daily_limit?: number;
  minute_limit?: number;
  code_ttl_seconds?: number;
  mock_mode?: number;
  status?: number;
}

const bizConfigAPI = {
  async getBanners(type?: string): Promise<{ items: BannerItem[] }> {
    return await http.get('/api/biz-config/banners', {
      params: type ? { type } : undefined
    });
  },
  async createBanner(payload: BannerPayload): Promise<BannerItem> {
    return await http.post('/api/biz-config/banners', payload);
  },
  async updateBanner(id: number, payload: Partial<BannerPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/banners/${id}`, payload);
  },
  async deleteBanner(id: number): Promise<void> {
    await http.delete(`/api/biz-config/banners/${id}`);
  },

  async getBroadcasts(): Promise<{ items: BroadcastItem[] }> {
    return await http.get('/api/biz-config/broadcasts');
  },
  async createBroadcast(payload: BroadcastPayload): Promise<BroadcastItem> {
    return await http.post('/api/biz-config/broadcasts', payload);
  },
  async updateBroadcast(id: number, payload: Partial<BroadcastPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/broadcasts/${id}`, payload);
  },
  async deleteBroadcast(id: number): Promise<void> {
    await http.delete(`/api/biz-config/broadcasts/${id}`);
  },

  async getSpecialLotteries(): Promise<{ items: SpecialLotteryItem[] }> {
    return await http.get('/api/biz-config/special-lotteries');
  },
  async createSpecialLottery(payload: SpecialLotteryPayload): Promise<SpecialLotteryItem> {
    return await http.post('/api/biz-config/special-lotteries', payload);
  },
  async updateSpecialLottery(id: number, payload: Partial<SpecialLotteryPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/special-lotteries/${id}`, payload);
  },
  async deleteSpecialLottery(id: number): Promise<void> {
    await http.delete(`/api/biz-config/special-lotteries/${id}`);
  },

  async getLotteryInfos(): Promise<{ items: LotteryInfoItem[]; option_names_by_info_id?: Record<string, string[]> }> {
    return await http.get('/api/biz-config/lottery-infos');
  },
  async createLotteryInfo(payload: LotteryInfoPayload): Promise<LotteryInfoItem> {
    return await http.post('/api/biz-config/lottery-infos', payload);
  },
  async updateLotteryInfo(id: number, payload: Partial<LotteryInfoPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/lottery-infos/${id}`, payload);
  },
  async deleteLotteryInfo(id: number): Promise<void> {
    await http.delete(`/api/biz-config/lottery-infos/${id}`);
  },

  async getDrawRecords(params?: { special_lottery_id?: number; keyword?: string; limit?: number }): Promise<{ items: DrawRecordItem[] }> {
    return await http.get('/api/biz-config/draw-records', {
      params
    });
  },
  async createDrawRecord(payload: DrawRecordPayload): Promise<DrawRecordItem> {
    return await http.post('/api/biz-config/draw-records', payload);
  },
  async updateDrawRecord(id: number, payload: Partial<DrawRecordPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/draw-records/${id}`, payload);
  },
  async deleteDrawRecord(id: number): Promise<void> {
    await http.delete(`/api/biz-config/draw-records/${id}`);
  },

  async getLotteryCategories(keyword?: string): Promise<{ items: LotteryCategoryItem[] }> {
    return await http.get('/api/biz-config/lottery-categories', {
      params: keyword && keyword.trim() ? { keyword: keyword.trim() } : undefined
    });
  },
  async createLotteryCategory(payload: LotteryCategoryPayload): Promise<LotteryCategoryItem> {
    return await http.post('/api/biz-config/lottery-categories', payload);
  },
  async updateLotteryCategory(id: number, payload: Partial<LotteryCategoryPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/lottery-categories/${id}`, payload);
  },
  async deleteLotteryCategory(id: number): Promise<void> {
    await http.delete(`/api/biz-config/lottery-categories/${id}`);
  },

  async getOfficialPosts(): Promise<{ items: OfficialPostItem[] }> {
    return await http.get('/api/biz-config/official-posts');
  },
  async createOfficialPost(payload: OfficialPostPayload): Promise<OfficialPostItem> {
    return await http.post('/api/biz-config/official-posts', payload);
  },
  async updateOfficialPost(id: number, payload: Partial<OfficialPostPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/official-posts/${id}`, payload);
  },
  async deleteOfficialPost(id: number): Promise<void> {
    await http.delete(`/api/biz-config/official-posts/${id}`);
  },

  async getExternalLinks(): Promise<{ items: ExternalLinkItem[] }> {
    return await http.get('/api/biz-config/external-links');
  },
  async createExternalLink(payload: ExternalLinkPayload): Promise<ExternalLinkItem> {
    return await http.post('/api/biz-config/external-links', payload);
  },
  async updateExternalLink(id: number, payload: Partial<ExternalLinkPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/external-links/${id}`, payload);
  },
  async deleteExternalLink(id: number): Promise<void> {
    await http.delete(`/api/biz-config/external-links/${id}`);
  },

  async getHomePopups(params?: { position?: string }): Promise<{ items: HomePopupItem[] }> {
    return await http.get('/api/biz-config/home-popups', {
      params
    });
  },
  async createHomePopup(payload: HomePopupPayload): Promise<HomePopupItem> {
    return await http.post('/api/biz-config/home-popups', payload);
  },
  async updateHomePopup(id: number, payload: Partial<HomePopupPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/home-popups/${id}`, payload);
  },
  async deleteHomePopup(id: number): Promise<void> {
    await http.delete(`/api/biz-config/home-popups/${id}`);
  },

  async getSMSChannels(params?: { status?: number }): Promise<{ items: SMSChannelItem[] }> {
    return await http.get('/api/biz-config/sms-channels', {
      params
    });
  },
  async createSMSChannel(payload: SMSChannelPayload): Promise<SMSChannelItem> {
    return await http.post('/api/biz-config/sms-channels', payload);
  },
  async updateSMSChannel(id: number, payload: Partial<SMSChannelPayload>): Promise<{ id: number }> {
    return await http.put(`/api/biz-config/sms-channels/${id}`, payload);
  },
  async deleteSMSChannel(id: number): Promise<void> {
    await http.delete(`/api/biz-config/sms-channels/${id}`);
  }
};

export default bizConfigAPI;
