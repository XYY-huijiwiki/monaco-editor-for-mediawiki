function languageMapper(contentModel: string): ContentModel {
  const langMapper: Record<string, ContentModel> = {
    wikitext: "wikitext",
    GadgetDefinition: "json",
    HtmlMustache: "html",
    javascript: "javascript",
    css: "css",
    Scribunto: "lua",
  };
  return langMapper[contentModel] || "plaintext";
}

export default languageMapper;
