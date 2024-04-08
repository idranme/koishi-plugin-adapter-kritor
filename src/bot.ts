import { Bot, Context, Schema, h, Quester } from 'koishi'
import { KritorAdapter } from './adapter'
import { KritorMessageEncoder } from './message'
import { Internal } from './internal'

export class KritorBot<C extends Context> extends Bot<C, KritorBot.Config> {
  static inject = {
    required: ['http']
  }
  static MessageEncoder = KritorMessageEncoder
  http: Quester
  internal: Internal

  constructor(ctx: C, config: KritorBot.Config) {
    super(ctx, config, 'kritor')
    this.selfId = config.selfId
    this.http = ctx.http
    this.internal = new Internal()
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
    host: string
    selfId: string
  }

  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      host: Schema.string().description('Kritor 服务器地址。').default('localhost:5700'),
      selfId: Schema.string().description(`机器人的账号。`).required(),
    })
  ])
}