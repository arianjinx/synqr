import type { notificationSchema } from "@/trigger/send-notification";
import type { z } from "zod";

type NotificationPayload = z.infer<typeof notificationSchema>;

export const sendDiscordNotification = async (payload: NotificationPayload) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Discord webhook URL is not set");
    return null;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: payload.content,
      embeds: payload.embeds?.slice(0, 10), // Discord allows max 10 embeds per message
    }),
  });

  if (!response.ok) {
    console.error("Failed to send Discord notification:", response);
  }

  return response;
};
