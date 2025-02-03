import {promisify} from 'node:util'
import hardcodedConfig from '@/hardcoded-config.json'
import {redis} from '@/lib/redis'
import {sendDiscordNotification} from '@/lib/send-notification'
import sanitizeHtml from 'sanitize-html'
import {parseString} from 'xml2js'

export const dynamic = 'force-dynamic'

const parseXMLAsync = promisify(parseString)

// Server-side HTML entity decoder
function decodeHTMLEntitiesServer(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&#47;/g, '/')
}

interface RSSItem {
  title: string[]
  description: string[]
  link: string[]
  pubDate: string[]
  'dc:creator'?: string[]
  author?: string[]
}

interface Channel {
  title: string[]
  description: string[]
  item: RSSItem[]
}

interface RSSData {
  rss: {
    channel: Channel[]
  }
}

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {
    a: ['href'],
  },
  // Strip out any HTML comments
  allowedComments: [],
  // Ensure text is properly spaced after tags
  textFilter: (text: string) => {
    return decodeHTMLEntitiesServer(text.replace(/\s+/g, ' ').trim())
  },
}

const simpleSanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  textFilter: (text: string) => {
    return decodeHTMLEntitiesServer(text.replace(/\s+/g, ' ').trim())
  },
}

async function fetchAndParseRSSFeed(url: string, name: string) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
  const xmlData = await res.text()

  // Parse XML to JavaScript object
  const parsedData = (await parseXMLAsync(xmlData)) as RSSData

  // Extract relevant information from the RSS feed
  const channel = parsedData.rss.channel[0]
  const items = channel.item.map((item: RSSItem) => {
    const description = sanitizeHtml(
      item.description?.[0] || '',
      sanitizeOptions,
    )
    return {
      title: sanitizeHtml(item.title?.[0] || '', simpleSanitizeOptions),
      description:
        description.length > 100
          ? `${description.slice(0, 97)}...`
          : description,
      link: item.link?.[0] || '',
      pubDate: new Date(item.pubDate?.[0] || '').toISOString(),
      author: item['dc:creator']?.[0] || item.author?.[0] || null,
      source: name,
    }
  })

  return {
    feedTitle: sanitizeHtml(channel.title?.[0] || '', simpleSanitizeOptions),
    feedDescription: sanitizeHtml(
      channel.description?.[0] || '',
      sanitizeOptions,
    ),
    items,
  }
}

function getRedisKeyForURL(url: string) {
  // Create a safe Redis key from the URL
  return `rss_last_pub_date:${encodeURIComponent(url)}`
}

export async function GET() {
  try {
    const results = []

    // Process each RSS feed
    for (const rss of hardcodedConfig.sources.rss) {
      try {
        const {feedTitle, feedDescription, items} = await fetchAndParseRSSFeed(
          rss.url,
          rss.name,
        )

        // Get the latest pubDate we've seen before for this source
        const redisKey = getRedisKeyForURL(rss.url)
        const lastPubDate = await redis.get(redisKey)

        // Sort items by date in descending order (newest first)
        const sortedItems = [...items].sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        )

        if (sortedItems.length > 0) {
          // For first time feed fetch, send latest 5 items
          if (!lastPubDate) {
            const latestItems = sortedItems.slice(0, 5) // Get latest 5 items
            // Send notification for this feed's latest items
            await sendDiscordNotification(latestItems).then(async () => {
              // Only set Redis key if notification was successful
              await redis.set(redisKey, sortedItems[0].pubDate)
            })
          }
          // For subsequent fetches, check for new items
          else {
            // Filter only new items
            const newItems = sortedItems.filter(
              item => new Date(item.pubDate) > new Date(lastPubDate as string),
            )

            if (newItems.length > 0) {
              // Send notification for this feed's new items
              await sendDiscordNotification(newItems).then(async () => {
                // Only set Redis key if notification was successful
                await redis.set(redisKey, sortedItems[0].pubDate)
              })
            }
          }
        }

        results.push({
          url: rss.url,
          feedTitle,
          feedDescription,
          items: sortedItems,
          newItemsCount: !lastPubDate
            ? Math.min(5, sortedItems.length) // Show up to 5 items for first fetch
            : sortedItems.filter(
                item =>
                  new Date(item.pubDate) > new Date(lastPubDate as string),
              ).length,
        })
      } catch (error) {
        console.error(`Error processing RSS feed ${rss.url}:`, error)
        results.push({
          url: rss.url,
          error: 'Failed to process RSS feed',
        })
      }
    }

    return Response.json({
      results,
      totalNewItems: results.reduce(
        (sum, result) => sum + (result.newItemsCount || 0),
        0,
      ),
    })
  } catch (error) {
    console.error('Error processing RSS feeds:', error)
    return Response.json({error: 'Failed to process RSS feeds'}, {status: 500})
  }
}
