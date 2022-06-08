import { Tree } from '@nrwl/devkit';

import { readFileSync } from 'fs';
import { XmlDocument, XmlElement } from 'xmldoc';

export function readXmlInTree(host: Tree, path: string): XmlDocument {
  const fileText = host.read(path)?.toString();
  if (!fileText) {
    throw new Error(`Unable to read ${path}`);
  }
  return new XmlDocument(fileText);
}

export function readXml(path: string): XmlDocument {
  const fileText = readFileSync(path)?.toString();
  if (!fileText) {
    throw new Error(`Unable to read ${path}`);
  }
  return new XmlDocument(fileText);
}

export async function iterateChildrenByPath(
  root: XmlElement,
  path: string,
  callback:
    | ((element: XmlElement) => Promise<void>)
    | ((element: XmlElement) => void),
) {
  const parts = path.split('.');
  const children = root.childrenNamed(parts[0]);
  for (const childNode of children) {
    if (parts.length > 1) {
      const nextPath = parts.slice(1, parts.length).join('.');
      await iterateChildrenByPath(childNode, nextPath, callback);
    } else {
      await callback(childNode);
    }
  }
}
