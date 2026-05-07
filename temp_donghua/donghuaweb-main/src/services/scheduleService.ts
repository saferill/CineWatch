import moli from "@utils/moli";

interface NewApiSchedule {
    schedule: {
        day: string;
        donghua_list: any[];
    }[];
}

interface Schedule {
  days: {
    day: string;
    animeList: animeCard4[];
  }[];
}

export default async function scheduleService() {
  const result = await moli<NewApiSchedule>("/schedule");

  const days = (result.data.schedule || []).map((d) => ({
      day: d.day,
      animeList: (d.donghua_list || []).map((item) => ({
          title: item.title,
          poster: item.poster,
          type: "anime",
          score: "N/A",
          estimation: item.release_time || "",
          animeId: item.slug,
          genres: ""
      }))
  }));

  return { ...result, data: { days } };
}