# 創科站路牌 · 設計 brief（跟 Road Sign Factory 重建）

來源：本機 `/workspace/TrafficSign`（`borderTemplate.js` / `symbolTemplate.js`）+ 用戶 RSF 截圖。  
視覺金樣：`/workspace/hk-transit-home/rsf-reference.html`

---

## 而家錯喺邊（v0.3／舊卡）

- 整體仍似 **SaaS 三欄／扁卡**，唔似香港方向指示牌 stack／gantry
- 出口編號做成 **白底黑字小圓角 badge** → 真牌係 **黑底、白字、白邊**，仲要有 **EXIT＋出** 符號
- 箭咀用 CSS triangle／比例反轉 → 要用 RSF **StackArrow／GantryArrow** path
- 邊框／內距／圓角用固定 px（如 14px、8px）→ 要用 **sw（xHeight÷4）** 比例
- 色碼一度用錯淺藍綠；正確見下表
- 中英排版同字級未跟 Transport／牌面節奏

**結論：唔好再微調 v0.3。請對照 `rsf-reference.html` 整版重建。**

---

## 色碼（平色、無漸變、牌面無霓虹）

| 用途 | Hex | 來源 |
|------|-----|------|
| 藍（一般方向） | `#0033A2` | `BorderColorScheme` Blue = rgb(0,51,162) |
| 綠（快速公路） | `#006928` | Green = rgb(0,105,40) |
| 白底本地 | `#FFFFFF` | White Background |
| 邊／字／箭（深色牌） | `#FFFFFF` | |
| 邊／字／箭（白牌） | `#000000` | |
| 出口牌內底 | `#000000` | `ExitBorderTemplate` 固定 |

深色牌英文：`TransportMedium`；白牌英文：`TransportHeavy`。中文近似：Noto Sans HK／TC Black。

字型檔：`fonts/TransportMedium.woff2`、`fonts/TransportHeavy.woff2`。

---

## Stack 牌比例（單位 sw）

- 邊框寬：**1.5** sw  
- 內距：**左 2.5 / 上 2.5 / 右 2.5 / 下 1.5** sw  
- 外圓角：**3** sw；內背景圓角：**1.5** sw  
- `1 sw = xHeight / 4`（示範可用 `--sw: 9px`～`12px`）

---

## 出口牌解剖（一定要跟）

1. 外框色 = 主牌邊色（藍／綠牌上為白）  
2. 內填 **黑 `#000`**  
3. 白邊 ≈ **0.5** sw；高度約 **6.7** sw；內距約 0.5 / 0.3 / 0.5 / 0  
4. **左**：Exit 符號（白填）＝ **EXIT** 叠 **出**（`symbolsTemplate.Exit`／`Exit1.svg`）  
5. **右**：大號編號（`A1` `A2` `E` `B` 等）Transport Heavy、白字  
6. **禁止**：白底黑字、大圓角 pill、只有字母無 Exit mark

參考圖：用戶藍牌截圖底部「EXIT／出 + 3C」。

---

## 中英次序

- **重建截圖 1／2**：跟原圖（多為英上中下）  
- **創科站導向鈕**：用街牌習慣 **中上英下**  
- 可有白／藍／綠等種類，但結構要同屬 RSF stack／exit／arrow 系統

---

## 箭咀種類

| 符號 | 用途 | Path 來源 |
|------|------|-----------|
| **StackArrow** | 路旁 stack／導向鈕向右／斜向 | `symbolTemplate.js`；角度 −135…135 |
| **GantryArrow** | 架空牌向下（截圖 2 底部） | 同上 |

禁止 CSS `border` triangle。可用 SVG 直接抄 RSF vertex。

---

## 創科站 2×2 建議

| 位置 | 中文 | English | 色 | 出口 |
|------|------|---------|----|------|
| 左上 | 課堂示範 | Classroom | 藍 | A1 |
| 右上 | 互動練習 | Practice | 藍 | A2 |
| 左下 | 教學資源 | Resources | 綠 | E |
| 右下 | 學生作品 | Gallery | 藍 | B |

每牌：左 StackArrow（右向）→ 中 中英字 → 右 **複合出口黑牌**。

---

## 交付動作（給創科）

1. 開 `rsf-reference.html`（瀏覽器）對齊視覺  
2. 用同一套 CSS 變數（`--sw`、色、`.exit-plate`、SVG arrow）重寫主頁 `index.html` / `styles.css`  
3. 交截圖覆核；唔好只改幾個 px／色號交差

本機 RSF app：`cd /workspace/TrafficSign && npm run dev` → http://localhost:3000/design  
完整標準表：`/workspace/road-sign-standards.md`
