import animeConfig from "@configs/animeConfig";
import generateUrlPath from "./generateUrlPath";

interface Payload<T> {
  statusCode: number;
  statusMessage: string;
  message: string;
  ok: boolean;
  data: T;
  pagination: Pagination | null;
}

const config = (animeConfig as any).default || animeConfig;
const {
  molidonghubApi: { apiUrl, baseUrlPath },
} = config;

export default async function moli<T>(pathname: string): Promise<Payload<T>> {
  const fullPath = generateUrlPath(baseUrlPath, pathname);
  const url = new URL(fullPath, apiUrl).href;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
        return {
            statusCode: response.status,
            statusMessage: response.statusText,
            message: "Fetch error",
            ok: false,
            data: {} as T,
            pagination: null
        };
    }

    const result = await response.json();

    return {
        statusCode: 200,
        statusMessage: "OK",
        message: "Success",
        ok: result.status === "success" || Array.isArray(result) || !!result,
        data: result as T,
        pagination: null 
    };
  } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return {
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to fetch data",
        ok: false,
        data: {} as T,
        pagination: null
      };
  }
}