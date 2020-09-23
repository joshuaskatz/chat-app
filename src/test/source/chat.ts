export const sendMessageMutation = `
    mutation SendMessage ($data: SendMessageInput!){
        sendMessage (data: $data){
            message
        }
    }
`;
