import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function createServer() {
  const app = express();

  // Viteミドルウェアを適用
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.use(express.json());

  // APIエンドポイント
  app.post('/api/escalate', (req, res) => {
    const { query, category, aiResponse } = req.body;

    // ここでMicrosoft Graph APIなどを利用してメールを送信する
    // 今回はシミュレーションとしてコンソールに出力
    console.log('--- Escalation Email ---');
    console.log(`To: 담당자@example.com`);
    console.log(`Subject: [FAQエスカレーション] カテゴリ: ${category}`);
    console.log(`以下の質問が解決されませんでした。`);
    console.log(`--------------------`);
    console.log(`カテゴリ: ${category}`);
    console.log(`質問: ${query}`);
    console.log(`AIの最終回答: ${aiResponse}`);
    console.log(`--------------------`);
    console.log('管理画面から詳細を確認し、ナレッジを更新してください。');

    res.status(200).json({ message: '担当者への通知が完了しました。' });
  });

  // フロントエンドのフォールバック
  app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
  });
}

createServer();
