// API模块 - 处理与后端服务的通信
class APIService {
    constructor() {
        this.baseURL = '/api';
        this.init();
    }

    init() {
        // 初始化API服务
        console.log('API服务已初始化');
    }

    // 食物分析API
    async analyzeFood(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${this.baseURL}/analyze-food`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('食物分析API错误:', error);
            // 返回模拟数据作为fallback
            return this.getMockFoodAnalysis();
        }
    }

    // 手势识别API
    async recognizeGesture(imageData) {
        try {
            const response = await fetch(`${this.baseURL}/recognize-gesture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('手势识别API错误:', error);
            return { gesture: 'none', confidence: 0 };
        }
    }

    // 语音转文字API
    async speechToText(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const response = await fetch(`${this.baseURL}/speech-to-text`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('语音转文字API错误:', error);
            return { text: '语音识别失败', confidence: 0 };
        }
    }

    // 大模型对话API
    async chatWithAI(message, context = null) {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    context: context 
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI对话API错误:', error);
            return { 
                response: '抱歉，AI服务暂时不可用。请稍后再试。',
                context: null 
            };
        }
    }

    // 营养建议API
    async getNutritionAdvice(nutritionData) {
        try {
            const response = await fetch(`${this.baseURL}/nutrition-advice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nutritionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('营养建议API错误:', error);
            return { 
                advice: '建议保持均衡饮食，适量运动。',
                recommendations: []
            };
        }
    }

    // 获取模拟食物分析数据
    getMockFoodAnalysis() {
        const mockFoods = [
            { name: '米饭', confidence: 0.95, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
            { name: '青菜', confidence: 0.88, calories: 15, protein: 1.5, carbs: 3, fat: 0.2 },
            { name: '鸡蛋', confidence: 0.92, calories: 155, protein: 13, carbs: 1.1, fat: 11 },
            { name: '豆腐', confidence: 0.85, calories: 76, protein: 8, carbs: 1.9, fat: 4.8 }
        ];

        const randomFoods = mockFoods.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
        
        const totalNutrition = randomFoods.reduce((total, food) => ({
            calories: total.calories + food.calories,
            protein: total.protein + food.protein,
            carbs: total.carbs + food.carbs,
            fat: total.fat + food.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
            foods: randomFoods.map(food => ({
                name: food.name,
                confidence: food.confidence
            })),
            nutrition: {
                calories: Math.round(totalNutrition.calories),
                protein: Math.round(totalNutrition.protein * 10) / 10,
                carbs: Math.round(totalNutrition.carbs * 10) / 10,
                fat: Math.round(totalNutrition.fat * 10) / 10
            },
            advice: this.generateNutritionAdvice(totalNutrition)
        };
    }

    // 生成营养建议
    generateNutritionAdvice(nutrition) {
        const advices = [];
        
        if (nutrition.calories < 200) {
            advices.push('热量较低，建议增加一些健康的碳水化合物。');
        } else if (nutrition.calories > 600) {
            advices.push('热量较高，注意控制分量。');
        }

        if (nutrition.protein < 10) {
            advices.push('蛋白质含量偏低，建议添加鸡蛋、豆腐或瘦肉。');
        }

        if (nutrition.fat > 20) {
            advices.push('脂肪含量较高，建议选择更清淡的烹饪方式。');
        }

        if (advices.length === 0) {
            advices.push('营养搭配较为均衡，继续保持健康的饮食习惯。');
        }

        return advices.join(' ');
    }

    // 健康状态检查
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('健康检查失败:', error);
            return false;
        }
    }
}

// 全局API服务实例
window.apiService = new APIService();