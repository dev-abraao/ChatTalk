"use server";

import { prisma } from "@/(lib)/db";

export async function getAblyKey() {
    const ablyKey = await prisma.settings.findFirst()
    if (!ablyKey) {
        console.error('Ably key not found in database');
        return null;
    }
    return ablyKey.ably_key;
}