import hardcodedConfig from '@/hardcoded-config.json'

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  author: string | null
  source: string
}

export const sendDiscordNotification = async (items: RSSItem[]) => {
  if (items.length === 0) return null

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('Discord webhook URL is not set')
    return null
  }

  const sourceName = items[0].source

  // Get source config to find the color
  const sourceConfig = hardcodedConfig.sources.rss.find(
    source => source.name === sourceName,
  )

  // Create embeds for each item
  const embeds = items.map(item => ({
    title: item.title,
    description: `${item.description}\n\n[Read more](${item.link})`,
    color: Number.parseInt(
      sourceConfig?.color || hardcodedConfig.outputs.discord.defaultColor,
    ),
    timestamp: new Date(item.pubDate).toISOString(),
    footer: {
      text: item.author ? `Written by ${item.author}` : sourceName,
    },
  }))

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `🔔 New posts from **${sourceName}**`,
      embeds: embeds.slice(0, 10), // Discord allows max 10 embeds per message
    }),
  })

  if (!response.ok) {
    console.error('Failed to send Discord notification:', response)
  }

  return response
}
