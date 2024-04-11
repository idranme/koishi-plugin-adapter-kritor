import { Adapter, Context } from 'koishi'
import { KritorBot } from './bot'
import { init, RegisterActiveListener } from './grpc'
import { createSession } from './utils'
import { EventStructure, EventType } from './types'

export class KritorAdapter<C extends Context = Context> extends Adapter<C, KritorBot<C>> {
    constructor(ctx: C, private bot: KritorBot<C>) {
        super(ctx)
    }

    async connect() {
        this.initialize()
    }

    async disconnect() {
        this.bot.offline()
    }

    async onEvent(input: EventStructure){
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

    initialize() {
        try {
            const clients = init(this.bot.config.address)
            RegisterActiveListener(clients, EventType.EVENT_TYPE_CORE_EVENT, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_MESSAGE, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_NOTICE, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            RegisterActiveListener(clients, EventType.EVENT_TYPE_REQUEST, this.onEvent.bind(this), this.onEnd.bind(this), this.onError.bind(this))
            this.bot.internal.client = clients
            this.bot.online()
        }
        catch (err) {
            this.bot.offline(err)
        }
    }
}
