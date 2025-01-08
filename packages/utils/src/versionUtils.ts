import axios from "axios";
import urlJoin from "url-join";

function getNpmRegistry() {
  return "https://registry.npmmirror.com";
}

async function getNpmInfo(packageName: string) {
  const registry = getNpmRegistry();
  const url = urlJoin(registry, packageName);
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getLatestVersion(packageName: string) {
  const data = await getNpmInfo(packageName);
  if (!data) return null;
  return data["dist-tags"].latest;
}

async function getVersions(packageName: string) {
  const data = await getNpmInfo(packageName);
  if (!data) return [];
  return Object.keys(data.versions);
}

export { getNpmRegistry, getNpmInfo, getLatestVersion, getVersions };
