export interface Dish {
  id: string;
  name: string;
  cuisine: string;
  tags: string[];
  allergens: string[];
  description: string;
  emoji: string;
}

export const menuDatabase: Dish[] = [
  { id: '1', name: '麻婆豆腐', cuisine: '川菜', tags: ['辣', '家常'], allergens: [], description: '麻辣鲜香，嫩滑豆腐配牛肉末', emoji: '🌶️' },
  { id: '2', name: '夫妻肺片', cuisine: '川菜', tags: ['辣', '凉菜', '内脏'], allergens: [], description: '麻辣爽口，经典川式凉菜', emoji: '🥩' },
  { id: '3', name: '回锅肉', cuisine: '川菜', tags: ['辣', '肉类'], allergens: [], description: '肥而不腻，蒜苗炒五花肉', emoji: '🥓' },
  { id: '4', name: '鱼香肉丝', cuisine: '川菜', tags: ['辣', '肉类'], allergens: [], description: '酸甜微辣，下饭神器', emoji: '🍖' },
  { id: '5', name: '水煮鱼', cuisine: '川菜', tags: ['辣', '海鲜'], allergens: ['海鲜'], description: '麻辣鲜香，嫩滑鱼片', emoji: '🐟' },
  { id: '6', name: '宫保鸡丁', cuisine: '川菜', tags: ['微辣', '肉类'], allergens: ['花生'], description: '经典川菜，花生鸡丁', emoji: '🍗' },
  { id: '7', name: '白切鸡', cuisine: '粤菜', tags: ['清淡', '肉类'], allergens: [], description: '皮滑肉嫩，原汁原味', emoji: '🍗' },
  { id: '8', name: '清蒸鱼', cuisine: '粤菜', tags: ['清淡', '海鲜'], allergens: ['海鲜'], description: '鲜嫩爽口，保留原味', emoji: '🐠' },
  { id: '9', name: '虾饺', cuisine: '粤菜', tags: ['清淡', '海鲜'], allergens: ['海鲜'], description: '晶莹剔透，鲜虾内馅', emoji: '🦐' },
  { id: '10', name: '叉烧肉', cuisine: '粤菜', tags: ['清淡', '肉类'], allergens: [], description: '蜜汁烤猪肉，甜香可口', emoji: '🥩' },
  { id: '11', name: '番茄炒蛋', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '经典家常，酸甜可口', emoji: '🍅' },
  { id: '12', name: '清炒时蔬', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '清淡健康，随季节变化', emoji: '🥦' },
  { id: '13', name: '红烧肉', cuisine: '家常菜', tags: ['重口', '肉类'], allergens: [], description: '软糯香甜，经典红烧', emoji: '🍖' },
  { id: '14', name: '蒸蛋', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '嫩滑细腻，老少皆宜', emoji: '🥚' },
  { id: '15', name: '凉拌黄瓜', cuisine: '家常菜', tags: ['清淡', '素食', '凉菜'], allergens: [], description: '清爽解腻，夏日必备', emoji: '🥒' },
  { id: '16', name: '蒜蓉炒菠菜', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '清淡爽口，营养丰富', emoji: '🌿' },
  { id: '17', name: '土豆丝', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '爽脆可口，百吃不厌', emoji: '🥔' },
  { id: '18', name: '韭黄炒蛋', cuisine: '家常菜', tags: ['清淡', '素食'], allergens: [], description: '鲜香美味，简单下饭', emoji: '🥬' },
  { id: '19', name: '锅包肉', cuisine: '东北菜', tags: ['甜', '肉类'], allergens: [], description: '酸甜酥脆，外焦里嫩', emoji: '🍯' },
  { id: '20', name: '小鸡炖蘑菇', cuisine: '东北菜', tags: ['清淡', '肉类'], allergens: [], description: '鲜香浓郁，暖心炖菜', emoji: '🍄' },
  { id: '21', name: '猪肉炖粉条', cuisine: '东北菜', tags: ['重口', '肉类'], allergens: [], description: '软糯入味，东北经典', emoji: '🍜' },
  { id: '22', name: '麻婆豆腐（素）', cuisine: '素菜', tags: ['辣', '素食'], allergens: [], description: '无肉版麻婆豆腐，同样美味', emoji: '🌶️' },
  { id: '23', name: '蒜蓉西兰花', cuisine: '素菜', tags: ['清淡', '素食'], allergens: [], description: '清脆鲜嫩，健康美味', emoji: '🥦' },
  { id: '24', name: '香菇豆腐', cuisine: '素菜', tags: ['清淡', '素食'], allergens: [], description: '鲜香嫩滑，素食首选', emoji: '🍄' },
  { id: '25', name: '地三鲜', cuisine: '素菜', tags: ['家常', '素食'], allergens: [], description: '茄子土豆青椒，经典素菜', emoji: '🍆' },
];
