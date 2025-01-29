import prisma from '../database'

export function getModerationChannel(channel_id: string) {
    return prisma.moderationChannel.findUnique({
        where: {channel_id}
    })
}