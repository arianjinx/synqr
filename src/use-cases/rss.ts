import hardcodedConfig from "@/hardcoded-config.json";
import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";

export const fetchRSSFeed = async () => {
  try {
    const results = [];

    // Process each RSS feed
    for (const rss of hardcodedConfig.sources.rss) {
      try {
        const { feedTitle, feedDescription, items } =
          await fetchAndParseRSSFeed(rss.url, rss.name);

        // Sort items by date in descending order (latest first)
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
  const parser = new Parser({
    timeout: 5000,
    customFields: {
      item: ["content:encoded", "content:encoded"],
    },
  });
  const feed = await parser.parseURL(url);

  // Extract and transform feed items
  const items = feed.items.map((item) => {
    const description = (
      item.contentSnippet ||
      sanitizeHtml(item.content || item["content:encoded"] || "", {
        allowedTags: [],
        allowedAttributes: {},
      })
    )
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      title: item.title,
      description:
        description.slice(0, 197) + (description.length > 197 ? "..." : ""),
      link: item.link,
      pubDate: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      author: item.creator || name,
      source: name,
    };
  });

  return {
    feedTitle: name,
    feedDescription: feed.description,
    items,
  };
};
