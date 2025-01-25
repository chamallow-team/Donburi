import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient({});

export default prisma

export const INCIDENT_STATUS_IDS = {
    Crash: "4032870c-28b5-4269-9acc-fb25924635a7",
    Update: "3ae7c32e-b0ef-4ac3-9b79-2e6d67ebe3b9",
    Resolved: "5b7ce660-9e36-4cbb-873d-2ac34766542f"
}

export async function init_database() {
    let statusList = await prisma.incidentStatus.findMany({
        select: {status_id: true, status_label: true}
    });

    for (const [status_label, status_id] of Object.entries(INCIDENT_STATUS_IDS)) {
        if (!statusList.some((e) => e.status_id === status_id)) {
            await prisma.incidentStatus.upsert({
                create: {status_id, status_label},
                update: {status_label},
                where: {status_id}
            })
        }
    }
}
