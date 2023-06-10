import { Injectable } from '@nestjs/common';

export interface User {
    userId: number;
    email: string;
    username: string;
    password: string;
    twoFactorAuthenticationSecret: string;
    isTwoFactorAuthenticationEnabled: boolean;
}

@Injectable()
export class UsersService {
    private readonly users = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
            email: 'john.changeme@mail.com',
            isTwoFactorAuthenticationEnabled: false,
            twoFactorAuthenticationSecret: 'EJ7BOLC6LB2HOQYO'
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
            email: 'maria.guess@mail.com',
            isTwoFactorAuthenticationEnabled: false,
            twoFactorAuthenticationSecret: ''
        },
    ];

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        console.log(secret, userId);
        this.users.find(user => user.userId === userId).twoFactorAuthenticationSecret = secret;
    }

    async turnOnTwoFactorAuthentication(userId: number) {
        console.log(userId);
        this.users.find(user => user.userId === userId).isTwoFactorAuthenticationEnabled = true;
    }
}
