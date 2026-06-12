// global types

// 百度地图GL版本全局类型声明
/// <reference types="bmapgl" />

declare var pendo: {
  identify: (options: object) => void;
  clearSession: () => void;
  trackAgent: (eventType: string, metadata: object) => void;
  [key: string]: any;
};
