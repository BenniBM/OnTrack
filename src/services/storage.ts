import { Goal } from "../types/goal";
import Dexie from "dexie";

export class GoalDatabase extends Dexie {
    goals!: Dexie.Table<Goal, string>;

    constructor() {
        super("GoalDatabase");
        this.version(1).stores({
            goals: "id, title, type, startDate, endDate, unit",
        });
    }
}

export const db = new GoalDatabase();
