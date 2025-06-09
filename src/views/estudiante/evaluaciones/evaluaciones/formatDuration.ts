export const formatDuration = (totalSecs: number) => {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
};
