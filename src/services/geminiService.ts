import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function runQuery(query: string, category: string): Promise<string> {
  const model = "gemini-3-pro-preview";

  const prompt = `
    あなたは日本の企業で利用される社内FAQシステムのAIアシスタントです。
    
    以下の情報に基づいて、質問に対して回答を生成してください。
    - 質問カテゴリ: 「${category}」
    - 質問文: 「${query}」

    制約条件:
    - 社内マニュアルに記載されているような、正確で信頼性の高い情報源に基づいているかのように振る舞ってください。
    - 丁寧語（ですます調）を使用し、プロフェッショナルなトーンを維持してください。
    - 回答は簡潔かつ明確に、箇条書きなどを用いて分かりやすく構成してください。
    - 回答の最後には、関連する可能性のある社内マニュアルの参照先（例: `[参照: 請求書処理マニュアル p.5](https://example.com/docs/billing#p5)`）をMarkdown形式で追記してください。
    - 情報が不明な場合は、憶測で回答せず、「申し訳ありませんが、その質問に関する情報は見つかりませんでした。担当部署へお問い合わせください。」と回答してください。
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{role: 'user', parts: [{text: prompt}]}],
    });
    return response.text ?? "回答を生成できませんでした。";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "AIの応答取得中にエラーが発生しました。しばらくしてからもう一度お試しください。";
  }
}
