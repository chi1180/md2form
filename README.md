# md2form Playground

Markdown でフォーム定義を書き、リアルタイムでフォーム UI をプレビューできる Next.js アプリです。  
`md2form` パーサーを使って、テキスト入力から選択式、評価系、アップロード、署名まで幅広いフィールドを試せます。

## 主な機能

- Markdown エディタとフォームプレビューの 2 ペイン表示
- `#type` を中心とした入力補完（候補選択、テンプレート挿入）
- Markdown 変更時のデバウンス付きリアルタイムパース
- 複数ページフォームのプレビューと進捗表示
- 送信時ペイロードを JSON で確認できるダイアログ
- ライト/ダークテーマ切り替え

## 技術スタック

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- `md2form` (Markdown -> Form 変換)
- `next-themes` / `sonner` / `react-syntax-highlighter`

## セットアップ

```bash
npm install
npm run dev
```

### Supabase環境変数

フォーム管理・公開回答機能を使う場合は、`.env.example` をコピーして `.env.local` を作成し、以下を設定してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`

設定例:

```bash
cp .env.example .env.local
```

`/forms` や `/f/[slug]` を使う場合は必須です。  
プレイグラウンドのみ利用する場合は未設定でも起動できます。

有料プラン機能を使う場合は、Stripe Dashboard 側で `price` と Webhook endpoint を作成してから上記の Stripe 環境変数を設定してください。

起動後、`http://localhost:3000` にアクセスします。  
プレイグラウンドは `http://localhost:3000/playground` です。

## npm scripts

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run start`: 本番サーバー起動
- `npm run lint`: ESLint 実行

## Markdown 記述の基本

```md
---
collectEmail: true
allowMultipleResponses: false
limitResponses: 500
showProgressBar: true
shuffleQuestions: false
responseReceipt: whenRequested
themeColor: "#2563EB"
backgroundImage: mountain
font: "Noto Sans JP, sans-serif"
---

# フォームタイトル

フォームの説明文

### 氏名
#type short_text
#placeholder "山田 太郎"
#required true
#maxLength 60

---

### 興味のある技術
#type checkbox
#options "TypeScript","React","Node.js"
#required true
#minSelected 1
```

## サポートしている `#type`

- `short_text`, `long_text`, `email`, `phone`, `number`
- `dropdown`, `radio`, `checkbox`, `boolean`
- `date`, `time`
- `rating`, `likert`, `matrix`, `scale`
- `file_upload`, `signature`
- `image`, `video`, `section_header`

## ディレクトリ構成（主要）

- `app/page.tsx`: トップページ
- `app/playground/page.tsx`: プレイグラウンド本体
- `components/markdown-editor.tsx`: Markdown エディタと補完
- `components/form-renderer.tsx`: フォームレンダリングと送信処理
- `components/form-elements/*`: 各フィールド UI 実装
- `lib/md2form-autocomplete.ts`: 補完候補・テンプレート定義
- `lib/CONFIG.ts`: デフォルト frontmatter 定義

## 補足

このリポジトリは `md2form` の機能を素早く検証するための実装です。  
実サービスへ組み込む場合は、バリデーション、永続化、認証、送信先 API を用途に合わせて追加してください。
