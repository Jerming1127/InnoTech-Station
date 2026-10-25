# 巴士報站 — ESP32-2432S028（CYD）韌體

座枱顯示九巴／城巴實時 ETA。手機經 Wi‑Fi 用 iOS 風格設定頁選站；板子每約 20 秒刷新。

| 項目 | 內容 |
|------|------|
| 硬件 | ESP32-2432S028（ILI9341 240×320、XPT2046、microSD） |
| IDE | Arduino IDE 2.x |
| 板型 | **ESP32 Dev Module** |
| Flash | 4MB |
| 分區 | Default 或 Minimal SPIFFS／LittleFS（預留足夠 app） |
| 電源狀態 | 顯示 **USB**（本板無電池 IC） |

計劃與 API 筆記見上層 `hk-bus-eta-cyd/docs/`。

---

## 1. 安裝函式庫（Arduino Library Manager）

| 函式庫 | 用途 |
|--------|------|
| **TFT_eSPI**（Bodmer） | 螢幕 |
| **XPT2046_Touchscreen**（Paul Stoffregen） | 觸控 |
| **ESP Async WebServer** | 非同步網站（注意選支援 ESP32 的 fork，例如 me-no-dev / ESP32Async） |
| **AsyncTCP** | ESPAsyncWebServer 依賴 |
| **ArduinoJson**（bblanchon，v7） | JSON |
| （內建）FS、LittleFS、SD、WiFi、ESPmDNS、Preferences、HTTPClient、WiFiClientSecure | — |

> ESP32 Arduino core 建議 **2.0.14+** 或 **3.x**（若用 3.x，請確認 AsyncWebServer 相容版本）。

---

## 2. TFT_eSPI 針腳設定（必做）

本專案附上 CYD 設定範本：

`boards/TFT_eSPI_User_Setup_CYD.h`

請將其內容 **覆蓋** 到函式庫內的 `TFT_eSPI/User_Setup.h`，  
或在 `User_Setup_Select.h` 改為 `#include` 此檔並註解其他 setup。

常見 CYD（witnessmenow）針腳：

| 訊號 | GPIO |
|------|------|
| TFT MOSI | 13 |
| TFT SCLK | 14 |
| TFT CS | 15 |
| TFT DC | 2 |
| TFT RST | -1（或板規） |
| TFT BL | 21 |
| TFT MISO | 12 |
| Touch CLK / CS / MOSI / MISO / IRQ | 25 / 33 / 32 / 39 / 36 |
| SD CS / SCK / MISO / MOSI | 5 / 18 / 19 / 23 |

韌體內：TFT_eSPI 用 **HSPI**（`USE_HSPI_PORT`）；觸控與 SD 共用 **VSPI**（不同針腳，開機 SD 後會 `reinitTouchSpi()`）。

---

## 3. 開啟專案與編譯選項

1. 用 Arduino IDE 開啟資料夾 **`hk-bus-eta-cyd`**（資料夾名 = sketch 名）。
2. 工具列：
   - Board: **ESP32 Dev Module**
   - Upload Speed: 921600（不穩可改 460800）
   - Flash Size: **4MB**
   - Partition Scheme: **Default 4MB with spiffs** 或支援 LittleFS 的等效分區
   - PSRAM: Disabled（標準 CYD 無 PSRAM）
3. 連接 USB‑C → 選對 COM 埠 → **上傳**。

首次開機 Serial 115200 會看到 `[MAIN]`／`[WIFI]`／`[UI]` 日誌。螢幕顯示「**巴士報站**」，並短暫觸控測試。

---

## 4. 上傳 LittleFS（設定網頁）

`data/` 內含 `index.html`、`style.css`、`app.js`、`map.html`。

### Arduino IDE 2.x

1. 安裝外掛：**arduino-littlefs-upload**（或社群「LittleFS Data Upload」工具）。
2. 確認 sketch 已開啟且 Board／Port 正確。
3. 指令面板（Ctrl/Cmd+Shift+P）→ **Upload LittleFS to Pico/ESP32**（名稱因外掛而異）。
4. 上傳完成後瀏覽 `http://<板子IP>/` 或 `http://bus-eta.local/`。

若未上傳 data，API 仍可用，首頁會提示補傳。

---

## 5. Wi‑Fi 首次設定

1. 無憑證時板子開 SoftAP：**HK-Bus-Setup**／密碼 **12345678**。
2. 手機連上後開瀏覽器（captive 會導向）進入設定頁。
3. **Wi‑Fi** 頁輸入家用 SSID／密碼 → 儲存；板子改 STA，mDNS 主機名 **`bus-eta`**。
4. 之後於區網開 `http://bus-eta.local/`。
5. **長按螢幕左上角約 3 秒** → 清除 Wi‑Fi 並回到 AP。

---

## 6. microSD 站庫

建議 FAT32。目錄：

```
/bus/stops.csv        # op,id,name_tc,name_en,lat,lng
/bus/route_stop.csv   # op,stop,route,dir,dest_tc
/bus/config.json      # 可選；設定亦存 NVS
```

### 在 PC 建庫

```bash
cd tools
python3 build_stop_db.py --out ./out
# 測試城巴少量：
# python3 build_stop_db.py --out ./out --ctb-limit 5
```

腳本會下載九巴 `/stop`、`/route-stop`，以及城巴「路線 → route-stop → stop/{id}」組裝；遇 HTTP 429 自動退避。完成後把 `out/stops.csv`、`out/route_stop.csv` 拷到卡上 `/bus/`。

無 SD 或無檔案時：搜尋／地圖 API 回空陣列與提示訊息，其餘功能仍可運作（需手動 POST 已知 stop id 的 config）。

---

## 7. 設定頁與 API

頁面：主頁、Wi‑Fi、選站（搜尋＋鄰近 100m）、已選路線、關於；`map.html` 為 Leaflet + OSM（手機外網載圖磚）。

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/status` | 韌體／WiFi／SD／heap |
| GET | `/api/search?q=` | 站名子字串（繁中） |
| GET | `/api/nearby?lat=&lng=&r=100` | 鄰近站＋路線索引 |
| GET | `/api/stops?bbox=w,s,e,n` | GeoJSON（地圖） |
| GET | `/api/config` | 已選路線 JSON |
| POST | `/api/config` | 寫入路線 |
| POST | `/api/wifi` | `{ssid,password}` |
| POST | `/api/wifi/reset` | 清 WiFi |

板載 UI：最多 8 條 — 大路線號、終點、分鐘；底部時間／WiFi／USB／上次更新。STA 且有設定時約每 20s 拉 KMB `stop-eta` 與 CTB `eta/ctb/{stop}/{route}`，聯營以正規化路線號去重並保留最近 ETA。HTTPS 使用 `WiFiClientSecure::setInsecure()`（MVP）。

---

## 8. 原始碼結構

```
hk-bus-eta-cyd/
├── hk-bus-eta-cyd.ino
├── config.h
├── display_ui.h / .cpp
├── wifi_portal.h / .cpp
├── web_server_app.h / .cpp
├── eta_client.h / .cpp
├── stop_db.h / .cpp
├── config_store.h / .cpp
├── data/                 # LittleFS
├── tools/build_stop_db.py
├── boards/TFT_eSPI_User_Setup_CYD.h
└── README.md
```

---

## 9. 已知限制／缺口

- 未內建 CA 校驗（`setInsecure`）；正式環境可改灌根憑證。
- 全港 CTB 建庫需大量 HTTP，請在 PC 跑腳本，勿在 ESP32 上跑。
- 觸控校準為通用值，個別板可能需微調 `display_ui.cpp` 內 `TS_MIN*`／`TS_MAX*`。
- `analogWrite` 背光依 core 版本行為可能不同；不行可改 `ledc`。
- ArduinoJson v6／v7 API 略有差異；本專案以 **v7**（`JsonDocument`）撰寫。
- ESPAsyncWebServer 生態有多個 fork，請選與你的 ESP32 core 相容者。
- 地圖 bbox 跨度限制約 0.08°，避免一次掃全港。

---

## 授權與資料來源

政府開放數據： [九巴 ETA](https://data.gov.hk/tc-data/dataset/hk-td-tis_21-etakmb)、[城巴 ETA](https://data.gov.hk/tc-data/dataset/ctb-eta-transport-realtime-eta)。知識產權屬營辦商；請禮貌輪詢（建議 ≥15–20s）。
