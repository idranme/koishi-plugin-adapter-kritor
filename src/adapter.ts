import { Adapter, Context } from 'koishi'
import KritorBot from './bot'
import { EventType } from './generated/kritor/event/EventType'
import { init, sendMessage, RegisterActiveListener } from './api'
import { createSession } from './utils'
import { EventStructure__Output } from './generated/kritor/event/EventStructure'
export default class KritorAdapter<C extends Context> extends Adapter<C, KritorBot<C>> {
    static inject: string[]
    bot: KritorBot<C>
    constructor(ctx: C) {
        super(ctx)
    }
    async connect(bot: KritorBot<C>) {
        this.bot = bot
        this.initialize()
    }
    async disconnect(bot: KritorBot<C>) {
        this.bot.client = null
        this.bot = null
        this.bot.offline()
    }
    async stop(bot: KritorBot<C>) {
        this.bot.client = null
        this.bot = null
        this.bot.offline()
    }
    async onMessage(message: EventStructure__Output) {
        if (!this.bot)
            return
        // debug
        // console.log(`onMessage received: ${JSON.stringify(message, null, 2)}`)
        if (message.message) {
            let session = await createSession(this.bot, message.message)
            this.bot.dispatch(session)
        }
    }
    onNotice(message: EventStructure__Output) {
        this.bot.logger.info(`onNotice received: ${JSON.stringify(message)}`)
    }
    onCore(message: EventStructure__Output) {
        this.bot.logger.info(`onCore received: ${JSON.stringify(message)}`)
    }
    onRequest(message: EventStructure__Output) {
        this.bot.logger.info(`onRequest received: ${JSON.stringify(message)}`)
    }
    onEnd() {
        this.bot.logger.info('Stream End')
    }
    onError(e) {
        this.bot.logger.info(e)
    }
    async initialize() {
        try {
            const clients = init(this.bot.config.host)
            RegisterActiveListener(clients, EventType.EVENT_TYPE_CORE_EVENT, this.onCore.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_MESSAGE, this.onMessage.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_NOTICE, this.onNotice.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_REQUEST, this.onRequest.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            this.bot.client = clients
            this.bot.internal = new Internal(clients)
            this.bot.online()
        }
        catch (err) {
            this.bot.offline(err)
        }
    }
}

export class Internal {
    constructor(private clients: ReturnType<typeof init>) { }
    /**
     * 发送私信
     * @param uid
     * @param content
     * @param contentType
     * @returns
     */
    async sendPrivateMsg(uid, content, contentType) {
        
    }
    /**
     * 发送消息
     * @param channelId
     * @param content
     * @returns
     */
    async sendMessage(channelId, content) {
        return new Promise((resolve, reject) => {
            sendMessage(this.clients, { scene: 'GROUP', peer: channelId }, content, 3, (messageId, messageTime) => {
                resolve({ 'messageId': messageId, 'messageTime': messageTime })
            })
        })
    }
}
