// Fork from https://github.com/KarinJS/kritor-ts
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType as AuthenticationProtoGrpcType } from './generated/authentication'
import { ProtoGrpcType as CoreProtoGrpcType } from './generated/core'
import { ProtoGrpcType as CustomizationProtoGrpcType } from './generated/customization'
import { ProtoGrpcType as DeveloperProtoGrpcType } from './generated/developer'
import { ProtoGrpcType as EventProtoGrpcType } from './generated/event'
import { ProtoGrpcType as FriendProtoGrpcType } from './generated/friend'
import { ProtoGrpcType as GroupProtoGrpcType } from './generated/group'
import { ProtoGrpcType as GroupFileProtoGrpcType } from './generated/group_file'
import { ProtoGrpcType as GuildProtoGrpcType } from './generated/guild'
import { ProtoGrpcType as MessageProtoGrpcType } from './generated/message'
import { ProtoGrpcType as QsignProtoGrpcType } from './generated/qsign'
import { ProtoGrpcType as ReverseProtoGrpcType } from './generated/reverse'
import { ProtoGrpcType as WebProtoGrpcType } from './generated/web'

import { _kritor_authentication_AuthenticateResponse_AuthenticateResponseCode__Output } from './generated/kritor/authentication/AuthenticateResponse'
import { _kritor_common_Response_ResponseCode__Output } from './generated/kritor/common/Response'
import { TicketOperationResponseCode__Output } from './generated/kritor/authentication/TicketOperationResponseCode'
import { EssenceMessageBody__Output } from './generated/kritor/common/EssenceMessageBody'
import { PushMessageBody__Output } from './generated/kritor/common/PushMessageBody'
import { EventStructure__Output } from './generated/kritor/event/EventStructure'
import { ProfileCard__Output } from './generated/kritor/friend/ProfileCard'
import { FriendInfo__Output } from './generated/kritor/friend/FriendInfo'
import { GroupInfo__Output } from './generated/kritor/group/GroupInfo'
import { Folder__Output } from './generated/kritor/file/Folder'
import { File__Output } from './generated/kritor/file/File'
import { ForwardMessageBody } from './generated/kritor/common/ForwardMessageBody'
import { EventType } from './generated/kritor/event/EventType'
import { Contact } from './generated/kritor/common/Contact'
import { Element } from './generated/kritor/common/Element'

function getProtoGrpcType(filename: string, dirs: string[]) {
    const definition = protoLoader.loadSync(filename, { includeDirs: dirs })
    return grpc.loadPackageDefinition(definition) as unknown
}

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
    new(...args: ConstructorParameters<Constructor>): Subtype
}
function getClient<Subtype>(constructor: SubtypeConstructor<typeof grpc.Client, Subtype>, host: string, credential: grpc.ChannelCredentials) {
    return new constructor(host, credential)
}

export function init(host: string, timeout: number = 5000) {
    const authenticationProtoGrpcType = getProtoGrpcType('auth/authentication.proto', [__dirname + '/kritor/protos']) as AuthenticationProtoGrpcType
    const coreProtoGrpcType = getProtoGrpcType('core/core.proto', [__dirname + '/kritor/protos']) as CoreProtoGrpcType
    const customizationProtoGrpcType = getProtoGrpcType('customization/customization.proto', [__dirname + '/kritor/protos']) as CustomizationProtoGrpcType
    const developerProtoGrpcType = getProtoGrpcType('developer/developer.proto', [__dirname + '/kritor/protos']) as DeveloperProtoGrpcType
    const eventProtoGrpcType = getProtoGrpcType('event/event.proto', [__dirname + '/kritor/protos']) as EventProtoGrpcType
    const friendProtoGrpcType = getProtoGrpcType('friend/friend.proto', [__dirname + '/kritor/protos']) as FriendProtoGrpcType
    const groupProtoGrpcType = getProtoGrpcType('group/group.proto', [__dirname + '/kritor/protos']) as GroupProtoGrpcType
    const groupFileProtoGrpcType = getProtoGrpcType('file/group_file.proto', [__dirname + '/kritor/protos']) as GroupFileProtoGrpcType
    const guildProtoGrpcType = getProtoGrpcType('guild/guild.proto', [__dirname + '/kritor/protos']) as GuildProtoGrpcType
    const messageProtoGrpcType = getProtoGrpcType('message/message.proto', [__dirname + '/kritor/protos']) as MessageProtoGrpcType
    const qsignProtoGrpcType = getProtoGrpcType('developer/qsign.proto', [__dirname + '/kritor/protos']) as QsignProtoGrpcType
    const reverseProtoGrpcType = getProtoGrpcType('reverse/reverse.proto', [__dirname + '/kritor/protos']) as ReverseProtoGrpcType
    const webProtoGrpcType = getProtoGrpcType('web/web.proto', [__dirname + '/kritor/protos']) as WebProtoGrpcType

    const credential = grpc.credentials.createInsecure()

    const authenticationClient = getClient(authenticationProtoGrpcType.kritor.authentication.AuthenticationService, host, credential)
    const reverseClient = getClient(reverseProtoGrpcType.kritor.reverse.ReverseService, host, credential)
    const coreClient = getClient(coreProtoGrpcType.kritor.core.CoreService, host, credential)
    const customizationClient = getClient(customizationProtoGrpcType.kritor.customization.CustomizationService, host, credential)
    const developerClient = getClient(developerProtoGrpcType.kritor.developer.DeveloperService, host, credential)
    const qsignClient = getClient(qsignProtoGrpcType.kritor.developer.QsignService, host, credential)
    const eventClient = getClient(eventProtoGrpcType.kritor.event.EventService, host, credential)
    const groupFileClient = getClient(groupFileProtoGrpcType.kritor.file.GroupFileService, host, credential)
    const friendClient = getClient(friendProtoGrpcType.kritor.friend.FriendService, host, credential)
    const groupClient = getClient(groupProtoGrpcType.kritor.group.GroupService, host, credential)
    const guildClient = getClient(guildProtoGrpcType.kritor.guild.GuildService, host, credential)
    const messageClient = getClient(messageProtoGrpcType.kritor.message.MessageService, host, credential)
    const webClient = getClient(webProtoGrpcType.kritor.web.WebService, host, credential)

    const deadline = new Date()
    deadline.setSeconds(deadline.getSeconds() + timeout)
    Promise.resolve(authenticationClient.waitForReady(deadline, function* (error?: Error) {
        if (error) {
            throw error
        }
    }))

    return {
        authenticationClient,
        reverseClient,
        coreClient,
        customizationClient,
        developerClient,
        qsignClient,
        eventClient,
        groupFileClient,
        friendClient,
        groupClient,
        guildClient,
        messageClient,
        webClient,
    }
}

export function authentication(client: ReturnType<typeof init>, account: string, ticket: string, callback: (code: _kritor_authentication_AuthenticateResponse_AuthenticateResponseCode__Output, msg: string) => void) {
    const { authenticationClient } = client
    authenticationClient.authenticate({ account, ticket }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.code, response.msg)
        }
    })
}

export function getAuthenticationState(client: ReturnType<typeof init>, account: string, callback: (isRequired: boolean) => void) {
    const { authenticationClient } = client
    authenticationClient.getAuthenticationState({ account }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isRequired)
        }
    })
}

export function getTicket(client: ReturnType<typeof init>, account: string, superTicket: string, callback: (code: TicketOperationResponseCode__Output, msg: string, ticket: string[]) => void) {
    const { authenticationClient } = client
    authenticationClient.getTicket({ account, superTicket }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.code, response.msg, response.tickets)
        }
    })
}

export function addTicket(client: ReturnType<typeof init>, account: string, superTicket: string, ticket: string, callback: (code: TicketOperationResponseCode__Output, msg: string) => void) {
    const { authenticationClient } = client
    authenticationClient.addTicket({ account, superTicket, ticket }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.code, response.msg)
        }
    })
}

export function deleteTicket(client: ReturnType<typeof init>, account: string, superTicket: string, ticket: string, callback: (code: TicketOperationResponseCode__Output, msg: string) => void) {
    const { authenticationClient } = client
    authenticationClient.deleteTicket({ account, superTicket, ticket }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.code, response.msg)
        }
    })
}

export function getVersion(client: ReturnType<typeof init>, callback: (version: string, app_name: string) => void) {
    const { coreClient } = client
    coreClient.getVersion({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.version, response.appName)
        }
    })
}

export function downloadFile(client: ReturnType<typeof init>, url: string, base64: string, rootPath: string, fileName: string, threadCnt: number, headers: string, callback: (file_absolute_path: string, file_md5: string) => void) {
    const { coreClient } = client
    coreClient.downloadFile({ url, base64, rootPath, fileName, threadCnt, headers }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.fileAbsolutePath, response.fileMd5)
        }
    })
}

export function getCurrentAccount(client: ReturnType<typeof init>, callback: (accountUid: string, accountUin: number, accountName: string) => void) {
    const { coreClient } = client
    coreClient.getCurrentAccount({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.accountUid, parseInt(response.accountUin), response.accountName)
        }
    })
}

export function switchAccount(client: ReturnType<typeof init>, accountUid: string, accountUin: number, superTicket: string, callback: () => void) {
    const { coreClient } = client
    coreClient.switchAccount({ accountUid, accountUin, superTicket }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function CallFunction(client: ReturnType<typeof init>, cmd: string, seq: number, buf: Buffer, noResponse: boolean, callback: (cmd: string, seq: number, code: _kritor_common_Response_ResponseCode__Output, msg: string, buf: Buffer) => void) {
    const { customizationClient } = client
    customizationClient.CallFunction({ cmd, seq, buf, noResponse }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.cmd, response.seq, response.code, response.msg, response.buf)
        }
    })
}

export function shell(client: ReturnType<typeof init>, command: string, directory: string, callback: (isSuccess: boolean, data: string) => void) {
    const { developerClient } = client
    developerClient.shell({ command, directory }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isSuccess, response.data)
        }
    })
}

export function getLog(client: ReturnType<typeof init>, start: number, recent: boolean, callback: (isSuccess: boolean, log: string) => void) {
    const { developerClient } = client
    developerClient.getLog({ start, recent }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isSuccess, response.log)
        }
    })
}

export function clearCache(client: ReturnType<typeof init>, callback: () => void) {
    const { developerClient } = client
    developerClient.clearCache({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function getDeviceBattery(client: ReturnType<typeof init>, callback: (battery: number, scale: number, status: number) => void) {
    const { developerClient } = client
    developerClient.getDeviceBattery({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.battery, response.scale, response.status)
        }
    })
}

export function uploadImage(client: ReturnType<typeof init>, file: Buffer, fileName: string, filePath: string, fileUrl: string, groupId: number, callback: (isSuccess: boolean, imageUrl: string) => void) {
    const { developerClient } = client
    developerClient.uploadImage({ file, fileName, filePath, fileUrl, groupId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isSuccess, response.imageUrl)
        }
    })
}

export function sendPacket(client: ReturnType<typeof init>, command: string, requestBuffer: Buffer, isProtobuf: boolean, attrs: Record<string, string>, callback: (isSuccess: boolean, responseBuffer: Buffer) => void) {
    const { developerClient } = client
    developerClient.sendPacket({ command, requestBuffer, isProtobuf, attrs }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isSuccess, response.responseBuffer)
        }
    })
}

export function sign(client: ReturnType<typeof init>, uin: string, command: string, seq: number, buffer: Buffer, qua: string, callback: (secSig: Buffer, secDeviceToken: Buffer, secExtra: Buffer) => void) {
    const { qsignClient } = client
    qsignClient.Sign({ uin, command, seq, buffer, qua }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.secSig, response.secDeviceToken, response.secExtra)
        }
    })
}

export function energy(client: ReturnType<typeof init>, data: string, salt: Buffer, callback: (result: Buffer) => void) {
    const { qsignClient } = client
    qsignClient.Energy({ data, salt }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.result)
        }
    })
}

export function getCmdWhitelist(client: ReturnType<typeof init>, callback: (commands: string[]) => void) {
    const { qsignClient } = client
    qsignClient.GetCmdWhitelist({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.commands)
        }
    })
}

export function RegisterActiveListener(client: ReturnType<typeof init>, type: EventType, dataCallback: (event: EventStructure__Output) => void, endCallback: () => void, errorCallback: (e: Error) => void) {
    const { eventClient } = client
    const eventStream = eventClient.RegisterActiveListener({ type })
    eventStream.on('data', dataCallback)
    eventStream.on('end', endCallback)
    eventStream.on('error', errorCallback)
}

export function createFolder(client: ReturnType<typeof init>, groupId: number, name: string, callback: (id: string, usedSpace: number) => void) {
    const { groupFileClient } = client
    groupFileClient.createFolder({ groupId, name }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.id, parseInt(response.usedSpace))
        }
    })
}

export function renameFolder(client: ReturnType<typeof init>, groupId: number, folderId: string, name: string, callback: () => void) {
    const { groupFileClient } = client
    groupFileClient.renameFolder({ groupId, folderId, name }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function deleteFolder(client: ReturnType<typeof init>, groupId: number, folderId: string, callback: () => void) {
    const { groupFileClient } = client
    groupFileClient.deleteFolder({ groupId, folderId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function deleteFile(client: ReturnType<typeof init>, groupId: number, fileId: string, busId: number, callback: () => void) {
    const { groupFileClient } = client
    groupFileClient.deleteFile({ groupId, fileId, busId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function getFileSystemInfo(client: ReturnType<typeof init>, groupId: number, callback: (fileCount: number, totalCount: number, usedSpace: number, totalSpace: number) => void) {
    const { groupFileClient } = client
    groupFileClient.getFileSystemInfo({ groupId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.fileCount, response.totalCount, response.usedSpace, response.totalSpace)
        }
    })
}

export type File = File__Output
export type Folder = Folder__Output
export function getFileList(client: ReturnType<typeof init>, groupId: number, folderId: string, callback: (files: File__Output[], folders: Folder__Output[]) => void) {
    const { groupFileClient } = client
    groupFileClient.getFileList({ groupId, folderId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.files, response.folders)
        }
    })
}

export type FriendInfo = FriendInfo__Output
export function getFriendList(client: ReturnType<typeof init>, callback: (friendsInfo: FriendInfo[]) => void) {
    const { friendClient } = client
    friendClient.getFriendList({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.friendsInfo)
        }
    })
}

export type ProfileCard = ProfileCard__Output
export function getFriendProfileCard(client: ReturnType<typeof init>, targetUids: string[], targetUins: number[], callback: (profileCards: ProfileCard[]) => void) {
    const { friendClient } = client
    friendClient.getFriendProfileCard({ targetUids, targetUins }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.friendsProfileCard)
        }
    })
}

export function getStrangerProfileCard(client: ReturnType<typeof init>, targetUids: string[], targetUins: number[], callback: (profileCards: ProfileCard[]) => void) {
    const { friendClient } = client
    friendClient.getStrangerProfileCard({ targetUids, targetUins }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.strangersProfileCard)
        }
    })
}

export function setProfileCard(client: ReturnType<typeof init>, nickName: string, company: string, email: string, college: string, personalNote: string, birthday: number, age: number, callback: () => void) {
    const { friendClient } = client
    friendClient.setProfileCard({ nickName, company, email, college, personalNote, birthday, age }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function isBlackListUser(client: ReturnType<typeof init>, targetUid: string, callback: (isBlackListUser: boolean) => void) {
    const { friendClient } = client
    friendClient.isBlackListUser({ targetUid }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.isBlackListUser)
        }
    })
}

export function voteUser(client: ReturnType<typeof init>, targetUid: string, voteCount: number, callback: () => void) {
    const { friendClient } = client
    friendClient.voteUser({ targetUid, voteCount }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function getUidByUin(client: ReturnType<typeof init>, targetUins: number[], callback: (uidMap: Record<number, string>) => void) {
    const { friendClient } = client
    friendClient.getUidByUin({ targetUins }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.uidMap)
        }
    })
}

export function getUinByUid(client: ReturnType<typeof init>, targetUids: string[], callback: (uinMap: Record<string, number>) => void) {
    const { friendClient } = client
    friendClient.getUinByUid({ targetUids }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(Object.fromEntries(Object.entries(response.uinMap).map(([key, value]) => [key, parseInt(value)])))
        }
    })
}


export function getGroupList(client: ReturnType<typeof init>, callback: (groups: GroupInfo__Output[]) => void) {
    const { groupClient } = client
    groupClient.getGroupList({}, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.groupsInfo)
        }
    })
}

export function sendMessage(client: ReturnType<typeof init>, contact: Contact, elements: Element[], retryCount: number, callback: (messageId: string, messageTime: number) => void) {
    const { messageClient } = client
    messageClient.sendMessage({ contact, elements, retryCount }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messageId, response.messageTime)
        }
    })
}

export function sendMessageByResId(client: ReturnType<typeof init>, contact: Contact, resId: string, retryCount: number, callback: (messageId: string, messageTime: number) => void) {
    const { messageClient } = client
    messageClient.sendMessageByResId({ contact, resId, retryCount }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messageId, response.messageTime)
        }
    })
}

export function setMessageReaded(client: ReturnType<typeof init>, contact: Contact, callback: () => void) {
    const { messageClient } = client
    messageClient.setMessageReaded({ contact }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function recallMessage(client: ReturnType<typeof init>, contact: Contact, messageId: string, callback: () => void) {
    const { messageClient } = client
    messageClient.recallMessage({ contact, messageId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function reactMessageWithEmoji(client: ReturnType<typeof init>, contact: Contact, messageId: string, faceId: number, isSet: boolean, callback: () => void) {
    const { messageClient } = client
    messageClient.reactMessageWithEmoji({ contact, messageId, faceId, isSet }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export type PushMessageBody = PushMessageBody__Output
export function getMessage(client: ReturnType<typeof init>, contact: Contact, messageId: string, callback: (message: PushMessageBody) => void) {
    const { messageClient } = client
    messageClient.getMessage({ contact, messageId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.message)
        }
    })
}

export function getMessageBySeq(client: ReturnType<typeof init>, contact: Contact, messageSeq: number, callback: (message: PushMessageBody) => void) {
    const { messageClient } = client
    messageClient.getMessageBySeq({ contact, messageSeq }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.message)
        }
    })
}

export function getHistoryMessage(client: ReturnType<typeof init>, contact: Contact, startMessageId: string, count: number, callback: (messages: PushMessageBody[]) => void) {
    const { messageClient } = client
    messageClient.getHistoryMessage({ contact, startMessageId, count }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messages)
        }
    })
}

export function getHistoryMessageBySeq(client: ReturnType<typeof init>, contact: Contact, startMessageSeq: number, count: number, callback: (messages: PushMessageBody[]) => void) {
    const { messageClient } = client
    messageClient.getHistoryMessageBySeq({ contact, startMessageSeq, count }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messages)
        }
    })
}

export function uploadForwardMessage(client: ReturnType<typeof init>, contact: Contact, messages: ForwardMessageBody[], retryCount: number, callback: (resId: string) => void) {
    const { messageClient } = client
    messageClient.uploadForwardMessage({ contact, messages, retryCount }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.resId)
        }
    })
}

export function downloadForwardMessage(client: ReturnType<typeof init>, resId: string, callback: (messages: PushMessageBody[]) => void) {
    const { messageClient } = client
    messageClient.downloadForwardMessage({ resId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messages)
        }
    })
}

export type EssenceMessageBody = EssenceMessageBody__Output
export function getEssenceMessageList(client: ReturnType<typeof init>, groupId: number, page: number, pageSize: number, callback: (messages: EssenceMessageBody__Output[]) => void) {
    const { messageClient } = client
    messageClient.getEssenceMessageList({ groupId, page, pageSize }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.messages)
        }
    })
}

export function setEssenceMessage(client: ReturnType<typeof init>, groupId: number, messageId: string, callback: () => void) {
    const { messageClient } = client
    messageClient.setEssenceMessage({ groupId, messageId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function deleteEssenceMessage(client: ReturnType<typeof init>, groupId: number, messageId: string, callback: () => void) {
    const { messageClient } = client
    messageClient.deleteEssenceMessage({ groupId, messageId }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback()
        }
    })
}

export function getCookies(client: ReturnType<typeof init>, domain: string, callback: (cookie: string) => void) {
    const { webClient } = client
    webClient.GetCookies({ domain }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.cookie)
        }
    })
}

export function getCredentials(client: ReturnType<typeof init>, domain: string, callback: (bkn: string, cookie: string) => void) {
    const { webClient } = client
    webClient.GetCredentials({ domain }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.bkn, response.cookie)
        }
    })
}

export function getCSRFToken(client: ReturnType<typeof init>, domain: string, callback: (bkn: string) => void) {
    const { webClient } = client
    webClient.GetCSRFToken({ domain }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.bkn)
        }
    })
}

export function getHttpCookies(client: ReturnType<typeof init>, appid: string, daid: string, jumpUrl: string, callback: (cookie: string) => void) {
    const { webClient } = client
    webClient.GetHttpCookies({ appid, daid, jumpUrl }, (err, response) => {
        if (err) {
            throw err
        } else {
            callback(response.cookie)
        }
    })
}