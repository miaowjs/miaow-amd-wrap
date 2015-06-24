# miaow-amd-wrap

> Miaow的AMD包装工具, 可以将非AMD代码封装为AMD

```javascript
/* baz.js */
'use strict';

console.log('foo');

/* 处理后 */
define("foo_b49a2c6769.js", function() {
  'use strict';

  console.log('foo');
});
```

## 使用说明

### 安装

```
npm install miaow-amd-wrap --save-dev
```

### 在项目的 miaow.config.js 中添加模块的 tasks 设置

```javascript
//miaow.config.js
module: {
  tasks: [
    {
      test: /\.js$/,
      plugins: ['miaow-amd-wrap']
    }
  ]
}
```
