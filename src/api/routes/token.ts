import _ from 'lodash';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import { getTokenLiveStatus, getCredit, tokenSplit } from '@/api/controllers/core.ts';
import logger from '@/lib/logger.ts';

export default {

    prefix: '/token',

    post: {

        '/check': async (request: Request) => {
            request
                .validate('body.token', _.isString)
            const live = await getTokenLiveStatus(request.body.token);
            return {
                live
            }
        },

        '/points': async (request: Request) => {
            request
                .validate('headers.authorization', _.isString)
            // refresh_token切分
            const tokens = tokenSplit(request.headers.authorization);
            
            try {
                const points = await Promise.all(tokens.map(async (token) => {
                    return {
                        token,
                        points: await getCredit(token)
                    }
                }))
                return points;
            } catch (error) {
                logger.error('获取积分失败:', error);
                // 如果获取积分失败，返回一个带有错误信息的默认响应
                return tokens.map(token => ({
                    token,
                    points: {
                        giftCredit: 0,
                        purchaseCredit: 0,
                        vipCredit: 0,
                        totalCredit: 0
                    },
                    error: error.message || '积分获取失败'
                }));
            }
        },

        '/verify-credits': async (request: Request) => {
            request
                .validate('headers.authorization', _.isString)
                .validate('body.giftCredit', _.isNumber)
                .validate('body.purchaseCredit', _.isNumber)
                .validate('body.vipCredit', _.isNumber);
            
            // 手动验证积分的临时接口
            const tokens = tokenSplit(request.headers.authorization);
            const { giftCredit, purchaseCredit, vipCredit } = request.body;
            
            logger.info(`手动验证积分 - 赠送:${giftCredit}, 购买:${purchaseCredit}, VIP:${vipCredit}`);
            
            return tokens.map(token => ({
                token,
                points: {
                    giftCredit,
                    purchaseCredit,
                    vipCredit,
                    totalCredit: giftCredit + purchaseCredit + vipCredit
                },
                verified: true
            }));
        }

    }

}