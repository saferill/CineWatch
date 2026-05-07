import moli from "@utils/moli";

interface NewApiHome {
  latest_release: any[];
  completed_donghua: any[];
}

interface Home {
  recent: {
    href?: string;
    samehadakuUrl?: string;
    animeList: animeCard1[];
  };
  batch: {
    href?: string;
    samehadakuUrl?: string;
    batchList: animeCard1[];
  };
  movie: {
    href?: string;
    samehadakuUrl?: string;
    animeList: animeCard3[];
  };
}

export default async function homeService() {
  const result = await moli<NewApiHome>("/home/1");
  
  const recentList: animeCard1[] = (result.data.latest_release || []).map((item) => {
      const eps = (item.current_episode || "??").replace(/Ep\s*/i, "").trim();
      
      return {
        title: item.title,
        poster: item.poster,
        episodes: eps, 
        releasedOn: "Baru",
        animeId: item.slug, 
        href: `/episode/${item.slug}`
      };
  });

  const completedList: animeCard1[] = (result.data.completed_donghua || []).map((item) => ({
      title: item.title,
      poster: item.poster,
      episodes: "END",
      releasedOn: "Tamat",
      batchId: item.slug, 
      animeId: item.slug,
      href: `/anime/${item.slug}`
  }));

  const movieList: animeCard3[] = []; 

  const mappedData: Home = {
      recent: {
          animeList: recentList
      },
      batch: {
          batchList: completedList
      },
      movie: {
          animeList: movieList
      }
  };

  return { ...result, data: mappedData };
}
