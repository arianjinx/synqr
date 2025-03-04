import { fetchRSSFeed } from "@/use-cases/rss";

fetchRSSFeed().then((res) => {
  console.dir(res, { depth: 5 });
});
