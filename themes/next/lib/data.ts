import fs from "node:fs";
import path from "node:path";

export type PlanetSite = {
  name: string;
  tagline?: string;
  description?: string;
  link?: string;
  locale?: string;
  items?: number;
  items_feed?: number;
  display_length?: number;
  post_update?: boolean;
  time_format?: string;
  lazyload?: boolean;
};

export type PlanetPerson = {
  name: string;
  link: string;
  avatar?: string;
};

export type PlanetPost = {
  _u: number;
  _length: number;
  _summary_text: string;
  _t_rfc3339: string;
  _t_rfc822: string;
  title: string;
  author: string;
  date: string;
  update: string | null;
  categories: string[];
  link: string;
  summary?: string;
  content: string;
  channel: string;
  xml: string;
  avatar: string | null;
};

export type PlanetData = {
  site: PlanetSite;
  people: PlanetPerson[];
  posts: PlanetPost[];
};

function resolveDataPath(rawPath: string) {
  return path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(process.cwd(), rawPath);
}

export function loadPlanetData(): PlanetData {
  const envPath = process.env.PLANET_DATA_PATH;

  if (!envPath) {
    throw new Error(
      "PLANET_DATA_PATH is not set. Run the planet command first and pass --config to the build script."
    );
  }

  const dataPath = resolveDataPath(envPath);

  const file = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(file) as PlanetData;
}
