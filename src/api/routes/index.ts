import fs from 'fs-extra';
import path from 'path';

import Response from '@/lib/response/Response.ts';
import images from "./images.ts";
import chat from "./chat.ts";
import ping from "./ping.ts";
import token from './token.js';
import models from './models.ts';
import enhance from './enhance.ts';

export default [
    {
        get: {
            '/': async () => {
                const content = await fs.readFile('public/dream/index.html');
                return new Response(content, {
                    type: 'html',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
            },
            '/welcome': async () => {
                const content = await fs.readFile('public/welcome.html');
                return new Response(content, {
                    type: 'html',
                    headers: {
                        Expires: '-1'
                    }
                });
            },
            '/assets/:filename': async (request) => {
                const filename = request.params.filename;
                const filePath = path.join('public/dream/assets', filename);
                
                if (!await fs.pathExists(filePath)) {
                    throw new Error('File not found');
                }
                
                const content = await fs.readFile(filePath);
                const ext = path.extname(filename);
                
                let contentType = 'application/octet-stream';
                if (ext === '.js') contentType = 'application/javascript';
                else if (ext === '.css') contentType = 'text/css';
                else if (ext === '.html') contentType = 'text/html';
                else if (ext === '.svg') contentType = 'image/svg+xml';
                
                return new Response(content, {
                    type: contentType,
                    headers: {
                        'Cache-Control': 'public, max-age=31536000'
                    }
                });
            },
            '/logo.svg': async () => {
                // 寻找logo.svg文件
                const possiblePaths = [
                    'public/dream/logo.svg',
                    'public/logo.svg',
                    'src/assets/logo.svg',
                    'dream/public/logo.svg'
                ];
                
                let logoPath = null;
                for (const p of possiblePaths) {
                    if (await fs.pathExists(p)) {
                        logoPath = p;
                        break;
                    }
                }
                
                if (!logoPath) {
                    // 如果找不到logo.svg，返回一个简单的SVG
                    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
                    return new Response(defaultSvg, {
                        type: 'image/svg+xml',
                        headers: {
                            'Cache-Control': 'public, max-age=31536000'
                        }
                    });
                }
                
                const content = await fs.readFile(logoPath);
                return new Response(content, {
                    type: 'image/svg+xml',
                    headers: {
                        'Cache-Control': 'public, max-age=31536000'
                    }
                });
            }
        }
    },
    images,
    chat,
    ping,
    token,
    models,
    enhance
];