import { Injectable } from '@nestjs/common';

export interface PresenceUser {
    userId: string;
    lastSeenAt: Date;
}

/**
 * 在内存中维护在线用户表
 * 一个 userId 可对应多个 socketId(多端登录)
 * 当某个 userId 没有任何 socketId 时视为离线
 */
@Injectable()
export class PresenceService {
    private readonly socketsByUser = new Map<string, Set<string>>();
    private readonly userBySocket = new Map<string, PresenceUser>();

    add(userId: string, socketId: string) {
        if (!this.socketsByUser.has(userId)) {
            this.socketsByUser.set(userId, new Set());
        }
        this.socketsByUser.get(userId)!.add(socketId);
        this.userBySocket.set(socketId, { userId, lastSeenAt: new Date() });
    }

    remove(socketId: string): { userId: string; nowOffline: boolean } | null {
        const u = this.userBySocket.get(socketId);
        if (!u) return null;
        this.userBySocket.delete(socketId);
        const set = this.socketsByUser.get(u.userId);
        if (set) {
            set.delete(socketId);
            if (set.size === 0) {
                this.socketsByUser.delete(u.userId);
                return { userId: u.userId, nowOffline: true };
            }
        }
        return { userId: u.userId, nowOffline: false };
    }

    isOnline(userId: string): boolean {
        return this.socketsByUser.has(userId);
    }

    onlineUserIds(): string[] {
        return Array.from(this.socketsByUser.keys());
    }

    touch(socketId: string) {
        const u = this.userBySocket.get(socketId);
        if (u) u.lastSeenAt = new Date();
    }
}
