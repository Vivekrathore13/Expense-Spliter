export const timeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "just now";

  const intervals = [
    { label: "y", sec: 31536000 },
    { label: "mo", sec: 2592000 },
    { label: "d", sec: 86400 },
    { label: "h", sec: 3600 },
    { label: "m", sec: 60 },
  ];

  for (let i of intervals) {
    const count = Math.floor(seconds / i.sec);
    if (count >= 1) return `${count}${i.label} ago`;
  }

  return "just now";
};
