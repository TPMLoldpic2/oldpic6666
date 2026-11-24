《城西尋影》V8｜地圖 × 老照片連動版
================================

【這一版的操作邏輯】
1. 一進網站先看到現代街道地圖與八處歷史建築標記。
2. 點歷史標記：地圖下方立即出現老照片縮圖、歷史名稱、暫用的歷史故事文字。
3. 若允許 GPS：立即開始計算「步行」道路路線，成功時在原地圖上畫藍色步行線。
4. 點右上方 GPS：回到玩家與目標的視野，但下方照片卡仍保留。
5. 點「看老照片」：開大圖與完整文字；關掉大圖後回到原本地圖，不重新建立地圖。
6. 進入指定 GPS 範圍：彈出「已到達」；玩家主動按「確認打卡」後才增加護照進度。
7. 有同名 MP4 的景點：打卡後在照片上出現半透明白框「看動圖」。沒影片就不顯示。
8. 地點太靠近、標記擠在一起時會合併成數字群組，點一下放大地圖。

【部署到 GitHub Pages】
把 ZIP 解壓縮，將 index.html、style.css、app.js、images、videos 這幾項
一起上傳到 GitHub Pages 的發佈根目錄，不能只放 index.html。
更新後請用 https://.../index.html?v=8 測試，或開無痕分頁避開舊快取。

【素材檔名】
images/nishi-honganji.jpg
images/ximen-redhouse.jpg
images/new-world-cinema.jpg
images/zhonghua-market.jpg
images/zhongshan-hall.jpg
images/today-department.jpg
images/bopiliao.jpg                 ← 未提供，待補
images/longshan-temple.jpg          ← 未提供，待補

videos/同名.mp4                  ← 可選，沒有就不顯示影片鍵
videos/today-department.mp4         ← 目前唯一有的影片

images/thumbs/ 是為了加速手機上縮圖顯示的額外優化檔。
未來只要放 images/同名.jpg 即可，若沒有對應 thumb 網頁會退回讀取 JPG，
不需要額外產出 WebP。

【故事文字】
目前暫存在 app.js 最上方的 STOPS 陣列中，各處 desc 就是下方歷史介紹。
以後可以改成讀 JSON，不影響地圖、GPS 及播放器架構。

【測試與限制】
• 此 ZIP 已使用模擬 GPS、模擬路由資料測試互動流程，尚未在實際 Samsung / iPhone
  與萬華現地驗證。歷史地點座標和打卡半徑仍屬待現勘資料。
• 現代地圖使用 OpenStreetMap 網路圖磚。圖磚會由瀏覽器正常快取；
  網頁在切換景點、按 GPS 時會重用已載入圖磚，但首次進入新區域仍需要網路下載。
• 目前的路線演算法由 Valhalla 公開示範伺服器以 pedestrian 模式提供。
  它是免費示範、有限流的服務，實際流量大或正式展覽公開營運前，
  需要依使用政策改為合適的正式路線 API 或自建服務。
• 路線伺服器若無回應，畫面不會亂畫直線假裝道路；請使用「外部導航」。
• GPS 在都市高樓附近可能有誤差，應實際調整打卡範圍與安全的站立位置。
• 獎品進度目前存 localStorage，不可用作正式的一次性兌獎防弊系統。
• 北市圖館藏照片若將公開展示或改作 AI 影片，須由主辦方確認授權。
