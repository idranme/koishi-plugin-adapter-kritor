import { Bot, Context, Logger, Quester, Schema, h } from 'koishi'
import KritorAdapter from './adapter'
import { KritorMessenger } from './message'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { init } from './api'
export const name = 'Kritor'


class KritorBot<C extends Context> extends Bot<C> {
  static MessageEncoder = KritorMessenger
  declare logger: Logger
  http: Quester
  client: ReturnType<typeof init>
  constructor(ctx: C, config: KritorBot.Config) {
    super(ctx, config)
    this.logger = new Logger(name)
    this.platform = 'kritor'
    this.selfId = config.selfId
    this.http = ctx.http
    ctx.plugin(KritorAdapter, this)

    /**
     * debug
     */
    // ctx.plugin(TestFn)
  }
  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    return null
  }
  async editMessage(channelId: string, messageId: string, content: h.Fragment): Promise<void> {
    return null
  }
}
namespace KritorBot {
  export const usage = `${(readFileSync(resolve(__dirname, '../readme.md'))).toString('utf-8').split('# 更新日志')[0]}`
  export interface Config {
    host: string
    selfId: string
  }

  export const Config: Schema<Config> = Schema.intersect([Schema.object({
    host: Schema.string().default('http://localhost:5700').description('Kritor 服务器地址'),
    selfId: Schema.string().description(`随便填🤗🤗`).required(),
  }),

  ])

}

export default KritorBot