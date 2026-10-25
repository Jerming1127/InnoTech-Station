# HK Bus ETA CYD — Web Flasher 1.4.7

## 內容
- `index.html` — 一鍵燒錄頁（ESP Web Tools）
- `manifest.json` — 韌體清單（offsets）
- `firmware/` — bootloader / partitions / boot_app0 / app / littlefs
- `firmware/merged-4mb-with-littlefs.bin` — 完整 4MB 映像（含 LittleFS，給 esptool 離線用）

## 分區偏移（Arduino min_spiffs / 4MB）
| 檔案 | Offset |
|------|--------|
| bootloader.bin | 0x1000 |
| partitions.bin | 0x8000 |
| boot_app0.bin | 0xe000 |
| app.bin | 0x10000 |
| littlefs.bin | 0x3D0000（size 0x20000）|

## 如何放到創科網站
1. 把整個 `web-flasher/` 資料夾上傳到網站（例如 `/flash/` 或 `/download/web-flasher/`）。
2. **必須用 HTTPS**（或本機 `localhost`）開啟；HTTP 一般網域無法使用 Web Serial。
3. 使用者用 **Chrome／Edge** → 接 USB → 開該頁 → 按「一鍵燒錄」。

## 本機測試
```bash
# 在 web-flasher 目錄
npx --yes serve -p 5500
# 開 http://localhost:5500
```

## 離線 esptool（可選）
```bash
esptool.py --chip esp32 --port COMx write_flash 0x0 firmware/merged-4mb-with-littlefs.bin
```
