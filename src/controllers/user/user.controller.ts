import { Body, Controller, Post, Put, UsePipes } from '@nestjs/common';
import { SigninDto } from 'src/dto/user/signin-dto';
import { SignupDto } from 'src/dto/user/signup-dto';
import { UserNotFoundException } from 'src/exceptions/user.exceptions';
import { CustomValidationPipe } from 'src/pipes/validation.pipe';
import { PlayerService } from 'src/services/player/player.service';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly playerService: PlayerService) {}

    @Post()
    @UsePipes(new CustomValidationPipe())
    async signin(@Body() { username, password }: SigninDto) {
        try {
            const user = await this.userService.findOne({ username, email: username, password });
            return user;
        } catch {
            throw new UserNotFoundException();
        }
    }

    @Put()
    @UsePipes(new CustomValidationPipe())
    signup(@Body() user: SignupDto) {
        return this.userService.create(user);
    }
}
