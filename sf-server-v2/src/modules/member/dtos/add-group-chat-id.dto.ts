import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum GroupChatType {
    DOMAIN = 'domain',
    CODE = 'code',
}

export class AddGroupChatIdDto {
    @ApiProperty({
        description: 'The group chat ID to add',
        example: 'chat_1234567890',
    })
    @IsString()
    @IsNotEmpty()
    chatId: string;

    @ApiProperty({
        description: 'The type of group chat ID (domain or code)',
        enum: GroupChatType,
        example: GroupChatType.DOMAIN,
    })
    @IsEnum(GroupChatType)
    @IsNotEmpty()
    type: GroupChatType;
}
