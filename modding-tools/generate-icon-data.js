const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const iconDir = path.join(baseDir, '..', 'icon-exports-x32');
const outDir = path.join(baseDir, '..', 'generated');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const files = fs.readdirSync(iconDir);

const items = {};

for (const file of files) {
  if (!file.endsWith('.png')) continue;

  const base = file.replace(/\.png$/, '');

  // NBT除去
  const stripped = base.replace(/__\{.*$/, '');

  // ID変換
  const id = stripped.replace('__', ':');

  const newName = stripped + '.png';

  const oldPath = path.join(iconDir, file);
  const newPath = path.join(iconDir, newName);

  // リネーム（重複は潰す）
  try {
    fs.renameSync(oldPath, newPath);
  } catch {
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // データ構築
  if (!items[id]) {
    items[id] = {
      icon: newName,
      count: 1
    };
  } else {
    items[id].count++;
  }
}

// 出力用整形
const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    total: Object.keys(items).length
  },
  items: {}
};

for (const [id, data] of Object.entries(items)) {
  output.items[id] = {
    icon: data.icon,
    hasNbtVariants: data.count > 1
  };
}

fs.writeFileSync(
  path.join(outDir, 'item-icons.json'),
  JSON.stringify(output, null, 2)
);

console.log('完了');