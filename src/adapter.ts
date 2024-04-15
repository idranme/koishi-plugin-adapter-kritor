import { Adapter, Context } from 'koishi'
import { KritorBot } from './bot'
import { init } from './grpc'
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
            this.client = init(this.bot.config.address)
            this.registerActiveListener(EventType.EVENT_TYPE_MESSAGE)
            this.registerActiveListener(EventType.EVENT_TYPE_NOTICE)
            this.registerActiveListener(EventType.EVENT_TYPE_REQUEST)
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

    registerActiveListener(type: EventType) {
        const { eventClient } = this.client
        const eventStream = eventClient.RegisterActiveListener({ type })
        eventStream.on('data', this.onEvent.bind(this))
        eventStream.on('end', this.onEnd.bind(this))
        eventStream.on('error', this.onError.bind(this))
        this.ctx.on('dispose', () => {
            eventStream.destroy()
        })
    }
}
