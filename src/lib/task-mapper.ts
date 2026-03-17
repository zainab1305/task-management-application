import { decryptText } from "@/lib/crypto";

type TaskLike = {
  _id: unknown;
  title: string;
  descriptionEncrypted: string;
  status: string;
  createdDate: Date;
};

export function toTaskResponse(task: TaskLike) {
  return {
    id: String(task._id),
    title: task.title,
    description: decryptText(task.descriptionEncrypted),
    status: task.status,
    createdDate: task.createdDate,
  };
}
