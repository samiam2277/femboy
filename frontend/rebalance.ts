/**
 * 批量削减 selfAcceptance 数值：>= 20 减半，10-19 减 30%
 * 用法: npx tsx rebalance.ts
 */
import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/data/storyData.ts';
let content = readFileSync(filePath, 'utf-8');

// 匹配 selfAcceptance: 数字（可正可负）
const regex = /selfAcceptance:\s*(-?\d+)/g;

let count = 0;
content = content.replace(regex, (match, numStr) => {
  let val = parseInt(numStr, 10);
  if (val >= 20) {
    val = Math.round(val * 0.5);   // >=20: 减半
    count++;
  } else if (val >= 10) {
    val = Math.round(val * 0.7);   // 10-19: 减30%
    count++;
  }
  return `selfAcceptance: ${val}`;
});

writeFileSync(filePath, content, 'utf-8');
console.log(`修改了 ${count} 处 selfAcceptance 值`);
