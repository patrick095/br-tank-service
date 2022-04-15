/* eslint-disable @typescript-eslint/indent */
import { IsNotEmpty, MaxLength } from 'class-validator';
import { userSigninInterface } from 'src/interfaces/user.interface';

export class SigninDto implements userSigninInterface {
    @IsNotEmpty()
    @MaxLength(16)
    username: string;

    @IsNotEmpty()
    @MaxLength(16)
    password: string;
}
