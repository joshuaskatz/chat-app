export const registerMutation = `
            mutation Register($data: RegisterInput!){
                register(
                    data: $data
                ){
                token
                user{
                    id
                    username
                    email
                }
             }
        }
    `;

export const loginMutation = `
            mutation Login($data: LoginInput!){
                login(
                    data: $data
                ){
                token
                user{
                    id
                    username
                    email
                }
             }
        }
    `;

export const passwordResetRequestMutation = `
            mutation RequestResetPassword($email: String!){
                requestResetPassword(
                    email: $email
                )
        }
    `;

export const resetPasswordMutation = `
            mutation ResetPassword($data: ResetPasswordInput!){
                resetPassword(
                    data: $data
                )
        }
    `;
