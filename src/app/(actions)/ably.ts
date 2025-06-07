"use server";

import { prisma } from "@/(lib)/db";

export async function getAblyKey() {
    const ablyKey = await prisma.settings.findFirst()
    if (!ablyKey) {
        console.error('Ably key not found in database');
        return process.env.NEXT_PUBLIC_ABLY_API_KEY || undefined;
    }
    return ablyKey.ably_key;
}