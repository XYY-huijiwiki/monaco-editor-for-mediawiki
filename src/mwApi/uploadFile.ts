import ky from "ky";

type UploadError = {
  error:
    | UploadErrorFileTypeBanned
    | UploadErrorVerificationError
    | UploadErrorOther;
};
type UploadErrorFileTypeBanned = {
  code: "filetype-banned";
  info: string;
  filetype: string;
  allowed: string[];
  "*": string;
};
type UploadErrorVerificationError = {
  code: "verification-error";
  info: string;
  details: string[];
  "*": string;
};
type UploadErrorOther = {
  code: string;
  info: string;
};
type UploadWarnings = {
  upload: {
    result: "Warning";
    warnings: {
      exists?: string;
      "exists-normalized"?: string;
      duplicate?: string[];
      ["duplicate-archive"]?: string;
      ["badfilename"]?: string;
      [key: string]: unknown | undefined;
    };
    filekey: string;
    sessionkey?: string;
  };
};
type UploadSuccess = {
  upload: {
    result: "Success";
    filename: string;
    imageinfo: {
      url: string;
      descriptionurl: string;
      tags?: string[];
    };
    filekey?: string;
  };
};

// MediaWiki API: Datei-Hochladen
type UploadFileOptions = {
  filename: string;
  file: File;
  comment?: string;
  text?: string;
  ignoreWarnings?: boolean;
  validateOnly?: boolean;
};
type UploadApiResponse = UploadSuccess | UploadWarnings | UploadError;

async function uploadFile(options: UploadFileOptions) {
  const api = new mw.Api();
  const token = await api.getToken("csrf");

  const formData = new FormData();
  formData.append("file", options.file, options.filename);
  formData.append("filename", options.filename);
  formData.append("action", "upload");
  formData.append("format", "json");
  if (options.comment) formData.append("comment", options.comment);
  if (options.text) formData.append("text", options.text);
  if (options.ignoreWarnings) formData.append("ignorewarnings", "1");
  if (options.validateOnly) formData.append("stash", "1");
  formData.append("token", token);

  const response = await ky
    .post("/api.php", {
      body: formData,
    })
    .json<UploadApiResponse>();

  return response;
}

export { uploadFile };
export type { UploadSuccess, UploadWarnings, UploadError };
