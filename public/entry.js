(async () => {
  // 获取vite构建的manifest.json文件
  let response = await fetch(
    "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/monaco-editor-for-mediawiki@dist/.vite/manifest.json"
  );
  let data = await response.json();
  // 根据manifest.json文件获取入口文件的url
  let moduleUrl =
    "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/monaco-editor-for-mediawiki@dist/" +
    data["index.html"]["file"];
  // 导入模块
  import(moduleUrl);
})();
