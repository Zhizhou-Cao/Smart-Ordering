export const STORAGE_KEYS = {
  userPreferences: 'USER_PREFERENCES',
  friends: 'FRIENDS',
} as const;

export type TasteOption = '清淡' | '微辣' | '中辣' | '重辣' | '不限';

export type DietOption = '无限制' | '素食' | '清真' | '低卡减脂';

export type AllergyOption = '海鲜' | '花生' | '坚果' | '乳制品' | '无';

export type BasePreference = {
  taste: TasteOption[];
  diet: DietOption[];
  allergies: AllergyOption[];
  dislike: string;
  notes: string;
};

export type UserPreferences = BasePreference & {
  nickname: string;
};

export type FriendProfile = BasePreference & {
  id: string;
  name: string;
};

