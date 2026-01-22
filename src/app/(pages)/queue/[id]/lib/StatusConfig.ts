export const statusConfig: Record<string, { color: string; message: string }> = {
  WAITING: {
    color: "text-yellow-600",
    message: "Please wait for your turn",
  },
  CALLING: {
    color: "text-blue-600",
    message: "Your number is being called",
  },
  SKIPPED: {
    color: "text-red-600",
    message: "You missed your call",
  },
  DONE: {
    color: "text-green-600",
    message: "Queue completed",
  },
};