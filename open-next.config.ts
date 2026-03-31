import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    runtime: "edge",
    override: {
      // KVなどの設定がない場合、これらを "dummy" に設定する必要があります
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
