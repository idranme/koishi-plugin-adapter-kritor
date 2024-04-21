import * as Kritor from './types'
import { KritorBot } from './bot'
import { promisify } from 'node:util'

export class Internal {
    constructor(private bot: KritorBot) { }

    sendMessage(contact: Kritor.Contact, elements: Kritor.Element[]) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.sendMessage).bind(messageClient)
        return call({ contact, elements, retryCount: 3 })
    }

    getCurrentAccount() {
        const { coreClient } = this.bot.adapter.client
        const call = promisify(coreClient.getCurrentAccount).bind(coreClient)
        return call({})
    }

    getUidByUin(targetUins: (string | number)[]) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getUidByUin).bind(friendClient)
        return call({ targetUins })
    }

    recallMessage(contact: Kritor.Contact, messageId: string) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.recallMessage).bind(messageClient)
        return call({ contact, messageId })
    }

    getGroupList(refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupList).bind(groupClient)
        return call({ refresh })
    }

    getGroupInfo(groupId: number | string) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupInfo).bind(groupClient)
        return call({ groupId })
    }

    // sham 报错 UNKNOWN
    getGroupMemberInfo(groupId: number | string, targetUin: number | string, refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupMemberInfo).bind(groupClient)
        return call({ groupId, targetUin, target: 'targetUin', refresh })
    }

    // sham 报错 UNKNOWN
    getGroupMemberList(groupId: number | string, refresh?: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.getGroupMemberList).bind(groupClient)
        return call({ groupId, refresh })
    }

    kickMember(groupId: number | string, targetUin: number | string, rejectAddRequest?: boolean, kickReason?: string) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.kickMember).bind(groupClient)
        return call({ groupId, targetUin, target: 'targetUin', rejectAddRequest, kickReason })
    }

    banMember(groupId: number | string, targetUin: number | string, duration: number) {
        // duration 单位：秒
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.banMember).bind(groupClient)
        return call({ groupId, targetUin, target: 'targetUin', duration })
    }

    getFriendProfileCard(targetUins: (string | number)[]) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getFriendProfileCard).bind(friendClient)
        return call({ targetUins })
    }

    getFriendList(refresh?: boolean) {
        const { friendClient } = this.bot.adapter.client
        const call = promisify(friendClient.getFriendList).bind(friendClient)
        return call({ refresh })
    }

    getMessage(contact: Kritor.Contact, messageId: string) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.getMessage).bind(messageClient)
        return call({ contact, messageId })
    }

    // sham 报错 UNKNOWN
    getHistoryMessage(contact: Kritor.Contact, startMessageId?: string, count?: number) {
        const { messageClient } = this.bot.adapter.client
        const call = promisify(messageClient.getHistoryMessage).bind(messageClient)
        return call({ contact, startMessageId, count })
    }

    setGroupWholeBan(groupId: number | string, isBan: boolean) {
        const { groupClient } = this.bot.adapter.client
        const call = promisify(groupClient.setGroupWholeBan).bind(groupClient)
        return call({ groupId, isBan })
    }
}