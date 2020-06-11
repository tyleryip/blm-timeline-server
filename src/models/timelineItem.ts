export default interface TimelineItem {
  id: string;
  title: string;
  text?: string;
  location: string;
  imageURL?: string;
  newsURL: string;
  date: Date;
}