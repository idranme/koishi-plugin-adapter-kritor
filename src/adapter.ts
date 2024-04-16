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

    constructor(ctx: C, private bot: B) {
        super(ctx)
        this.logger = bot.logger
        bot.adapter = this
    }

    async connect() {
        try {
            this.client = this.init(this.bot.config.address)
            this.ctx.on('dispose', () => {
                for (const item of Object.values(this.client)) {
                    grpc.closeClient(item)
                }
            })
            const account = await this.bot.internal.getCurrentAccount()
            this.registerActiveListener(Kritor.EventType.EVENT_TYPE_MESSAGE)
            this.registerActiveListener(Kritor.EventType.EVENT_TYPE_NOTICE)
            this.registerActiveListener(Kritor.EventType.EVENT_TYPE_REQUEST)
            this.bot.update({
                user: decodeLoginUser(account),
                status: Universal.Status.ONLINE
            })
            this.logger.info('connect to server: %c', this.bot.config.address)
        }
        catch (err) {
            if (err.message) this.logger.warn(err.message)
            this.bot.update({
                status: Universal.Status.RECONNECT
            })
            const timeout = this.bot.config.retryInterval
            this.logger.info(`will retry connection in ${Time.format(timeout)}...`)
            this.ctx.setTimeout(async () => await this.connect(), timeout)
        }
    }

    async disconnect() {
        this.bot.offline()
    }

    private async onData(input: Kritor.EventStructure__Output, type: Kritor.EventType) {
        // debug
        this.logger.info(input)
        const session = await createSession(this.bot, input)
        if (session) this.bot.dispatch(session)
    }

    private onEnd(type: Kritor.EventType) {
        this.ctx.setTimeout(() => this.registerActiveListener(type), this.bot.config.retryLazy)
    }

    private onError(err: Error, type: Kritor.EventType) {
        this.logger.debug(err)
    }

    private registerActiveListener(type: Kritor.EventType) {
        const { eventClient } = this.client
        const eventStream = eventClient.RegisterActiveListener({ type })
        eventStream.on('data', async (chunk) => await this.onData(chunk, type))
        eventStream.on('end', () => this.onEnd(type))
        eventStream.on('error', (err) => this.onError(err, type))
        this.ctx.on('dispose', () => {
            eventStream.destroy()
        })
    }

    private init(address: string) {
        // Forked from https://github.com/KarinJS/kritor-ts/blob/2f7cf14012ce72e8d92e6a0426acbf76be270ea0/src/api.ts#L45

        const authenticationProtoGrpcType = this.getProtoGrpcType('auth/authentication.proto', [__dirname + '/kritor/protos']) as Kritor.AuthenticationProtoGrpcType
        const coreProtoGrpcType = this.getProtoGrpcType('core/core.proto', [__dirname + '/kritor/protos']) as Kritor.CoreProtoGrpcType
        const eventProtoGrpcType = this.getProtoGrpcType('event/event.proto', [__dirname + '/kritor/protos']) as Kritor.EventProtoGrpcType
        const friendProtoGrpcType = this.getProtoGrpcType('friend/friend.proto', [__dirname + '/kritor/protos']) as Kritor.FriendProtoGrpcType
        const groupProtoGrpcType = this.getProtoGrpcType('group/group.proto', [__dirname + '/kritor/protos']) as Kritor.GroupProtoGrpcType
        const groupFileProtoGrpcType = this.getProtoGrpcType('file/group_file.proto', [__dirname + '/kritor/protos']) as Kritor.GroupFileProtoGrpcType
        const messageProtoGrpcType = this.getProtoGrpcType('message/message.proto', [__dirname + '/kritor/protos']) as Kritor.MessageProtoGrpcType
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

    private getProtoGrpcType(filename: string, dirs: string[]) {
        const definition = protoLoader.loadSync(filename, { includeDirs: dirs })
        return grpc.loadPackageDefinition(definition) as unknown
    }

    private getClient<Subtype>(constructor: SubtypeConstructor<typeof grpc.Client, Subtype>, address: string, credential: grpc.ChannelCredentials) {
        return new constructor(address, credential)
    }
}
