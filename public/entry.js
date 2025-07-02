(async () => {
  let dirname = new URL(".", import.meta.url); // 获取当前脚本所在的目录
  let data = await (await fetch(`${dirname}/.vite/manifest.json`)).json(); // 获取manifest.json文件内容
  let moduleUrl = `${dirname}/${data["index.html"]["file"]}`; // 根据manifest.json文件获取入口文件的url
  import(moduleUrl); // 导入模块
})();
