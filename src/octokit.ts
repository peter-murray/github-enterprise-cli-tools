const { Octokit } = require('octokit');
import { fetch as undiciFetch, ProxyAgent } from 'undici';

export function getOctokit(token: string, proxyUri?: string, proxyUser?: string, proxyPassword?: string) {
  if (proxyUri) {
    let proxyConfig  = {
      uri: proxyUri
    }

    const proxyToken = generateProxyToken(proxyUser, proxyPassword);
    if (proxyToken) {
      proxyConfig['token'] = proxyToken;
    }

    const fetchWithProxy = (url, options) => {
      return undiciFetch(url, {
        ...options,
        dispatcher: new ProxyAgent(proxyConfig)
      })
    }

    return new Octokit({
      auth: token,
      request: {
        fetch: fetchWithProxy
      }
    });
  } else {
    return new Octokit({
      auth: token,
      request: {
        fetch: undiciFetch
      }
    });
  }
}

function generateProxyToken(user?: string, password? : string) {
  if (user && password) {
    return `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
  }
  return undefined;
}