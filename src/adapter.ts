import { Adapter, Context } from 'koishi'
import { KritorBot } from './bot'
import { init, RegisterActiveListener } from './grpc'
import { createSession } from './utils'
import { EventStructure__Output, EventType } from './types'

export class KritorAdapter<C extends Context = Context, B extends KritorBot<C> = KritorBot<C>> extends Adapter<C, B> {
    client: ReturnType<typeof init>

    constructor(ctx: C, private bot: B) {
        super(ctx)
        bot.adapter = this
    }

    async connect() {
        try {
            const clients = init(this.bot.config.address)
            RegisterActiveListener(clients, EventType.EVENT_TYPE_CORE_EVENT, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_MESSAGE, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_NOTICE, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_REQUEST, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            this.client = clients
            this.bot.online()
        }
        catch (err) {
            this.bot.offline(err)
        }
    }

    async disconnect() {
        this.bot.offline()
    }

    async onEvent(input: EventStructure__Output) {
        this.bot.logger.info(`${input.event} received`)
        // debug
        this.bot.logger.info(input)
        const session = await createSession(this.bot, input)
        if (session) this.bot.dispatch(session)
    }

    onEnd() {
        this.bot.logger.info('Stream End')
    }

    onError(e: Error) {
        this.bot.logger.info(e)
    }
}
