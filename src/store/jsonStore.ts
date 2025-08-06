import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryRecord {
  id: string;
  type: 'format' | 'minify' | 'diff';
  input: string;
  output: string;
  timestamp: Date;
  settings?: Record<string, any>;
}

interface JsonState {
  // 历史记录
  history: HistoryRecord[];
  maxHistorySize: number;
  
  // 主题设置
  theme: 'light' | 'dark';
  
  // 格式化设置
  defaultIndent: number;
  
  // 操作方法
  addToHistory: (record: Omit<HistoryRecord, 'id'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDefaultIndent: (indent: number) => void;
}

// LRU策略实现
const addWithLRU = (history: HistoryRecord[], newRecord: HistoryRecord, maxSize: number): HistoryRecord[] => {
  const filtered = history.filter(record => record.id !== newRecord.id);
  const updated = [newRecord, ...filtered];
  
  if (updated.length > maxSize) {
    return updated.slice(0, maxSize);
  }
  
  return updated;
};

export const useJsonStore = create<JsonState>()(
  persist(
    (set, get) => ({
      // 初始状态
      history: [],
      maxHistorySize: 100,
      theme: 'light',
      defaultIndent: 2,
      
      // 添加到历史记录
      addToHistory: (record) => {
        const newRecord: HistoryRecord = {
          ...record,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(record.timestamp)
        };
        
        set((state) => ({
          history: addWithLRU(state.history, newRecord, state.maxHistorySize)
        }));
      },
      
      // 从历史记录中删除
      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter(record => record.id !== id)
        }));
      },
      
      // 清空历史记录
      clearHistory: () => {
        set({ history: [] });
      },
      
      // 设置主题
      setTheme: (theme) => {
        set({ theme });
        // 同时更新document的class以支持Tailwind的dark模式
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      // 设置默认缩进
      setDefaultIndent: (indent) => {
        set({ defaultIndent: indent });
      }
    }),
    {
      name: 'json-tools-storage',
      // 自定义序列化以处理Date对象
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            return {
              ...parsed,
              state: {
                ...parsed.state,
                history: parsed.state.history?.map((record: any) => ({
                  ...record,
                  timestamp: new Date(record.timestamp)
                })) || []
              }
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              history: value.state.history.map((record: HistoryRecord) => ({
                ...record,
                timestamp: record.timestamp.toISOString()
              }))
            }
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name)
      },
      // 部分持久化，排除一些不需要持久化的状态
      partialize: (state) => ({
        history: state.history,
        theme: state.theme,
        defaultIndent: state.defaultIndent,
        maxHistorySize: state.maxHistorySize
      }),
      // 版本控制，用于处理存储结构变更
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 从版本0迁移到版本1的逻辑
          return {
            ...persistedState,
            maxHistorySize: 100
          };
        }
        return persistedState;
      }
    }
  )
);

// 初始化主题
if (typeof window !== 'undefined') {
  const store = useJsonStore.getState();
  if (store.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

// 导出类型
export type { JsonState };