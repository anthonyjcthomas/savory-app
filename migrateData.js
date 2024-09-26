import { collection, setDoc, doc, writeBatch } from "firebase/firestore"; // Firestore imports
import { db, auth } from './firebaseConfig'; // Firebase config import
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase authentication


const establishments = [
    {
     "id": "1",
     "name": "The Kollege Klub",
     "image": "https://i.imgur.com/PLOsG3Q.jpeg",
     "description": "The Kollege Klub, also known as KK, is a popular bar and restaurant located in the heart of Madison, WI. Known for its lively atmosphere and great deals, it's a favorite spot for college students and locals alike.",
     "rating": "3.9",
     "location": "529 N Lake St, Madison, WI 53703",
     "happy_hour_deals": [
         {
             "day": "Tuesday-Thursday",
             "details": "6:00-8:00: $15 Cheeseburger Basket and Bottomless Tap Beer.",
             "start_time": "18:00",
             "end_time": "d",
             "deal_list": ["Tuesday", "Wednesday", "Thursday"]
         },
         {
             "day": "Friday After Class (FAC)",
             "details": "$3 Fireball Shots and $1 Grilled Cheese from 1:00-8:00PM. $1 White Claws from 2:00-4:00PM, $2 4:00-6:00, $3 6:00-8:00PM.",
             "start_time": "13:00",
             "end_time": "20:00",
             "deal_list": ["Friday"]
         },
         {
             "day": "Sunday",
             "details": "6:00-Close: Free Darts, $2.50 Long Islands, $3 Truly's, $3 Sun Cruisers, $5 Chicken Tender Baskets.",
             "start_time": "18:00",
             "end_time": "02:00",
             "deal_list": ["Sunday"]
         }
     ],
     "latitude": "43.0753",
     "longitude": "-89.3962",
     "category": ["Drinks", "Combos"],
     "dotw": ["Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
     "cuisine": "American"
 },
 {
     "id": "2",
     "name": "Canteen",
     "image": "https://i.imgur.com/OjFeKxh.jpeg",
     "description": "Canteen is a vibrant restaurant in Madison, WI, known for its delicious tacos and lively atmosphere. It's a great spot to enjoy Mexican cuisine with a modern twist.",
     "rating": "4.0",
     "location": "111 S Hamilton St, Madison, WI 53703",
     "happy_hour_deals": [
         {
             "day": "Monday-Friday",
             "details": "2:00-5:00PM: half off Tacos, $2 Tecate Cans, $5 Tecate Can & Bartender's Choice (Tequila or Mezcal), Half off Pacifico Pints, Wine, and Signature Margaritas.",
             "start_time": "14:00",
             "end_time": "17:00",
             "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
         },
         {
             "day": "Monday-Friday",
             "details": "9:00PM-Close: half off Tacos, $2 Tecate Cans, $5 Tecate Can & Bartender's Choice (Tequila or Mezcal), Half off Pacifico Pints, Wine, and Signature Margaritas.",
             "start_time": "21:00",
             "end_time": "22:00",
             "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
         }
     ],
     "latitude": "43.0726",
     "longitude": "-89.3837",
     "category": ["Appetizers", "Drinks"],
     "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
     "cuisine": "Mexican"
 },
 {
     "id": "3",
     "name": "Estacion Inka",
     "image": "https://bloximages.chicago2.vip.townnews.com/madison.com/content/tncms/assets/v3/editorial/a/df/adfc24d5-79d3-5bfe-a725-71292f8e7263/5e42c7c8cffe4.image.jpg?resize=1200%2C900",
     "description": "A student-favorite casual Peruvian restaurant in downtown Madison, offering exciting and delicious flavors that come in large portions, including an amazing Pollo a la Brasa!",
     "rating": "4.5",
     "location": "616 University Ave, Madison, WI 53715",
     "happy_hour_deals": [
         {
             "day": "Monday-Friday",
             "details": "12:00-4:00PM: 20% off Chicken Rice and Beans",
             "start_time": "12:00",
             "end_time": "16:00",
             "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
         }
     ],
     "latitude": "43.0733778",
     "longitude": "-89.39654247",
     "category": ["Meals"],
     "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
     "cuisine": "Peruvian"
 },

{
 "id": "4",
 "name": "Paul’s Pelmini",
 "image": "https://lh3.googleusercontent.com/p/AF1QipPWmad0d8tQUQMDp6HmbPBwSkRlI1jIq5w0z_n5=s680-w680-h510",
 "description": "At Paul's Pel'meni, we serve the best dumplings in Madison! Enjoy our variety of fillings, including beef, potato, and more.",
 "rating": "4.4",
 "location": "414 W Gilman St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Tuesday-Sunday",
         "details": "5:00-8:00PM: $4 Taps, Rail Drinks, and White Claws. $5 Cherry Bombs, Tito's Sunrise, and Double Dirty Shirley Temple.",
         "start_time": "17:00",
         "end_time": "20:00",
          "deal_list": ["Tuesday", "Wednesday", "Thursday", "Friday","Saturday","Sunday"]
     }
 ],
 "latitude": "43.074503",
 "longitude": "-89.394115",
 "category": ["Drinks"],
 "dotw": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 "cuisine": "Russian"
},
{
 "id": "5",
 "name": "Eno Vino",
 "image": "https://static.wixstatic.com/media/968194_d5f5b665e403418c8a0d8f6a1210bd61~mv2.jpg/v1/fill/w_640,h_786,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/968194_d5f5b665e403418c8a0d8f6a1210bd61~mv2.jpg",
 "description": "Whether you're planning a lively gathering with friends, a romantic evening, or simply seeking a respite during happy hour, Eno Vino offers an unparalleled backdrop with some of the most breathtaking views Madison has to offer.",
 "rating": "4.1",
 "location": "1 N Webster St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Thursday",
         "details": "4:00-6:00PM: $2 Off All wines by the glass, Select To-share items, Signature on ice and up hand-crafted cocktails, hearth oven flatbreads and small plate bruschetta.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday"]
     },
     {
         "day": "Sunday",
         "details": "All day: $2 Off All wines by the glass, Select To-share items, Signature on ice and up hand-crafted cocktails, hearth oven flatbreads and small plate bruschetta.",
         "start_time": "16:00",
         "end_time": "23:59",
         "deal_list": ["Sunday"]
     }
 ],
 "latitude": "43.07661437988281",
 "longitude": "-89.38232421875",
 "category": ["Drinks", "Appetizers"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
 "cuisine": "International"
},
{
 "id": "6",
 "name": "BelAir Cantina",
 "image": "https://static.spotapps.co/website_images/ab_websites/2280_website/locations/locations_madison.jpg",
 "description": "BelAir Cantina draws inspiration from the Californian coast and the taco trucks that line the beaches.",
 "rating": "3.2",
 "location": "111 Martin Luther King Jr Blvd, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday",
         "details": "11:00-11:00: $5 Margaritas",
         "start_time": "11:00",
         "end_time": "23:00",
         "deal_list": ["Monday"]
     },
     {
         "day": "Tuesday & Thursday",
         "details": "11:00-11:00: $3 Tacos",
         "start_time": "11:00",
         "end_time": "23:00",
         "deal_list": ["Tuesday","Thursday"]
     },
     {
         "day": "Wednesday",
         "details": "11:00-11:00: $11.11 all burritos",
         "start_time": "11:00",
         "end_time": "23:00",
         "deal_list":["Wednesday"]
     }
 ],
 "latitude": "43.073848724365234",
 "longitude": "-89.38255310058594",
 "category": ["Meals", "Appetizers", "Drinks"],
 "dotw": ["Monday", "Tuesday", "Thursday", "Wednesday"],
 "cuisine": "Mexican"
},
{
 "id": "7",
 "name": "The Old Fashioned",
 "image": "https://fastly.4sqi.net/img/general/600x600/151703384_SmJh_wURkohQ7nOu8yolwyLNDhsrKNKHbVHRsV-yliY.jpg",
 "description": "Wisconsin-themed, retro-style tavern offering beers, brats & cheese curds all sourced from within-state.",
 "rating": "4.1",
 "location": "23 N Pinckney St #1, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Thursday",
         "details": "4:00-6:00PM: $2 off Brandy Old Fashions, Rail Drinks and $6 Taps.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list": ["Monday","Tuesday","Wednesday","Thursday"]
     }
 ],
 "latitude": "43.0762771",
 "longitude": "-89.3835835",
 "category": ["Drinks"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday"],
 "cuisine": "American"
},
{
 "id": "8",
 "name": "Merchant",
 "image": "https://lh3.googleusercontent.com/p/AF1QipMwrGIL2NqsUxiwtWyZo8VmuOlxfS7ZAKpR3Bwm=s680-w680-h510",
 "description": "Industrial-chic gastropub & liquor store serving farm-to-table New American fare & craft cocktails.",
 "rating": "3.9",
 "location": "121 S Pinckney St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Everyday",
         "details": "4:00-6:00PM: 20% OFF all snacks & apps, classic cocktails, draft beer, and wines by the glass.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday","Friday","Saturday","Sunday"]
     },
     {
         "day": "Tuesday (Date Night)",
         "details": "Choice of any snack, starter, and any entree, and a bottle of wine to share. Starting at $60 for two guests.",
         "start_time": "18:00",
         "end_time": "22:00",
         "deal_list":["Tuesday"]
     },
     {
         "day": "Sunday",
         "details": "Industry gets 25% off food and drink (Service based workers).",
         "start_time": "9:00",
         "end_time": "22:00",
         "deal_list":["Sunday"]
     }
 ],
 "latitude": "43.07423782348633",
 "longitude": "-89.38101196289062",
 "category": ["Meals", "Drinks", "Appetizers"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 "cuisine": "American"
},
{
 "id": "9",
 "name": "State Street Brats",
 "image": "https://lh3.googleusercontent.com/p/AF1QipPtLP0Tx1qRTb5DsutPACKIB8niSeRqMxI92_ye=s680-w680-h510",
 "description": "Wisconsin Badger sports bar featuring red bratwurst, burgers & beer plus a front patio.",
 "rating": "3.1",
 "location": "603 State St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Thursday",
         "details": "3:00-5:00PM: Half off appetizers.",
         "start_time": "15:00",
         "end_time": "17:00",
         "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday"]
     }
 ],
 "latitude": "43.0746741",
 "longitude": "-89.395981",
 "category": ["Appetizers"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday"],
 "cuisine": "American"
},
{
 "id": "10",
 "name": "Lucille",
 "image": "https://static.wixstatic.com/media/50d0a5_ff180554c80a41e1bfa7a708bc19050d~mv2.jpg/v1/fill/w_1960,h_996,al_c/50d0a5_ff180554c80a41e1bfa7a708bc19050d~mv2.jpg",
 "description": "We are located at the gateway of Madison’s historic culinary and entertainment center – the First Settlement District of Madison, WI.",
 "rating": "3.9",
 "location": "101 King St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Everyday",
         "details": "3:00-6:00PM: 20% off all tap beer, daiquiris, margaritas, and mojitos.",
         "start_time": "15:00",
         "end_time": "18:00",
          "deal_list":["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
     },
     {
         "day": "Wednesday (Date Night)",
         "details": "6:00-Close: Bottle of wine, appetizer, 10” wood-fired pizza, and dessert for $50.",
         "start_time": "18:00",
         "end_time": "23:00",
         "deal_list":["Wednesday"]
     }
 ],
 "latitude": "43.0745354",
 "longitude": "-89.3814973",
 "category": ["Drinks", "Meals"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 "cuisine": "Pan-Latin"
},
{
 "id": "11",
 "name": "Cento",
 "image": "https://resizer.otstatic.com/v2/photos/xlarge/1/25926432.jpg",
 "description": "A premiere Italian restaurant in downtown Madison, where we combine Old World Italian traditions with modern techniques.",
 "rating": "4.1",
 "location": "122 W Mifflin St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Everyday",
         "details": "4:00-6:00PM: $5 Classic Italian Cocktails, $3 Pints of Peroni, $10 Glasses of Wine.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list":["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
     }
 ],
 "latitude": "43.0743299",
 "longitude": "-89.3820804",
 "category": ["Drinks"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 "cuisine": "Italian"
},
{
 "id": "12",
 "name": "Tavernakaya",
 "image": "https://images.squarespace-cdn.com/content/v1/59651623d482e9030f764c54/1596666231928-4DFVYXWHSFUCH6IRFNRS/Tavernakaya+Storefront.jpeg",
 "description": "Industrial tavern offering a sushi bar, ramen bowls & Japanese tapas along with local & Asian beers.",
 "rating": "3.6",
 "location": "27 E Main St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Friday",
         "details": "4:30-6:00PM: Half off House Sake, All Wines, and Rail Mixers, $4 Draft Sapporo and Spotted, and $5 Sushi Rolls, Popcorn Chicken, Fries, and Edamame.",
         "start_time": "16:30",
         "end_time": "18:00",
         "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
     }
 ],
 "latitude": "43.0743595",
 "longitude": "-89.3820804",
 "category": ["Drinks", "Appetizers"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
 "cuisine": "Japanese"
},
{
 "id": "13",
 "name": "The Coopers Tavern",
 "image": "https://i.pinimg.com/originals/cb/3f/f0/cb3ff023834b676336fadaa28662fb02.jpg",
 "description": "Upscale Irish tavern serving pub grub & international beer & wine in a warm, contemporary venue.",
 "rating": "3.9",
 "location": "20 W Mifflin St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Friday",
         "details": "3:00-6:00PM: 25% off Growlers, $25 bottle wine, $2 off Appetizers, Cocktails, and Draft.",
         "start_time": "15:00",
         "end_time": "18:00",
         "deal_list":["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
     }
 ],
 "latitude": "43.0751039",
 "longitude": "-89.3861343",
 "category": ["Appetizers", "Drinks"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
 "cuisine": "Irish"
},
{
 "id": "14",
 "name": "Rare Steakhouse",
 "image": "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,q_75,w_1200/v1/crm/madison/RARE_Library00-f0efadd85056a36_f0efaf2d-5056-a36a-08e87be1e5684fed.jpg",
 "description": "A fancy steakhouse with an old-school vibe serving classy cuts & sides paired with fine wines.",
 "rating": "3.8",
 "location": "14 W Mifflin St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Tuesday-Friday",
         "details": "4:00-6:00: Half price bar menu & drink specials.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list": ["Tuesday", "Wednesday", "Thursday", "Friday"]
     }
 ],
 "latitude": "43.075308",
 "longitude": "-89.386127",
 "category": ["Appetizers", "Drinks"],
 "dotw": ["Tuesday", "Wednesday", "Thursday", "Friday"],
 "cuisine": "American"
},
{
 "id": "11",
 "name": "Cento",
 "image": "https://resizer.otstatic.com/v2/photos/xlarge/1/25926432.jpg",
 "description": "A premiere Italian restaurant in downtown Madison, where we combine Old World Italian traditions with modern techniques.",
 "rating": "4.1",
 "location": "122 W Mifflin St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Everyday",
         "details": "4:00-6:00PM: $5 Classic Italian Cocktails, $3 Pints of Peroni, $10 Glasses of Wine.",
         "start_time": "16:00",
         "end_time": "18:00",
         "deal_list":["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
     }
 ],
 "latitude": "43.0743299",
 "longitude": "-89.3820804",
 "category": ["Drinks"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 "cuisine": "Italian"
},
{
 "id": "15",
 "name": "Test",
 "image": "https://images.squarespace-cdn.com/content/v1/59651623d482e9030f764c54/1596666231928-4DFVYXWHSFUCH6IRFNRS/Tavernakaya+Storefront.jpeg",
 "description": "Test owls & Japanese tapas along with local & Asian beers.",
 "rating": "3.6",
 "location": "27 E Main St, Madison, WI 53703",
 "happy_hour_deals": [
     {
         "day": "Monday-Friday",
         "details": "4:30-6:00PM: Half off House Sake, All Wines, and Rail Mixers, $4 Draft Sapporo and Spotted, and $5 Sushi Rolls, Popcorn Chicken, Fries, and Edamame.",
         "start_time": "16:30",
         "end_time": "18:00",
         "deal_list": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
     }
 ],
 "latitude": "43.0743500",
 "longitude": "-89.3820800",
 "category": ["Drinks", "Appetizers"],
 "dotw": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
 "cuisine": "Japanese"
}
];

async function authenticate() {
    try {
      // Use an admin or test email and password
      const userCredential = await signInWithEmailAndPassword(auth, "anthonyjcthomas@gmail.com", "joshuA1234$");
      console.log("Authenticated as:", userCredential.user.uid);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }
  
  async function migrateData() {
    try {
      const batch = writeBatch(db); // Create a Firestore batch
  
      // Add all establishments to the batch
      establishments.forEach((establishment) => {
        const docRef = doc(db, "establishments", establishment.name); // Set doc ID as establishment name
        batch.set(docRef, establishment);
      });
  
      await batch.commit(); // Commit the batch
      console.log("Batch write succeeded!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  
  // First authenticate, then migrate the data
  authenticate().then(() => {
    migrateData();
  });