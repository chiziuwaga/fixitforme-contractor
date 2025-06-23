export const getURL = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/';
  // Make sure to include `https` in production URLs.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing '/'.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};
