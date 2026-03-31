// import { Injectable } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { NotificationService } from '../notification.service';
// import {
//   SESSION_ACCEPTED_EVENT,
//   SESSION_CREATED_EVENT,
//   SessionAcceptedEvent,
//   SessionCreatedEvent,
// } from 'src/chat/events/counselling.event';
// import { CounsellingService } from 'src/chat/services/counselling.service';

// @Injectable()
// export class CounsellingListener {
//   constructor(
//     private readonly notificationService: NotificationService,
//     private readonly counsellingService: CounsellingService,
//   ) {}

//   // private _getAssociatedUsers(ticket: Ticket) {
//   //   const workspace = ticket.workspace;

//   //   const client = workspace.clients ?? [];
//   //   const members = ticket.assignedMembers ?? [];
//   //   const owner = workspace.agency.owner;

//   //   if (client) {
//   //     return [owner, ...client, ...members];
//   //   }

//   //   return [owner, ...members];
//   // }

//   @OnEvent(SESSION_CREATED_EVENT)
//   async handleSessionCreatedEvent(event: SessionCreatedEvent) {
//     const { userId, userName } = event;

//     const counsellors = await this.counsellingService.findAllCounsellors();

//     counsellors.forEach(async (counsellor) => {
//       await this.notificationService.create(counsellor.id, {
//         message: `${userName} has created a new session request.`,
//         actionById: userId,
//       });
//     });
//   }

//   @OnEvent(SESSION_ACCEPTED_EVENT)
//   async handleSessionAcceptedEvent(event: SessionAcceptedEvent) {
//     const { userId, acceptedBy, acceptedById } = event;

//     await this.notificationService.create(userId, {
//       message: `${acceptedBy} has accepted your session request.`,
//       actionById: acceptedById,
//     });
//   }

//   // @OnEvent(TICKET_CREATED_EVENT)
//   // async handleTicketCreatedEvent(event: TicketCreatedEvent) {
//   //   const { ticket, userId } = event;

//   //   const users = this._getAssociatedUsers(ticket);

//   //   users.forEach(async (user) => {
//   // await this.notificationService.create(user.id, {
//   //   message: `"${ticket.title}" was created.`,
//   //   actionById: userId,
//   // });
//   //   });
//   // }

//   // @OnEvent(TICKET_COMMENTED_EVENT)
//   // handleTicketCommentedEvent(event: TicketCommentedEvent) {
//   //   const { ticket, userId, taggedUsers } = event;

//   //   taggedUsers.forEach((user) => {
//   //     this.notificationService.create(user.id, {
//   //       message: `${user.name} mentioned you in "${ticket.title}"`,
//   //       actionById: userId,
//   //     });
//   //   });
//   // }

//   // @OnEvent(TICKET_DELETED_EVENT)
//   // async handleTicketDeletedEvent(event: TicketDeletedEvent) {
//   //   const { ticket, userId } = event;

//   //   const users = this._getAssociatedUsers(ticket);

//   //   users.forEach(async (user) => {
//   //     await this.notificationService.create(user.id, {
//   //       message: `"${ticket.title}" was deleted.`,
//   //       actionById: userId,
//   //     });
//   //   });
//   // }

//   // @OnEvent(TICKET_MOVED_EVENT)
//   // handleTicketMovedEvent(event: TicketMovedEvent) {
//   //   const { ticket, userId, columnName } = event;

//   //   const users = this._getAssociatedUsers(ticket);

//   //   users.forEach((user) => {
//   //     this.notificationService.create(user.id, {
//   //       message: `"${ticket.title}" moved to column "${columnName}"`,
//   //       actionById: userId,
//   //     });
//   //   });
//   // }
// }
