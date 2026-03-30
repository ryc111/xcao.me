// Guest Photo URLs — sourced from Wikipedia (public domain / Creative Commons)
// Guests not in this map will fall back to their name initials
const GUEST_PHOTOS = {
    // === Leadership & Management ===
    "Ben Horowitz": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/TechCrunch_Disrupt_San_Francisco_2018_-_day_2_%2842713740520%29_%28cropped%29.jpg/250px-TechCrunch_Disrupt_San_Francisco_2018_-_day_2_%2842713740520%29_%28cropped%29.jpg",
    "Bret Taylor": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/TechCrunch_Disrupt_2024_D2_Bret_Taylor-3_%28cropped%29.jpg/250px-TechCrunch_Disrupt_2024_D2_Bret_Taylor-3_%28cropped%29.jpg",
    "Brian Chesky": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Brian_Chesky_2025.jpg/250px-Brian_Chesky_2025.jpg",
    "Chip Conley": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Chip_Conley.jpg/250px-Chip_Conley.jpg",
    "Jason Fried": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Jason_Fried%2C_2008.jpg/250px-Jason_Fried%2C_2008.jpg",
    "Kim Scott": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kim_Scott_%28author%29.jpg/250px-Kim_Scott_%28author%29.jpg",
    "Roger Martin": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Roger_Martin_World_Economic_Forum_2013.jpg/250px-Roger_Martin_World_Economic_Forum_2013.jpg",
    "Jeffrey Pfeffer": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Jeffrey_Pfeffer_2011.jpg/250px-Jeffrey_Pfeffer_2011.jpg",

    // === AI & Technology ===
    "Marc Andreessen": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Marc_Andreessen-9_%28cropped%29.jpg/250px-Marc_Andreessen-9_%28cropped%29.jpg",
    "Dr. Fei Fei Li": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Fei-Fei_Li_at_AI_for_Good_2017.jpg/250px-Fei-Fei_Li_at_AI_for_Good_2017.jpg",
    "Mike Krieger": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Mike_Krieger_in_2018_%28cropped%29.jpg/250px-Mike_Krieger_in_2018_%28cropped%29.jpg",
    "Scott Belsky": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/TNW_USA_2014_%2816085105617%29_%28cropped%29.jpg/250px-TNW_USA_2014_%2816085105617%29_%28cropped%29.jpg",

    // === Startups & Founding ===
    "Drew Houston": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Drew_Houston_at_Web_Summit_%28cropped%29.jpg/250px-Drew_Houston_at_Web_Summit_%28cropped%29.jpg",
    "Stewart Butterfield": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Web_Summit_2017_-_Day_1_CG1_6591_%2838187890026%29.jpg/250px-Web_Summit_2017_-_Day_1_CG1_6591_%2838187890026%29.jpg",
    "Marc Benioff": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Marc_Benioff.jpg/250px-Marc_Benioff.jpg",
    "Eric Ries": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Eric_Ries2.jpg/250px-Eric_Ries2.jpg",
    "Melanie Perkins": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/M_Perkins.jpg/250px-M_Perkins.jpg",
    "Dylan Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Dylan_Field_TechCrunch_Disrupt_2022_1435088567_%28cropped%29.jpg/250px-Dylan_Field_TechCrunch_Disrupt_2022_1435088567_%28cropped%29.jpg",
    "Dylan Field 2.0": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Dylan_Field_TechCrunch_Disrupt_2022_1435088567_%28cropped%29.jpg/250px-Dylan_Field_TechCrunch_Disrupt_2022_1435088567_%28cropped%29.jpg",
    "Matt Mullenweg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Matt_Mullenweg.jpg/250px-Matt_Mullenweg.jpg",
    "Tobi Lutke": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/NYC-Commerce-Tobi-L%C3%BCtki-561.jpg/250px-NYC-Commerce-Tobi-L%C3%BCtki-561.jpg",
    "Brian Halligan": "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Brian_Halligan%2C_HubSpot.jpg/250px-Brian_Halligan%2C_HubSpot.jpg",
    "Jessica Livingston": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/509306957DH00068_TechCrunch.jpg/250px-509306957DH00068_TechCrunch.jpg",
    "Dalton Caldwell": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Dalton_Caldwell_%2843627374955_cropped%29.jpg/250px-Dalton_Caldwell_%2843627374955_cropped%29.jpg",
    "Nikita Bier": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Nikita_Bier_2023_%28cropped%29.jpg/250px-Nikita_Bier_2023_%28cropped%29.jpg",
    "Kunal Shah": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kunal_Shah_in_FreeCharge_T-Shirt_%28cropped%29.jpg/250px-Kunal_Shah_in_FreeCharge_T-Shirt_%28cropped%29.jpg",
    "Guillermo Rauch": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Guillermo_Rauch_2018.jpg/220px-Guillermo_Rauch_2018.jpg",
    "Ryan Hoover": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Ryan_Hoover_at_Web_Summit.jpg/250px-Ryan_Hoover_at_Web_Summit.jpg",

    // === Product Strategy ===
    "Geoffrey Moore": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Geoffrey_Moore_at_OSBC.jpg/250px-Geoffrey_Moore_at_OSBC.jpg",
    "Annie Duke": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Annie_Duke_jgphoto_002.jpg/250px-Annie_Duke_jgphoto_002.jpg",

    // === Growth & Acquisition ===
    "Nir Eyal": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/NirEyal2019.jpg/250px-NirEyal2019.jpg",
    "Seth Godin": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Seth_Godin_in_2009.jpg/250px-Seth_Godin_in_2009.jpg",

    // === Career & Personal Development ===
    "Carole Robin": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Carole_Robin_2021.jpg/250px-Carole_Robin_2021.jpg",

    // === Marketing & Branding ===
    "Christopher Lochhead": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Christopher_Lochhead_2019.jpg/250px-Christopher_Lochhead_2019.jpg"
};
