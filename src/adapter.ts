import { Adapter, Context } from 'koishi'
import { KritorBot } from './bot'
import { init, RegisterActiveListener } from './grpc'
import { createSession } from './utils'
import { EventStructure__Output, EventType } from './types'

export class KritorAdapter<C extends Context = Context> extends Adapter<C, KritorBot<C>> {
    constructor(ctx: C, private bot: KritorBot<C>) {
        super(ctx)
    }
    async connect(bot: KritorBot<C>) {
        this.initialize()
    }
    async disconnect(bot: KritorBot<C>) {
        this.bot.offline()
    }
    async onMessage(message: EventStructure__Output) {
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
            this.bot.internal.client = clients
            this.bot.online()
        }
        catch (err) {
            this.bot.offline(err)
        }
    }
}
