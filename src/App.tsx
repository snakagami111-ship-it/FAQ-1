import { useState } from 'react';
import { Search, Mail } from 'lucide-react';
import { runQuery } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

// データ構造の型定義 (本来は別ファイルに切り出す)
type Category = {
  id: string;
  name: string;
  status: 'published' | 'coming_soon';
};

// モックデータ
const categories: Category[] = [
  { id: 'tanomu', name: 'TANOMU', status: 'published' },
  { id: 'infomart', name: 'インフォマート', status: 'coming_soon' },
  { id: 'liny', name: 'Liny', status: 'coming_soon' },
  { id: 'hr', name: '人事/総務', status: 'coming_soon' },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('tanomu');
  const [query, setQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!query || isLoading) return;
    
    setIsLoading(true);
    setAiResponse('');
    
    try {
      const response = await runQuery(query, selectedCategory);
      setAiResponse(response);
    } catch (error) {
      console.error(error);
      setAiResponse('エラーが発生しました。もう一度お試しください。');
    }

    setIsLoading(false);
  };

  const handleEscalate = async () => {
    if (!query || !aiResponse) return;

    try {
      const res = await fetch('/api/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          category: selectedCategory,
          aiResponse 
        }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error('Escalation error:', error);
      alert('通知の送信中にエラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">社内FAQ</h1>
          <p className="text-slate-500">AIがあなたの質問にお答えします。</p>
        </header>

        <main>
          {/* カテゴリ選択 */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => cat.status === 'published' && setSelectedCategory(cat.id)}
                disabled={cat.status !== 'published'}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow'
                    : cat.status === 'published'
                    ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}>
                {cat.name}
                {cat.status === 'coming_soon' && <span className="text-xs ml-1.5"> (準備中)</span>}
              </button>
            ))}
          </div>

          {/* 検索窓 */}
          <div className="relative mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="例: 「TANOMU」の請求書の確認方法は？"
              className="w-full pl-12 pr-28 py-3.5 text-lg border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-sm"
            >
              {isLoading ? '検索中...' : 'AIに質問'}
            </button>
          </div>

          {/* 回答表示エリア */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 min-h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : aiResponse ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-slate-400 text-center pt-12">
                <p>質問を入力して「AIに質問」ボタンを押してください。</p>
              </div>
            )}
          </div>

          {/* エスカレーション */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 mb-2">問題が解決しない場合はこちら</p>
            <button 
              onClick={handleEscalate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400"
              disabled={!aiResponse || isLoading}
            >
              <Mail className="w-4 h-4" />
              <span>担当者にメールで質問</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
