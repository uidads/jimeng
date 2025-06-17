#!/usr/bin/env node

/**
 * 健康检查脚本
 * 用于Docker容器健康检查
 */

const http = require('http');

const options = {
  host: 'localhost',
  port: 5566,
  path: '/ping',
  timeout: 10000,
  method: 'GET'
};

const request = http.request(options, (res) => {
  console.log(`健康检查: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error('健康检查失败:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('健康检查超时');
  request.destroy();
  process.exit(1);
});

request.end(); 