import { Adapter, Context, Universal, Logger, Time } from 'koishi'
import { KritorBot } from './bot'
import { createSession, decodeLoginUser } from './utils'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as Kritor from './types'

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
    new(...args: ConstructorParameters<Constructor>): Subtype
}

export class KritorAdapter<C extends Context = Context, B extends KritorBot<C> = KritorBot<C>> extends Adapter<C, B> {
    client: ReturnType<typeof this.init>
    private logger: Logger
    private messageStream: grpc.ClientReadableStream<Kritor.EventStructure__Output>
    private noticeStream: grpc.ClientReadableStream<Kritor.EventStructure__Output>
    private requestStream: grpc.ClientReadableStream<Kritor.EventStructure__Output>

    constructor(ctx: C, private bot: B) {
        super(ctx)
        this.logger = bot.logger
        bot.adapter = this
        this.client = this.init(this.bot.config.address)
    }

    async goOnline() {
        if (!this.bot.isActive) return
        const account = await this.bot.internal.getCurrentAccount()
        this.bot.user = decodeLoginUser(account)
        this.bot.online()
        this.logger.info('connect to server: %c', this.bot.config.address)
    }

    async connect() {
        try {
            await this.goOnline()
        }
        catch (err) {
            if (err.message) this.logger.warn(err.message)
            this.bot.status = Universal.Status.RECONNECT
            const timeout = this.bot.config.retryInterval
            this.logger.info(`will retry connection in ${Time.format(timeout)}...`)
            this.ctx.setTimeout(async () => await this.connect(), timeout)
            return
        }
        this.registerListener(Kritor.EventType.EVENT_TYPE_MESSAGE)
        this.registerListener(Kritor.EventType.EVENT_TYPE_NOTICE)
        this.registerListener(Kritor.EventType.EVENT_TYPE_REQUEST)
    }

    async disconnect() {
        this.bot.offline()
        this.messageStream?.destroy?.()
        this.noticeStream?.destroy?.()
        this.requestStream?.destroy?.()
    }

    private registerListener(type: Kritor.EventType__Output) {
        const { eventClient } = this.client
        const name: string = {
            [Kritor.EventType.EVENT_TYPE_MESSAGE]: 'messageStream',
            [Kritor.EventType.EVENT_TYPE_NOTICE]: 'noticeStream',
            [Kritor.EventType.EVENT_TYPE_REQUEST]: 'requestStream'
        }[type]
        const eventStream = this[name] = eventClient.registerActiveListener({ type })

        eventStream.on('data', async (chunk) => {
            const session = await createSession(this.bot, chunk)
            if (!session) return
            session.setInternal('kritor', chunk)
            this.bot.dispatch(session)
        })

        eventStream.on('end', () => {
            eventStream.removeAllListeners()
            this.bot.status = Universal.Status.RECONNECT
            if (type === 1) {
                this.logger.warn(`connection disconnected`)
                this.logger.info(`will retry connection in ${Time.format(this.bot.config.retryInterval)}...`)
            }
            this.ctx.setTimeout(async () => {
                this.registerListener(type)
                if (this.bot.status !== Universal.Status.ONLINE && type === 1) {
                    try {
                        await this.goOnline()
                    } catch { }
                }
            }, this.bot.config.retryLazy)
        })

        eventStream.on('error', (err) => {
            this.logger.debug(err)
        })
    }

    private init(address: string) {
        // Forked from https://github.com/KarinJS/kritor-ts/blob/2f7cf14012ce72e8d92e6a0426acbf76be270ea0/src/api.ts#L45

        const dir = __dirname + '/kritor/protos'

        const authenticationProtoGrpcType = this.getProtoGrpcType('auth/authentication.proto', [dir]) as Kritor.AuthenticationProtoGrpcType
        const coreProtoGrpcType = this.getProtoGrpcType('core/core.proto', [dir]) as Kritor.CoreProtoGrpcType
        const eventProtoGrpcType = this.getProtoGrpcType('event/event.proto', [dir]) as Kritor.EventProtoGrpcType
        const friendProtoGrpcType = this.getProtoGrpcType('friend/friend.proto', [dir]) as Kritor.FriendProtoGrpcType
        const groupProtoGrpcType = this.getProtoGrpcType('group/group.proto', [dir]) as Kritor.GroupProtoGrpcType
        const groupFileProtoGrpcType = this.getProtoGrpcType('file/group_file.proto', [dir]) as Kritor.GroupFileProtoGrpcType
        const messageProtoGrpcType = this.getProtoGrpcType('message/message.proto', [dir]) as Kritor.MessageProtoGrpcType
        //const customizationProtoGrpcType = this.getProtoGrpcType('developer/customization.proto', [__dirname + '/kritor/protos']) as Kritor.CustomizationProtoGrpcType
        //const developerProtoGrpcType = this.getProtoGrpcType('developer/developer.proto', [__dirname + '/kritor/protos']) as Kritor.DeveloperProtoGrpcType
        //const guildProtoGrpcType = this.getProtoGrpcType('guild/guild.proto', [__dirname + '/kritor/protos']) as Kritor.GuildProtoGrpcType
        //const qsignProtoGrpcType = this.getProtoGrpcType('developer/qsign.proto', [__dirname + '/kritor/protos']) as Kritor.QsignProtoGrpcType
        //const reverseProtoGrpcType = this.getProtoGrpcType('reverse/reverse.proto', [__dirname + '/kritor/protos']) as Kritor.ReverseProtoGrpcType
        //const webProtoGrpcType = this.getProtoGrpcType('web/web.proto', [__dirname + '/kritor/protos']) as Kritor.WebProtoGrpcType

        const credential = grpc.credentials.createInsecure()

        const authenticationClient = this.getClient(authenticationProtoGrpcType.kritor.authentication.AuthenticationService, address, credential)
        const coreClient = this.getClient(coreProtoGrpcType.kritor.core.CoreService, address, credential)
        const eventClient = this.getClient(eventProtoGrpcType.kritor.event.EventService, address, credential)
        const groupFileClient = this.getClient(groupFileProtoGrpcType.kritor.file.GroupFileService, address, credential)
        const friendClient = this.getClient(friendProtoGrpcType.kritor.friend.FriendService, address, credential)
        const groupClient = this.getClient(groupProtoGrpcType.kritor.group.GroupService, address, credential)
        const messageClient = this.getClient(messageProtoGrpcType.kritor.message.MessageService, address, credential)
        //const reverseClient = this.getClient(reverseProtoGrpcType.kritor.reverse.ReverseService, address, credential)
        //const customizationClient = this.getClient(customizationProtoGrpcType.kritor.customization.CustomizationService, address, credential)
        //const developerClient = this.getClient(developerProtoGrpcType.kritor.developer.DeveloperService, address, credential)
        //const qsignClient = this.getClient(qsignProtoGrpcType.kritor.developer.QsignService, address, credential)
        //const guildClient = this.getClient(guildProtoGrpcType.kritor.guild.GuildService, address, credential)
        //const webClient = this.getClient(webProtoGrpcType.kritor.web.WebService, address, credential)

        const timeout = 3000
        const deadline = new Date()
        deadline.setSeconds(deadline.getSeconds() + timeout)
        Promise.resolve(authenticationClient.waitForReady(deadline, function* (error?: Error) {
            if (error) {
                throw error
            }
        }))

        return {
            authenticationClient,
            coreClient,
            eventClient,
            groupFileClient,
            friendClient,
            groupClient,
            messageClient
        }
    }

    private getProtoGrpcType(filename: string, dirs: string[]): unknown {
        const definition = protoLoader.loadSync(filename, {
            includeDirs: dirs,
            oneofs: true,
            defaults: true
        })
        return grpc.loadPackageDefinition(definition)
    }

    private getClient<Subtype>(constructor: SubtypeConstructor<typeof grpc.Client, Subtype>, address: string, credential: grpc.ChannelCredentials) {
        return new constructor(address, credential)
    }
}
