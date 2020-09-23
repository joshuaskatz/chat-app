export const createChatRoomMutation = `
    mutation CreateChatRoom($friends: [Int!]!){
        createChatRoom(
            friends: $friends
        )
    }
`;

export const leaveChatRoomMutation = `
    mutation LeaveChatRoom($chatRoomId: Int!){
        leaveChatRoom(
            chatRoomId: $chatRoomId
        )
    }
`;
