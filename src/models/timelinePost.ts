import City from './city';
import { mapKeys } from '../util/db';

export default interface TimelinePost {
  id: string;
  title: string;
  text?: string;
  cityName: string;
  city?: City;
  imageURL?: string;
  newsURL: string;
  date: Date;
}

export const fromDatabase = (obj: Record<string, any>): TimelinePost => {
  return mapKeys(obj, [
    ['city_name', 'cityName'],
    ['news_url', 'newsURL'],
    ['image_url', 'imageURL'],
  ]) as TimelinePost;
};
