import getPage from "./getPage";

/**
 * wiki api base url.
 * use current site api in production
 * use `xyy.huijiwiki.com` api in development
 **/
const url = `${location.origin}/w/api.php`;

export { url, getPage };
