import hardcodedConfig from "@/hardcoded-config.json";
import { redis } from "@/lib/redis";
import { sendNotificationTask } from "@/trigger/send-notification";
import { fetchRSSFeed } from "@/use-cases/rss";
import { schedules } from "@trigger.dev/sdk/v3";

export const fetchRSSFeedTask = schedules.task({
  id: "fetch-rss-feed",
  cron: {
    pattern: "0 0 * * *",
    timezone: "Asia/Jakarta",
  },
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async () => {
    const { results } = await fetchRSSFeed();

    for (const feed of results) {
      if ("error" in feed) continue; // Skip feeds with errors

      const redisKey = `lastPubDate:${encodeURIComponent(feed.url)}`;
      const lastPubDate = await redis.get<string>(redisKey);

      let itemsToNotify = feed.items;

      if (lastPubDate) {
        // Filter only new items published after the last publication date
        itemsToNotify = feed.items.filter(
          (item) => new Date(item.pubDate) > new Date(lastPubDate),
        );
      } else {
        // If no last publication date, take only the latest 5 items
        itemsToNotify = feed.items.slice(0, 5);
      }

      if (itemsToNotify.length > 0) {
        // Store the latest publication date (items are already sorted newest first)
        const latestPubDate = feed.items[0]?.pubDate;
        if (latestPubDate) {
          await redis.set(redisKey, latestPubDate);
        }

        // Send notification for new items
        await sendNotificationTask.trigger({
          title: itemsToNotify[0].source,
          content: `🔔 ${itemsToNotify.length} new post(s) available from **${itemsToNotify[0].source}**`,
          embeds: itemsToNotify.map((item) => ({
            title: item.title,
            description: item.description,
            url: item.link,
            timestamp: item.pubDate,
            author: item.author ? { name: item.author } : undefined,
            footer: {
              text: `Source: ${item.source}`,
            },
            color: Number.parseInt(
              hardcodedConfig.sources.rss.find((source) =>
                itemsToNotify[0].source.includes(source.name),
              )?.color ?? hardcodedConfig.outputs.discord.defaultColor,
            ),
          })),
        });
      }
    }

    return {
      message: "RSS feed fetched and notifications triggered",
      results,
    };
  },
});
