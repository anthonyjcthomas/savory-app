export interface EstablishmentType {
    id: string;
    name: string;
    image: string;
    description: string;
    rating: string;
    location: string;
    happy_hour_deals: {
        day: string;
        details: string;
        start_time: string;
        end_time: string;
        deal_list: string[]; 
    }[];
    latitude: string;
    longitude: string;
    category: string[];
    dotw: string[];
    cuisine: string;
}
