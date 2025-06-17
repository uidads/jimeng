import _ from 'lodash'
import axios from 'axios'
import Request from '@/lib/request/Request.ts'
import APIException from '@/lib/exceptions/APIException.ts'
import EX from '@/api/consts/exceptions.ts'
import logger from '@/lib/logger.ts'

// 官方DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 针对即梦图片3.0模型优化的系统提示词
const JIMENG_OPTIMIZED_SYSTEM_PROMPT = `你是一位专业的即梦图片3.0模型提示词优化专家，具备深度理解用户创作意图并生成高质量图像描述的能力。

## 即梦模型核心优势理解
1. **真实性** - 擅长生成去卡通化、以假乱真的照片级真实图像，质感自然，AI痕迹极少
2. **高清画质** - 支持专业级电影类型片效果，镜头语言丰富精准  
3. **专业级效果** - 在CG概念、影视级别、商业设计等专业领域表现卓越
4. **精准文字** - 支持多种字体的准确渲染和专业排版设计

## 核心分析思路
<thinking>
1. 通过用户输入的文字分析用户要生成的图片内容和场景
2. 识别用户输入的文字是否在需要生成的图片中显示文字
3. 判断需要补充的视觉细节和专业术语
4. 确保描述逻辑清晰，元素协调
</thinking>

## 优化策略框架

### 场景化优化规则：

**商业设计类**（海报设计、产品图、Logo设计）：
- 强调品牌识别度和商业美学
- 添加专业设计术语（版式、层次、视觉焦点）
- 注重色彩搭配的商业适用性
- 突出产品特色和卖点

**社交媒体类**（小红书图片、头像设计、表情包）：
- 突出真实感和情感共鸣
- 优化人像细节（肌理、表情、氛围）
- 增强社交传播的视觉吸引力
- 符合平台调性和用户喜好

**艺术创作类**（插画、概念艺术、漫画分镜、壁纸）：
- 发挥模型的专业级画面效果
- 丰富艺术表现手法和视觉语言
- 平衡艺术性与技术实现
- 展现独特的创意视角

**品牌视觉类**（IP设计、封面设计）：
- 强调视觉统一性和品牌一致性
- 注重专业性和识别度
- 综合运用模型的所有优势
- 体现品牌价值和文化内涵

### 专业术语库调用：

**摄影技法**：特写、近景、中景、全景、大远景、仰拍、俯拍、侧拍、景深控制、焦外虚化
**光影效果**：自然光、硬光、柔光、环境光、霓虹光、戏剧性光影、逆光、侧光、顶光、底光
**材质细节**：皮肤质感、织物纹理、金属反光、木材纹理、玻璃透明度、哑光质感、磨砂效果
**色彩理论**：色温控制、饱和度调节、对比度、互补色、单色调、渐变过渡、色彩平衡
**构图法则**：黄金分割、三分法则、对称构图、引导线、框架构图、负空间运用

## 文字处理专项规则
- 当识别到需要在图片中显示具体文字内容时，将文字内容用"双引号"包围
- 针对不同字体需求，补充相应的设计风格描述
- 对于多语言文字，特别注明字体兼容性要求
- 重视文字的可读性和设计感的平衡

## 输出优化原则
1. **保持中文表达为主**，专业术语可适当保留原文
2. **结构化描述**：主体→环境→细节→风格→技术参数
3. **避免冗余**：每个描述元素都要有明确的视觉贡献
4. **质量导向**：优先选择能发挥即梦模型优势的描述方式
5. **真实感优先**：充分利用模型的去卡通化和真实感优势

请根据用户提供的原始描述和参数选择，按照以上框架进行智能优化，生成一个能够充分发挥即梦图片3.0模型特点的专业提示词。`

// API连通性测试函数
export const testApiConnectivity = async (request: Request) => {
  try {
    const { apiKey } = request.body;
    
    let testApiKey = apiKey || DEEPSEEK_API_KEY;
    
    if (!testApiKey) {
      return {
        status: 'offline',
        provider: 'DeepSeek官方',
        message: '未配置API Key',
        timestamp: new Date().toISOString()
      };
    }

    // 发送测试请求
    const testStartTime = Date.now();
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Hi'
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${testApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10秒超时
    });

    const responseTime = Date.now() - testStartTime;
    
    return {
      status: 'online',
      provider: 'DeepSeek官方',
      responseTime,
      message: 'API连接正常',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    logger.error('API连通性测试失败:', error);
    
    let errorMessage = 'API连接失败';
    let status = 'offline';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'API请求超时';
      status = 'timeout';
    } else if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      if (statusCode === 401) {
        errorMessage = 'API Key无效或已过期';
        status = 'unauthorized';
      } else if (statusCode === 429) {
        errorMessage = 'API调用频率限制';
        status = 'rate_limited';
      } else if (statusCode >= 500) {
        errorMessage = 'API服务器内部错误';
        status = 'server_error';
      } else {
        errorMessage = `API错误: ${message}`;
        status = 'error';
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'API服务器无法访问';
      status = 'unreachable';
    }

    return {
      status,
      provider: 'DeepSeek官方',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};

// 细化提示词功能
export const refinePrompt = async (request: Request) => {
  try {
    const { prompt, userApiKey } = request.body;
    
    if (!prompt) {
      throw new APIException(EX.API_REQUEST_PARAMS_INVALID, '请提供需要细化的提示词');
    }

    // 确定使用哪个API Key
    let apiKey = userApiKey || DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new APIException(EX.API_REQUEST_PARAMS_INVALID, '未配置DeepSeek API Key');
    }

    logger.info(`使用 DeepSeek官方 API 进行提示词细化`);

    const systemPrompt = JIMENG_OPTIMIZED_SYSTEM_PROMPT;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `请优化这个绘画提示词：${prompt}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const refinedPrompt = response.data.choices[0]?.message?.content?.trim();

    if (!refinedPrompt) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API返回空结果');
    }

    return {
      original: prompt,
      refined: refinedPrompt,
      provider: 'DeepSeek官方'
    };

  } catch (error: any) {
    logger.error('提示词细化失败:', error);
    
    if (error instanceof APIException) {
      throw error;
    }
    
    if (error.response?.status === 401) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API Key无效或已过期');
    } else if (error.response?.status === 429) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API调用频率限制，请稍后重试');
    } else if (error.code === 'ECONNABORTED') {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API请求超时，请稍后重试');
    } else {
      throw new APIException(EX.API_REQUEST_FAILED, `提示词细化失败: ${error.message}`);
    }
  }
};

export const enhancePrompt = async (request: Request) => {
  try {
    const { prompt, scene, style, tone, composition, light, userApiKey } = request.body;
    
    if (!prompt) {
      throw new APIException(EX.API_REQUEST_PARAMS_INVALID, '请提供需要优化的提示词');
    }

    // 确定使用哪个API Key
    let apiKey = userApiKey || DEEPSEEK_API_KEY;

    if (!apiKey) {
      logger.warn('没有可用的API Key，返回原始提示词');
      return {
        original: prompt,
        enhanced: prompt,
        provider: '无API Key'
      };
    }

    logger.info(`使用 DeepSeek官方 API 进行提示词优化`);

    // 构建风格参数信息
    const styleInfo = [];
    if (scene) styleInfo.push(`使用场景：${scene}`);
    if (style) styleInfo.push(`艺术风格：${style}`);
    if (tone) styleInfo.push(`色调要求：${tone}`);
    if (composition) styleInfo.push(`构图方式：${composition}`);
    if (light) styleInfo.push(`光照效果：${light}`);
    
    const styleContext = styleInfo.length > 0 ? `\n\n用户选择的风格参数：\n${styleInfo.join('\n')}` : '';

    const systemPrompt = JIMENG_OPTIMIZED_SYSTEM_PROMPT;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `请优化这个绘画提示词：${prompt}${styleContext}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const enhancedPrompt = response.data.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API返回空结果');
    }

    return {
      original: prompt,
      enhanced: enhancedPrompt,
      provider: 'DeepSeek官方'
    };

  } catch (error: any) {
    logger.error('提示词优化失败:', error);
    
    if (error instanceof APIException) {
      throw error;
    }
    
    if (error.response?.status === 401) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API Key无效或已过期');
    } else if (error.response?.status === 429) {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API调用频率限制，请稍后重试');
    } else if (error.code === 'ECONNABORTED') {
      throw new APIException(EX.API_REQUEST_FAILED, 'DeepSeek API请求超时，请稍后重试');
    } else {
      throw new APIException(EX.API_REQUEST_FAILED, `提示词优化失败: ${error.message}`);
    }
  }
};

export default {
  enhancePrompt,
  testApiConnectivity,
  refinePrompt
} 