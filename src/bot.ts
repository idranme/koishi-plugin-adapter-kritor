import { Bot, Context, Schema, Quester, Time, Universal } from 'koishi'
import { KritorAdapter } from './adapter'
import { KritorMessageEncoder } from './message'
import { Internal } from './internal'
import { getContact, decodeLoginUser, decodeGuild, decodeUser, decodeFriendList } from './utils'

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
    this.http = ctx.http
    this.internal = new Internal(this)
    ctx.plugin(KritorAdapter, this)
  }

  async createDirectChannel(userId: string) {
    return { id: 'private:' + userId, type: Universal.Channel.Type.DIRECT }
  }

  async getLogin() {
    const data = await this.internal.getCurrentAccount()
    this.user = decodeLoginUser(data)
    return this.toJSON()
  }

  async deleteMessage(channelId: string, messageId: string) {
    const contact = getContact(channelId)
    await this.internal.recallMessage(contact, messageId)
  }

  async getGuild(guildId: string) {
    const { groupInfo } = await this.internal.getGroupInfo(guildId)
    return decodeGuild(groupInfo)
  }

  async getGuildList(next?: string) {
    const { groupsInfo } = await this.internal.getGroupList()
    return { data: groupsInfo.map(decodeGuild) }
  }

  async kickGuildMember(guildId: string, userId: string, permanent?: boolean) {
    await this.internal.kickMember(guildId, userId, permanent)
  }

  async muteGuildMember(guildId: string, userId: string, duration: number, reason?: string) {
    await this.internal.banMember(guildId, userId, Number((duration / 1000).toFixed(0)))
  }

  async getUser(userId: string, guildId?: string) {
    const { friendsProfileCard } = await this.internal.getFriendProfileCard([userId])
    return decodeUser(friendsProfileCard[0])
  }

  async getFriendList(next?: string) {
    const { friendsInfo } = await this.internal.getFriendList()
    return { data: decodeFriendList(friendsInfo) }
  }
}

export namespace KritorBot {
  export interface Config {
    address: string
    retryInterval: number
    retryLazy: number
  }

  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      address: Schema.string().description('Kritor 服务器地址。').default('localhost:5700'),
      retryInterval: Schema.natural().role('ms').description('初次连接时的重试时间间隔。').default(30 * Time.second),
      retryLazy: Schema.natural().role('ms').description('连接关闭后的重试时间间隔。').default(10 * Time.second)
    })
  ])
}