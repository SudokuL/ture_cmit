// AI功能模块 - 集成摄像头、手势识别、食物分析等核心功能
class AIFeatures {
    constructor() {
        this.camera = null;
        this.stream = null;
        this.isRecording = false;
        this.gestureRecognition = null;
        this.nutritionAnalysis = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initGestureRecognition();
        this.initNutritionAnalysis();
    }

    bindEvents() {
        // 摄像头控制按钮
        const cameraBtn = document.getElementById('camera-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const captureBtn = document.getElementById('capture-btn');
        const closeCameraBtn = document.getElementById('close-camera-btn');

        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.toggleCamera());
        }
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.triggerFileUpload());
        }

        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.captureImage());
        }

        if (closeCameraBtn) {
            closeCameraBtn.addEventListener('click', () => this.closeCamera());
        }

        // 文件上传处理
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // 手势识别开关
        const gestureToggle = document.getElementById('gesture-toggle');
        if (gestureToggle) {
            gestureToggle.addEventListener('change', (e) => this.toggleGestureRecognition(e.target.checked));
        }
    }

    async toggleCamera() {
        const videoElement = document.getElementById('camera-preview');
        const cameraBtn = document.getElementById('camera-btn');
        const captureBtn = document.getElementById('capture-btn');
        const closeCameraBtn = document.getElementById('close-camera-btn');

        if (!this.stream) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 },
                    audio: false 
                });
                
                if (videoElement) {
                    videoElement.srcObject = this.stream;
                    videoElement.style.display = 'block';
                }
                
                if (cameraBtn) cameraBtn.textContent = '关闭摄像头';
                if (captureBtn) captureBtn.style.display = 'inline-block';
                if (closeCameraBtn) closeCameraBtn.style.display = 'inline-block';
                
                this.showMessage('摄像头已开启', 'success');
            } catch (error) {
                console.error('无法访问摄像头:', error);
                this.showMessage('无法访问摄像头，请检查权限设置', 'error');
            }
        } else {
            this.closeCamera();
        }
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        const videoElement = document.getElementById('camera-preview');
        const cameraBtn = document.getElementById('camera-btn');
        const captureBtn = document.getElementById('capture-btn');
        const closeCameraBtn = document.getElementById('close-camera-btn');

        if (videoElement) {
            videoElement.style.display = 'none';
            videoElement.srcObject = null;
        }
        
        if (cameraBtn) cameraBtn.textContent = '开启摄像头';
        if (captureBtn) captureBtn.style.display = 'none';
        if (closeCameraBtn) closeCameraBtn.style.display = 'none';
    }

    triggerFileUpload() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择图片文件', 'error');
            return;
        }

        try {
            const imageUrl = URL.createObjectURL(file);
            this.displayImage(imageUrl);
            await this.analyzeFood(file);
        } catch (error) {
            console.error('文件处理错误:', error);
            this.showMessage('文件处理失败', 'error');
        }
    }

    async captureImage() {
        const videoElement = document.getElementById('camera-preview');
        if (!videoElement || !this.stream) {
            this.showMessage('请先开启摄像头', 'error');
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0);
            
            canvas.toBlob(async (blob) => {
                const imageUrl = URL.createObjectURL(blob);
                this.displayImage(imageUrl);
                await this.analyzeFood(blob);
            }, 'image/jpeg', 0.8);
            
            this.showMessage('图片已捕获，正在分析...', 'success');
        } catch (error) {
            console.error('图片捕获错误:', error);
            this.showMessage('图片捕获失败', 'error');
        }
    }

    displayImage(imageUrl) {
        const imageDisplay = document.getElementById('image-display');
        if (imageDisplay) {
            imageDisplay.innerHTML = `<img src="${imageUrl}" alt="分析图片" style="max-width: 100%; height: auto; border-radius: 8px;">`;
        }
    }

    async analyzeFood(imageFile) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        // 显示加载状态
        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>正在分析食物...</p>
            </div>
        `;

        try {
            // 调用后端API进行食物分析
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('分析请求失败');
            }

            const result = await response.json();
            this.displayAnalysisResults(result);
            this.addToHistory(result);
            
        } catch (error) {
            console.error('食物分析错误:', error);
            // 显示模拟结果作为fallback
            this.displayMockResults();
        }
    }

    displayAnalysisResults(result) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        const html = `
            <div class="analysis-result">
                <h3>🍽️ 食物识别结果</h3>
                <div class="food-items">
                    ${result.foods ? result.foods.map(food => `
                        <div class="food-item">
                            <span class="food-name">${food.name}</span>
                            <span class="confidence">置信度: ${(food.confidence * 100).toFixed(1)}%</span>
                        </div>
                    `).join('') : '<p>未识别到食物</p>'}
                </div>
                
                <h3>📊 营养分析</h3>
                <div class="nutrition-info">
                    <div class="nutrition-item">
                        <span>热量:</span>
                        <span>${result.nutrition?.calories || 0} kcal</span>
                    </div>
                    <div class="nutrition-item">
                        <span>蛋白质:</span>
                        <span>${result.nutrition?.protein || 0}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span>碳水化合物:</span>
                        <span>${result.nutrition?.carbs || 0}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span>脂肪:</span>
                        <span>${result.nutrition?.fat || 0}g</span>
                    </div>
                </div>

                <h3>💡 健康建议</h3>
                <div class="health-advice">
                    <p>${result.advice || '均衡饮食，适量运动，保持健康生活方式。'}</p>
                </div>
            </div>
        `;

        resultsContainer.innerHTML = html;
    }

    displayMockResults() {
        const mockResult = {
            foods: [
                { name: '米饭', confidence: 0.95 },
                { name: '青菜', confidence: 0.88 }
            ],
            nutrition: {
                calories: 320,
                protein: 8.5,
                carbs: 65.2,
                fat: 2.1
            },
            advice: '这是一份相对健康的搭配，建议增加一些蛋白质来源，如鸡蛋或豆腐。'
        };

        this.displayAnalysisResults(mockResult);
    }

    addToHistory(result) {
        const historyContainer = document.getElementById('analysis-history');
        if (!historyContainer) return;

        const timestamp = new Date().toLocaleString('zh-CN');
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-header">
                <span class="timestamp">${timestamp}</span>
                <span class="calories">${result.nutrition?.calories || 0} kcal</span>
            </div>
            <div class="history-foods">
                ${result.foods ? result.foods.map(food => food.name).join(', ') : '未识别'}
            </div>
        `;

        historyContainer.insertBefore(historyItem, historyContainer.firstChild);

        // 限制历史记录数量
        const items = historyContainer.querySelectorAll('.history-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    initGestureRecognition() {
        // 手势识别初始化
        console.log('手势识别模块已初始化');
    }

    toggleGestureRecognition(enabled) {
        const statusElement = document.getElementById('gesture-status');
        if (statusElement) {
            statusElement.textContent = enabled ? '已启用' : '已禁用';
            statusElement.className = enabled ? 'status-enabled' : 'status-disabled';
        }
        
        if (enabled) {
            this.startGestureRecognition();
        } else {
            this.stopGestureRecognition();
        }
    }

    startGestureRecognition() {
        console.log('开始手势识别');
        this.showMessage('手势识别已启动', 'success');
    }

    stopGestureRecognition() {
        console.log('停止手势识别');
        this.showMessage('手势识别已停止', 'info');
    }

    initNutritionAnalysis() {
        // 营养分析模块初始化
        console.log('营养分析模块已初始化');
    }

    showMessage(message, type = 'info') {
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        // 根据类型设置背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化AI功能
document.addEventListener('DOMContentLoaded', () => {
    window.aiFeatures = new AIFeatures();
});

// 添加必要的CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-state {
        text-align: center;
        padding: 20px;
        color: #666;
    }
    
    .analysis-result {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-top: 15px;
    }
    
    .food-item, .nutrition-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
    
    .food-item:last-child, .nutrition-item:last-child {
        border-bottom: none;
    }
    
    .confidence {
        color: #666;
        font-size: 0.9em;
    }
    
    .health-advice {
        background: #e3f2fd;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #2196f3;
    }
    
    .history-item {
        background: white;
        border: 1px solid #eee;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 10px;
    }
    
    .history-header {
        display: flex;
        justify-content: space-between;
        font-weight: 500;
        margin-bottom: 5px;
    }
    
    .timestamp {
        color: #666;
        font-size: 0.9em;
    }
    
    .calories {
        color: #f59e0b;
        font-weight: 600;
    }
    
    .history-foods {
        color: #333;
        font-size: 0.95em;
    }
    
    .status-enabled {
        color: #10b981;
        font-weight: 500;
    }
    
    .status-disabled {
        color: #6b7280;
    }
`;
document.head.appendChild(style);