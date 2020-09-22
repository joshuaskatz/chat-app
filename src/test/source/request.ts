export const friendRequestMutation = `
            mutation FriendRequest($user: Int!){
                friendRequest(
                    user: $user
                )
            }
`;

export const acceptFriendRequestMutation = `
            mutation AcceptFriendRequest($token: String!){
                acceptFriendRequest(
                    token: $token
                )
            }
`;

export const deleteFriendRequestMutation = `
            mutation DeleteFriendRequest($token: String!){
                deleteFriendRequest(
                    token: $token
                )
            }
`;

export const removeFriendMutation = `
            mutation RemoveFriend($user: Int!){
                removeFriend(
                    user: $user
                )
            }
`;
