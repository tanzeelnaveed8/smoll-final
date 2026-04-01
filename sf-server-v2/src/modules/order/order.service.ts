import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { Member } from '../member/member.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async create(memberId: string, dto: CreateOrderDto): Promise<Order> {
    const firstItem = dto.items[0];
    const type = firstItem?.type ?? 'service';
    const title =
      dto.items.length === 1
        ? firstItem.title
        : `${firstItem.title} +${dto.items.length - 1} more`;

    const order = this.orderRepo.create({
      memberId,
      type,
      title,
      total: dto.total,
      paymentIntentId: dto.paymentIntentId ?? null,
      items: dto.items,
      schedule: dto.schedule ?? null,
      status: 'pending',
    });

    return this.orderRepo.save(order);
  }

  async findAllByMember(memberId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { memberId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByMember(memberId: string, id: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id, memberId },
    });
  }

  async findAllForAdmin() {
    const orders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
    });

    if (!orders.length) return [];

    const memberIds = [...new Set(orders.map((o) => o.memberId))];
    const members = await this.memberRepo.findByIds(memberIds);
    const memberMap = new Map(members.map((m) => [m.id, { name: m.name, email: m.email }]));

    return orders.map((order) => ({
      ...order,
      member: memberMap.get(order.memberId) ?? null,
    }));
  }

  async findOneForAdmin(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
    });

    if (!order) return null;

    const member = await this.memberRepo.findOne({
      where: { id: order.memberId },
      select: ['name', 'email'],
    });

    return {
      ...order,
      member: member ?? null,
    };
  }

  async updateStatus(id: string, status: string) {
    await this.orderRepo.update(id, { status: status as OrderStatus });
    return this.findOneForAdmin(id);
  }
}
