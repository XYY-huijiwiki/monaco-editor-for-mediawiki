(async () => {
  // 获取vite构建的manifest.json文件
  let response = await fetch(
    "https://monaco-editor-for-mediawiki.pages.dev/.vite/manifest.json"
  );
  let data = await response.json();
  // 根据manifest.json文件获取入口文件的url
  let moduleUrl =
    "https://monaco-editor-for-mediawiki.pages.dev/" +
    data["index.html"]["file"];
  // 导入模块
  import(moduleUrl);
})();
