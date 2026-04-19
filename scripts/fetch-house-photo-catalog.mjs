import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const commonsApiUrl = 'https://commons.wikimedia.org/w/api.php';
const outputFile =
  process.argv[2] ||
  path.join(process.cwd(), 'db', 'seed-data', 'house-photo-catalog.json');
const maxImages = Number(process.env.PHOTO_LIMIT || '60');

const categories = [
  'Category:Houses',
  'Category:Residential buildings',
  'Category:Villas',
  'Category:Cottages',
];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'booking-seeder/1.0 (house photo catalog fetcher)',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchCategoryMembers(categoryTitle, limit) {
  const results = [];
  let continuation;

  while (results.length < limit) {
    const url = new URL(commonsApiUrl);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtype', 'file');
    url.searchParams.set('cmtitle', categoryTitle);
    url.searchParams.set('cmlimit', String(Math.min(50, limit - results.length)));

    if (continuation) {
      url.searchParams.set('cmcontinue', continuation);
    }

    const data = await fetchJson(url);
    results.push(...(data.query?.categorymembers ?? []));

    continuation = data.continue?.cmcontinue;
    if (!continuation) {
      break;
    }
  }

  return results;
}

async function fetchImageMetadata(fileTitles) {
  const chunks = [];

  for (let index = 0; index < fileTitles.length; index += 25) {
    chunks.push(fileTitles.slice(index, index + 25));
  }

  const metadata = [];

  for (const chunk of chunks) {
    const url = new URL(commonsApiUrl);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set(
      'iiprop',
      'url|user|extmetadata'
    );
    url.searchParams.set('iiurlwidth', '1280');
    url.searchParams.set('titles', chunk.join('|'));

    const data = await fetchJson(url);
    const pages = Object.values(data.query?.pages ?? {});

    for (const page of pages) {
      const imageInfo = page.imageinfo?.[0];
      const extmetadata = imageInfo?.extmetadata ?? {};
      const license =
        extmetadata.LicenseShortName?.value ||
        extmetadata.License?.value ||
        null;

      if (!imageInfo?.url || !imageInfo?.thumburl) {
        continue;
      }

      metadata.push({
        title: page.title,
        imageUrl: imageInfo.url,
        thumbnailUrl: imageInfo.thumburl,
        photographerName:
          extmetadata.Artist?.value?.replace(/<[^>]+>/g, '').trim() ||
          imageInfo.user ||
          'Unknown',
        photographerProfileUrl: null,
        sourceName: 'Wikimedia Commons',
        sourcePageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
        sourceLicense: license,
        altText: page.title
          .replace(/^File:/, '')
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' '),
      });
    }
  }

  return metadata;
}

function uniqueByImageUrl(images) {
  return Array.from(
    new Map(images.map((image) => [image.imageUrl, image])).values()
  );
}

async function main() {
  const perCategory = Math.max(15, Math.ceil(maxImages / categories.length));
  const fileTitles = [];

  for (const category of categories) {
    const members = await fetchCategoryMembers(category, perCategory);
    fileTitles.push(...members.map((member) => member.title));
  }

  const photoCatalog = uniqueByImageUrl(await fetchImageMetadata(fileTitles)).slice(
    0,
    maxImages
  );

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(
    outputFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'Wikimedia Commons API',
        categories,
        count: photoCatalog.length,
        photos: photoCatalog,
      },
      null,
      2
    )
  );

  console.log(`Saved ${photoCatalog.length} photos to ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
