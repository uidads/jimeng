import _ from 'lodash';
import Request from '@/lib/request/Request.ts';
import enhanceController from '../controllers/enhance.js';

export default {
    
    prefix: '/v1/enhance',
    
    post: {
        
        '/': async (request: Request) => {
            request
                .validate('body.prompt', _.isString)
            
            return await enhanceController.enhancePrompt(request);
        },
        
        '/test': async (request: Request) => {
            return await enhanceController.testApiConnectivity(request);
        },
        
        '/refine': async (request: Request) => {
            request
                .validate('body.prompt', _.isString)
            
            return await enhanceController.refinePrompt(request);
        }
        
    }
    
} 