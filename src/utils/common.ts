export const getYouTubeVideoIdFromUrl = (url: string) => {
  const youtubeIdFromUrlRegex =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S+)?$/;
  const match = url.match(youtubeIdFromUrlRegex);

  return match && match[1] ? match[1] : null;
};

// Hàm lấy Playlist ID từ URL
export const getYouTubePlaylistIdFromUrl = (url: string) => {
  const youtubePlaylistIdFromUrlRegex = /[&?]list=([^&]+)/i;
  const match = url.match(youtubePlaylistIdFromUrlRegex);

  return match && match[1] ? match[1] : null;
};
