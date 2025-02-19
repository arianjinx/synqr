import { promisify } from "node:util";
import hardcodedConfig from "@/hardcoded-config.json";
import { sanitizeOptions } from "@/lib/utils";
import sanitizeHtml from "sanitize-html";
import { parseString } from "xml2js";

interface RSSItem {
  title: string[];
  description: string[];
  "content:encoded"?: string[];
  link: string[];
  pubDate: string[];
  "dc:creator"?: string[];
  author?: string[];
}

interface Channel {
  title: string[];
  description: string[];
  item: RSSItem[];
}

interface RSSData {
  rss: {
    channel: Channel[];
  };
}

export const fetchRSSFeed = async () => {
  try {
    const results = [];

    // Process each RSS feed
    for (const rss of hardcodedConfig.sources.rss) {
      try {
        const { feedTitle, feedDescription, items } =
          await fetchAndParseRSSFeed(rss.url, rss.name);

        // Sort items by date in descending order (newest first)
        const sortedItems = [...items].sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        );

        results.push({
          url: rss.url,
          feedTitle,
          feedDescription,
          items: sortedItems,
        });
      } catch (error) {
        console.error(`Error processing RSS feed ${rss.url}:`, error);
        results.push({
          url: rss.url,
          error: "Failed to process RSS feed",
        });
      }
    }

    return {
      results,
    };
  } catch (error) {
    console.error("Error processing RSS feeds:", error);
    throw new Error("Failed to process RSS feeds");
  }
};

const fetchAndParseRSSFeed = async (url: string, name: string) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const xmlData = await res.text();

  // Parse XML to JavaScript object
  const parseXMLAsync = promisify(parseString);
  const parsedData = (await parseXMLAsync(xmlData)) as RSSData;

  // Extract relevant information from the RSS feed
  const channel = parsedData.rss.channel[0];
  const items = channel.item.map((item: RSSItem) => {
    // Prefer content:encoded over description if available
    const rawContent =
      item["content:encoded"]?.[0] || item.description?.[0] || "";
    const cleanContent = sanitizeHtml(rawContent, sanitizeOptions);
    const description =
      cleanContent.length > 200
        ? `${cleanContent.slice(0, 197)}...`
        : cleanContent;

    return {
      title: sanitizeHtml(item.title?.[0] || "", sanitizeOptions),
      description,
      link: item.link?.[0] || "",
      pubDate: new Date(item.pubDate?.[0] || "").toISOString(),
      author: item["dc:creator"]?.[0] || item.author?.[0] || null,
      source: name,
    };
  });

  return {
    feedTitle: sanitizeHtml(channel.title?.[0] || "", sanitizeOptions),
    feedDescription: sanitizeHtml(
      channel.description?.[0] || "",
      sanitizeOptions,
    ),
    items,
  };
};
