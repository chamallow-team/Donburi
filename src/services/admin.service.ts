// TODO interroger la vraie base de donnée de Kady

export function isAdmin(user_id: string) {
    return ["782164174821523467", "550041732893376542"].includes(user_id);
}