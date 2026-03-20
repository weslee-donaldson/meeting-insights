import type { ElectronAPI } from "../../../electron/channels.js";
import { meetingsMethods } from "./meetings.js";
import { chatMethods } from "./chat.js";
import { threadsMethods } from "./threads.js";
import { insightsMethods } from "./insights.js";
import { milestonesMethods } from "./milestones.js";
import { notesMethods } from "./notes.js";

export const apiClient: ElectronAPI = {
  ...meetingsMethods,
  ...chatMethods,
  ...threadsMethods,
  ...insightsMethods,
  ...milestonesMethods,
  ...notesMethods,
};
