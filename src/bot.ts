import { Bot, Context, Schema, h, Quester, Time } from 'koishi'
import { KritorAdapter } from './adapter'
import { KritorMessageEncoder } from './message'
import { Internal } from './internal'

export class KritorBot<C extends Context = Context> extends Bot<C, KritorBot.Config> {
  static inject = {
    required: ['http']
  }
  static MessageEncoder = KritorMessageEncoder
  http: Quester
  internal: Internal
  declare adapter: KritorAdapter<C, this>

  constructor(ctx: C, config: KritorBot.Config) {
    super(ctx, config, 'kritor')
    this.selfId = config.selfId
    this.http = ctx.http
    this.internal = new Internal(this)
    ctx.plugin(KritorAdapter, this)
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    return null
  }

  async editMessage(channelId: string, messageId: string, content: h.Fragment): Promise<void> {
    return null
  }
}

export namespace KritorBot {
  export interface Config {
    selfId: string
    address: string
    retryLazy: number
  }

  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      selfId: Schema.string().description(`机器人的账号。`).required(),
      address: Schema.string().description('Kritor 服务器地址。').default('localhost:5700'),
      retryLazy: Schema.natural().role('ms').description('连接关闭后的重试时间间隔。').default(10 * Time.second)
    })
  ])
}