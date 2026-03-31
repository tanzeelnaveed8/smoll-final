import { Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { dynamicImport } from 'tsimportlib';
// import type { Room, RoomServiceClient } from 'livekit-server-sdk';

// export type LiveKitModule = typeof import('livekit-server-sdk');

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @Get('debug-livekit')
  // async debugLivekit() {
  //   const livekitHost = 'wss://sf-video-call-37ecfvzw.livekit.cloud';

  //   dynamicImport('livekit-server-sdk', module)
  //     .catch((err) => console.log(err))
  //     .then((livekit) => {
  //       const roomService: RoomServiceClient = new livekit.RoomServiceClient(
  //         livekitHost,
  //         'APIM7nzuducLZoA',
  //         'semA2dcvebKL1L3mKAP3efT5GaSesGxtTrdPxRxnHabD',
  //       );

  //       // roomService.deleteRoom

  //       roomService.listRooms().then((rooms: Room[]) => {

  //         roomService.deleteRoom(rooms[0].sid);
  //       });
  //     });
  // }
}
