import * as Kritor from './types'
import { KritorBot } from './bot'
import { promisify } from 'node:util'

export class Internal {
    constructor(private bot: KritorBot) { }

    sendMessage(contact: Kritor.Contact, elements: Kritor.Element[]) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.sendMessage)
        return call({ contact, elements, retryCount: 3 })
    }

    getCurrentAccount() {
        const { coreClient } = this.bot.adapter.client
        const call = promisify(coreClient.getCurrentAccount)
        return call({})
    }

    getUidByUin(targetUins: (string | number)[]) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getUidByUin)
        return call({ targetUins })
    }

    recallMessage(contact: Kritor.Contact, messageId: string) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.recallMessage)
        return call({ contact, messageId })
    }

    getGroupList(refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupList)
        return call({ refresh })
    }

    getGroupInfo(groupId: number | string) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupInfo)
        return call({ groupId })
    }

    // sham 报错 UNKNOWN
    getGroupMemberInfo(groupId: number | string, targetUin: number | string, refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupMemberInfo)
        return call({ groupId, targetUin, target: 'targetUin', refresh })
    }

    // sham 报错 UNKNOWN
    getGroupMemberList(groupId: number | string, refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupMemberList)
        return call({ groupId, refresh })
    }

    kickMember(groupId: number | string, targetUin: number | string, rejectAddRequest?: boolean, kickReason?: string) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.kickMember)
        return call({ groupId, targetUin, target: 'targetUin', rejectAddRequest, kickReason })
    }

    banMember(groupId: number | string, targetUin: number | string, duration: number) {
        // duration 单位：秒
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.banMember)
        return call({ groupId, targetUin, target: 'targetUin', duration })
    }

    getFriendProfileCard(targetUins: (string | number)[]) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getFriendProfileCard)
        return call({ targetUins })
    }

    getFriendList(refresh?: boolean) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getFriendList)
        return call({ refresh })
    }

    getMessage(contact: Kritor.Contact, messageId: string) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.getMessage)
        return call({ contact, messageId })
    }

    // sham 报错 UNKNOWN
    getHistoryMessage(contact: Kritor.Contact, startMessageId?: string, count?: number) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.getHistoryMessage)
        return call({ contact, startMessageId, count })
    }
}