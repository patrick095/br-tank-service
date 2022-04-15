/* eslint-disable @typescript-eslint/indent */
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { userInterface } from 'src/interfaces/user.interface';

export class SignupDto implements userInterface {
    @IsNotEmpty()
    @MaxLength(64)
    name: string;

    @IsNotEmpty()
    @MaxLength(16)
    username: string;

    @IsNotEmpty()
    @MaxLength(16)
    password: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(50)
    email: string;
}
