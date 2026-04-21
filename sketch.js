let capture;
let pg;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 取得攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏 p5.js 預設產生的 HTML 影片元素，讓我們只將畫面繪製在畫布上
  capture.hide(); 
  
  // 設定影像繪製模式為「中心點」，方便後續將影像置中
  imageMode(CENTER);

  // 建立圖形緩衝區 (Graphics) 先給予預設長寬
  pg = createGraphics(640, 480);
}

function draw() {
  // 設定畫布背景顏色
  background('#e7c6ff');
  
  // 計算全螢幕寬高 60% 的尺寸
  let imgW = width * 0.6;
  let imgH = height * 0.6;
  
  // 確保 pg 的解析度與攝影機的實際解析度保持同步
  if (capture.width > 0 && (pg.width !== capture.width || pg.height !== capture.height)) {
    pg.resizeCanvas(capture.width, capture.height);
  }

  // --- 在 pg 上繪製你要疊加的內容 ---
  pg.clear(); // 重要：每一幀都清除背景，保持圖層透明
  
  // 載入攝影機的像素資料以供讀取
  capture.loadPixels();
  if (capture.pixels.length > 0) {
    let step = 20; // 單位大小 20x20
    pg.noStroke();
    pg.fill('#00ff00'); // 文字顏色使用亮綠色，較容易在畫面中辨識
    pg.textSize(9);     // 配合 20px 單位，設定適當的文字大小
    pg.textAlign(CENTER, CENTER);

    for (let y = 0; y < capture.height; y += step) {
      for (let x = 0; x < capture.width; x += step) {
        // 計算 1D 像素陣列的索引值 (每個像素有 R, G, B, A 四個值)
        let index = (y * capture.width + x) * 4;
        let r = capture.pixels[index];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];
        
        // 計算 RGB 的平均值，並去掉小數點
        let avg = floor((r + g + b) / 3);
        
        // 因為整個 pg 稍後會被水平翻轉，為了讓文字保持正向可讀
        // 我們在繪製文字時先進行一次區域性的水平翻轉
        pg.push();
        pg.translate(x + step / 2, y + step / 2);
        pg.scale(-1, 1);
        pg.text(avg, 0, 0);
        pg.pop();
      }
    }
  }
  // -----------------------------

  // 解決左右顛倒的問題：利用 push/pop 隔離畫布變形狀態
  push();
  translate(width / 2, height / 2); // 將座標原點移動到畫面正中間
  scale(-1, 1); // 進行水平翻轉（X 軸乘以 -1）
  // 因為原點已移至中心，且有設定 imageMode(CENTER)，所以座標直接設為 (0, 0)
  image(capture, 0, 0, imgW, imgH);
  // 將圖形緩衝區 pg 也繪製出來，就能完美疊加在視訊上方
  image(pg, 0, 0, imgW, imgH);
  pop();
}

// 當使用者改變瀏覽器視窗大小時，自動重新調整畫布大小，維持全螢幕與比例
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
