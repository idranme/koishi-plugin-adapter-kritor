type Dict<T = any, K extends string = string> = {
    [key in K]: T;
};

declare namespace Kritor {
    type Scene =
        | 'GROUP'
        | 0
        | 'FRIEND'
        | 1
        | 'GUILD'
        | 2
        | 'STRANGER_FROM_GROUP'
        | 10
        | 'NEARBY'
        | 5
        | 'STRANGER'
        | 9

    interface Contact {
        'scene'?: (Scene);
        'peer'?: (string);
        'subPeer'?: (string);
        '_subPeer'?: "subPeer";
    }

    type _kritor_common_Element_ElementType =
        | 'TEXT'
        | 0
        | 'AT'
        | 1
        | 'FACE'
        | 2
        | 'BUBBLE_FACE'
        | 3
        | 'REPLY'
        | 4
        | 'IMAGE'
        | 5
        | 'VOICE'
        | 6
        | 'VIDEO'
        | 7
        | 'BASKETBALL'
        | 8
        | 'DICE'
        | 9
        | 'RPS'
        | 10
        | 'POKE'
        | 11
        | 'MUSIC'
        | 12
        | 'WEATHER'
        | 13
        | 'LOCATION'
        | 14
        | 'SHARE'
        | 15
        | 'GIFT'
        | 16
        | 'MARKET_FACE'
        | 17
        | 'FORWARD'
        | 18
        | 'CONTACT'
        | 19
        | 'JSON'
        | 20
        | 'XML'
        | 21
        | 'FILE'
        | 22
        | 'MARKDOWN'
        | 23
        | 'KEYBOARD'
        | 24

    interface Element {
        'type'?: (_kritor_common_Element_ElementType);
        'text'?: (Dict | null);
        'at'?: (Dict | null);
        'face'?: (Dict | null);
        'bubbleFace'?: (Dict | null);
        'reply'?: (Dict | null);
        'image'?: (Dict | null);
        'voice'?: (Dict | null);
        'video'?: (Dict | null);
        'basketball'?: (Dict | null);
        'dice'?: (Dict | null);
        'rps'?: (Dict | null);
        'poke'?: (Dict | null);
        'music'?: (Dict | null);
        'weather'?: (Dict | null);
        'location'?: (Dict | null);
        'share'?: (Dict | null);
        'gift'?: (Dict | null);
        'marketFace'?: (Dict | null);
        'forward'?: (Dict | null);
        'contact'?: (Dict | null);
        'json'?: (Dict | null);
        'xml'?: (Dict | null);
        'file'?: (Dict | null);
        'markdown'?: (Dict | null);
        'keyboard'?: (Dict | null);
        'data'?: "text" | "at" | "face" | "bubbleFace" | "reply" | "image" | "voice" | "video" | "basketball" | "dice" | "rps" | "poke" | "music" | "weather" | "location" | "share" | "gift" | "marketFace" | "forward" | "contact" | "json" | "xml" | "file" | "markdown" | "keyboard";
    }

    interface EventStructure__Output {
        'type': (0 | 1 | 2 | 3);
        'message'?: (Dict | null);
        'request'?: (Dict | null);
        'notice'?: (Dict | null);
        'event': "message" | "request" | "notice";
    }
}

declare class Internal {
    private bot;
    constructor(bot: any);
    sendMessage(contact: Kritor.Contact, elements: Kritor.Element[]): Promise<Dict>;
    getCurrentAccount(): Promise<Dict>;
    getUidByUin(targetUins: (string | number)[]): Promise<Dict>;
    recallMessage(contact: Kritor.Contact, messageId: string): Promise<Dict>;
    getGroupList(refresh?: boolean): Promise<Dict>;
    getGroupInfo(groupId: number | string): Promise<Dict>;
    getGroupMemberInfo(groupId: number | string, targetUin: number | string, refresh?: boolean): Promise<Dict>;
    getGroupMemberList(groupId: number | string, refresh?: boolean): Promise<Dict>;
    kickMember(groupId: number | string, targetUin: number | string, rejectAddRequest?: boolean, kickReason?: string): Promise<Dict>;
    banMember(groupId: number | string, targetUin: number | string, duration: number): Promise<Dict>;
    getFriendProfileCard(targetUins: (string | number)[]): Promise<Dict>;
    getFriendList(refresh?: boolean): Promise<Dict>;
    getMessage(contact: Kritor.Contact, messageId: string): Promise<Dict>;
    getHistoryMessage(contact: Kritor.Contact, startMessageId?: string, count?: number): Promise<Dict>;
    setGroupWholeBan(groupId: number | string, isBan: boolean): Promise<Dict>;
}

declare module '@satorijs/core' {
    interface Session {
        kritor: Kritor.EventStructure__Output & Internal
    }
}

export { }