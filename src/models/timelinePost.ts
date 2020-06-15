import City from './city';

export default interface TimelinePost {
  id: string;
  title: string;
  text?: string;
  city: City;
  imageURL?: string;
  newsURL: string;
  date: Date;
}
