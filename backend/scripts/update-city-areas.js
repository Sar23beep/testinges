require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const City = require('../models/City');

const cityAreasMapping = {
  // Metros & Major NCR Hubs
  "delhi": [
    "South Delhi", "Aerocity", "Connaught Place", "Vasant Kunj", "Hauz Khas", "Saket", 
    "Greater Kailash 1 & 2", "Dwarka", "Karol Bagh", "Rohini", "Janakpuri", "Lajpat Nagar", 
    "Defence Colony", "Pitampura", "Punjabi Bagh", "Rajouri Garden", "Mayur Vihar", "Nehru Place", 
    "Civil Lines", "Paschim Vihar", "Green Park", "Chanakyapuri", "Malviya Nagar", "Patel Nagar"
  ],
  "mumbai": [
    "Bandra West", "Andheri West", "Juhu", "South Mumbai", "Powai", "Worli", "Lower Parel", 
    "BKC (Bandra Kurla Complex)", "Colaba", "Santacruz West", "Malad West", "Kandivali West", 
    "Borivali West", "Goregaon West", "Versova", "Dadar", "Chembur", "Ghatkopar", "Lokhandwala", 
    "Marine Drive", "Nariman Point", "Vile Parle", "Khar West", "Prabhadevi"
  ],
  "bengaluru": [
    "Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "MG Road", "Electronic City", 
    "Marathahalli", "Bellandur", "JP Nagar", "Jayanagar", "Malleshwaram", "Hebbal", "Yelahanka", 
    "Banashankari", "BTM Layout", "Sarjapur Road", "Richmond Town", "Sadashivanagar", "Kalyan Nagar", 
    "Rajajinagar", "Domlur", "Cunningham Road", "Ulsoor", "Banaswadi"
  ],
  "hyderabad": [
    "Banjara Hills", "Jubilee Hills", "Hitec City", "Gachibowli", "Madhapur", "Kondapur", 
    "Begumpet", "Somajiguda", "Kukatpally", "Secunderabad", "Ameerpet", "Manikonda", "Dilsukhnagar", 
    "Film Nagar", "Financial District", "SR Nagar", "Miyapur", "Mehdipatnam", "Uppal", "Bowenpally",
    "Kavuri Hills", "Tolichowki", "Himayatnagar", "Sainikpuri"
  ],
  "chennai": [
    "Nungambakkam", "T. Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR (Old Mahabalipuram Rd)", 
    "ECR (East Coast Road)", "Alwarpet", "Mylapore", "Guindy", "Porur", "Kilpauk", "Besant Nagar", 
    "Vadapalani", "Royapettah", "Thiruvanmiyur", "Kodambakkam", "Egmore", "Chetpet", "Perungudi",
    "Ashok Nagar", "Gopalapuram", "Sholinganallur", "Pallavaram"
  ],
  "kolkata": [
    "Park Street", "Salt Lake (Sector 1-5)", "New Town", "Ballygunge", "Alipore", "Rajarhat", 
    "South City", "Gariahat", "Behala", "Dum Dum", "Howrah", "Bhowanipore", "Jadavpur", "Lake Town", 
    "EM Bypass", "Tollygunge", "Ruby Area", "Ultadanga", "Shakespeare Sarani", "Kankurgachi", 
    "Southern Avenue", "Prince Anwar Shah Road", "Kasba", "Garia"
  ],
  "pune": [
    "Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Baner", "Hinjewadi", "Shivaji Nagar", 
    "Kothrud", "Aundh", "Magarpatta City", "Wakad", "Camp", "Hadapsar", "Kharadi", "Pimple Saudagar", 
    "Deccan Gymkhana", "Senapati Bapat Road", "FC Road", "Bavdhan", "Erandwane", "Balewadi",
    "Model Colony", "Boat Club Road", "Prabhat Road", "Chinchwad"
  ],
  "gurugram": [
    "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "Cyber City", 
    "Golf Course Road", "Golf Course Extension", "Sohna Road", "MG Road", "Sector 29", "Sector 56", 
    "Sector 57", "Sector 49", "Sector 14", "Sushant Lok 1", "Nirvana Country", "South City 1 & 2", 
    "Sector 48", "Gwal Pahari", "Sector 43", "Sector 24", "Sector 54", "New Gurgaon"
  ],
  "noida": [
    "Sector 18", "Sector 62", "Sector 137", "Sector 50", "Sector 76", "Sector 75", "Sector 128", 
    "Sector 150", "Sector 104", "Sector 44", "Sector 93", "Sector 15", "Sector 16", "Sector 100", 
    "Sector 144", "Sector 78", "Noida Expressway", "Sector 37", "Sector 12", "Sector 27", 
    "Sector 41", "Sector 74", "Sector 120", "Sector 143"
  ],
  "greater-noida": [
    "Pari Chowk", "Knowledge Park 1, 2, 3", "Alpha 1 & 2", "Beta 1 & 2", "Gamma 1 & 2", "Delta 1 & 2", 
    "Omega 1", "Chi Phi", "Techzone 4", "Ecotech", "Gaur City 1 & 2", "Sector 1", "Sector 16B", "Jaypee Greens"
  ],
  "ghaziabad": [
    "Indirapuram", "Vaishali", "Kaushambi", "Raj Nagar Extension", "Crossings Republik", 
    "Vasundhara", "Mohan Nagar", "Sahibabad", "Govindpuram", "Shastri Nagar", "Kavi Nagar", "Nehru Nagar"
  ],
  "faridabad": [
    "Sector 15", "Sector 16", "Sector 21C", "Sector 14", "NIT Faridabad 1-5", "Green Field Colony", 
    "Sector 28", "Neharpar (Greater Faridabad)", "Surajkund", "Mathura Road", "Sector 8", "Sector 31"
  ],
  "thane": [
    "Majiwada", "Ghodbunder Road", "Vartak Nagar", "Hiranandani Estate", "Naupada", "Wagle Estate", 
    "Pokhran Road 1 & 2", "Kasarvadavali", "Panchpakhadi", "Kolshet Road", "Vasant Vihar", "Manpada", "Louis Wadi"
  ],
  "navi-mumbai": [
    "Vashi", "Belapur (CBD)", "Nerul", "Kharghar", "Seawoods", "Kopar Khairane", "Airoli", 
    "Sanpada", "Panvel", "Ulwe", "Ghansoli", "Kamothe", "Juinagar", "Taloja"
  ],

  // Maharashtra Hubs
  "nagpur": ["Dharampeth", "Ramdaspeth", "Sadar", "Civil Lines", "Pratap Nagar", "Wardha Road", "Manish Nagar", "Sitabuldi", "Nandanvan", "Laxmi Nagar"],
  "nashik": ["College Road", "Gangapur Road", "Mahatma Nagar", "Indira Nagar", "Govind Nagar", "Panchavati", "Satpur", "Ambad", "Pathardi Phata", "Nashik Road"],
  "chhatrapati-sambhajinagar": ["CIDCO", "Samarth Nagar", "Cantonment", "Garkheda", "Beed Bypass", "Waluj", "Jalna Road", "Seven Hills", "Prozone Area", "Shahnoorwadi"],
  "solapur": ["Hotgi Road", "Jule Solapur", "Saat Rasta", "Old Pune Naka", "Lashkar", "Navi Peth", "Ashok Chowk", "Bhavani Peth"],
  "kolhapur": ["Tarabai Park", "Rajarampuri", "Nagala Park", "Shahupuri", "Kadamwadi", "Ruikar Colony", "Rankala Area", "Circuit House"],
  "amravati": ["Camp", "Rathi Nagar", "Rajapeth", "Gadge Nagar", "Dastur Nagar", "Sai Nagar", "Badnera Road", "Panchavati"],
  "sangli": ["Vishrambag", "Ganpati Peth", "Miraj Road", "Khanbhag", "Gaon Bhag", "Kupwad", "Willingdon College Area"],
  "jalgaon": ["Ring Road", "Court Chowk", "Prabhat Colony", "Navi Peth", "Adarsh Nagar", "MIDC", "Jilha Peth"],
  "akola": ["Civil Lines", "Kaulkhed", "Gorakshan Road", "Toshniwal Layout", "Ram Nagar", "Old City", "Jatharpeth"],
  "latur": ["MIDC", "Ausa Road", "Nanded Road", "Barshi Road", "Khadgaon Road", "Prakash Nagar", "Shyam Nagar"],
  "dhule": ["Deopur", "Agra Road", "Wadbhokhar Road", "Walwadi", "Parola Road", "Old Dhule", "Mahindale"],
  "ahmednagar": ["Savedi", "Pipeline Road", "Station Road", "MIDC", "Bhingar", "Market Yard", "Delhi Gate"],
  "kalyan-dombivli": ["Khadakpada", "Gandhar Nagar", "Bail Bazar", "Lodha Heaven", "Palava City", "Dombivli Gymkhana", "Manpada Dombivli"],
  "vasai-virar": ["Vasai West", "Manickpur", "Evershine City", "Stella", "Chulne", "Virar West", "Bolinj", "Yashwant Nagar", "Nalasopara West"],

  // Rajasthan
  "jaipur": ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Raja Park", "Mansarovar", "Tonk Road", "MI Road", "Civil Lines", "Jagatpura", "Bapu Nagar", "Gopalpura Bypass", "Bani Park", "Ajmer Road", "Sitapura", "Vidhyadhar Nagar", "Sodala", "Shyam Nagar", "Adarsh Nagar"],
  "jodhpur": ["Ratanada", "Shastri Nagar", "Paota", "Sardarpura", "Pal Road", "Chopasni Housing Board", "Air Force Area", "Mandore", "Basni"],
  "udaipur": ["Fateh Sagar", "Panchwati", "Sukher", "Hiran Magri", "Saheli Nagar", "Shobhagpura", "Bhuwana", "Goverdhan Vilas", "City Palace Area"],
  "kota": ["Talwandi", "Vigyan Nagar", "Mahaveer Nagar", "Gumanpura", "Rajeev Gandhi Nagar", "Dadabari", "Kunhari", "Indra Vihar", "Coral Park"],
  "ajmer": ["Civil Lines", "Vaishali Nagar", "Panchsheel Nagar", "Ana Sagar Circular Rd", "Adarsh Nagar", "Kishangarh Road", "Makhupura"],
  "bikaner": ["Kanta Khaturia Colony", "Rani Bazar", "Sadul Ganj", "Jai Narayan Vyas Colony", "Pawan Puri", "Ganga Shehar", "Napasar Rd"],
  "alwar": ["Moti Doongri", "Company Garden Area", "Manu Marg", "Malviya Nagar", "Neemrana Hub", "Bhiwadi Area", "Scheme 8"],
  "bhilwara": ["Subhash Nagar", "Azad Nagar", "Shastri Nagar", "Pur Road", "Bhopal Ganj", "Bada Mandir Area", "Pansal Road"],
  "sikar": ["Piprali Road", "Fatehpur Road", "Nawalgarh Road", "Bajaj Gram", "Radhakishan Pura", "Devipura", "Station Road"],
  "jaisalmer": ["Fort Area", "Sam Sand Dunes", "Hanuman Circle", "Gadisar Lake Area", "Air Force Road", "Amar Sagar"],
  "pushkar": ["Brahma Temple Area", "Pushkar Lake", "Mela Ground", "Marwar Bus Stand", "Panchkund Road", "Jamni Kund"],

  // Uttar Pradesh
  "lucknow": ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Alambagh", "Ashiyana", "Sushant Golf City", "Vikas Nagar", "Vibhuti Khand", "Chowk", "Charbagh", "Jankipuram", "Rajajipuram", "Amar Shaheed Path", "Chinhat", "Singar Nagar", "Vrindavan Yojna"],
  "kanpur": ["Swaroop Nagar", "Civil Lines", "Kakadeo", "Kidwai Nagar", "Arya Nagar", "Tilak Nagar", "Mall Road", "Shyam Nagar", "Govind Nagar", "Cantt Area", "Lajpat Nagar", "Barra", "Pandu Nagar"],
  "agra": ["Fatehabad Road", "Sanjay Place", "Civil Lines", "Tajganj", "Kamla Nagar", "Dayalbagh", "Shahganj", "Sadar Bazar", "Khandari", "Sikandra", "MG Road", "Shamsabad Road"],
  "varanasi": ["Cantt Area", "Sigra", "Bhelupur", "Lanka (BHU)", "Godowlia", "Assi Ghat", "Orderly Bazar", "Mahmoorganj", "Sarnath", "Shivpur", "Pandeypur", "Durgakund"],
  "prayagraj": ["Civil Lines", "George Town", "Tagore Town", "Katra", "Ashok Nagar", "Mumfordganj", "Allahpur", "Lukarganj", "Dhoomanganj", "Naini"],
  "meerut": ["Shastri Nagar", "Civil Lines", "Modipuram", "Kanker Khera", "Sadar Bazar", "Pallavpuram", "Ganga Nagar", "Delhi Road", "Hapur Bypass"],
  "bareilly": ["Civil Lines", "Rajendra Nagar", "DD Puram", "Pilibhit Bypass", "Janakpuri", "Model Town", "Subhash Nagar", "Izzatnagar"],
  "gorakhpur": ["Civil Lines", "Golghar", "Taramandal", "Medical College Road", "Shahpur", "Mohaddipur", "Betiahata", "Rapti Nagar", "Kunraghat"],
  "aligarh": ["Civil Lines", "Centre Point", "Ramghat Road", "Marris Road", "Dodhpur", "GT Road", "Samad Road", "Swarna Jayanti Nagar"],
  "moradabad": ["Civil Lines", "Ram Ganga Vihar", "Delhi Road", "MDA Colony", "Majhola", "Kanth Road", "Buddhi Vihar"],
  "saharanpur": ["Civil Lines", "Delhi Road", "Hasanpur", "Court Road", "Mission Compound", "Gill Colony", "Chilkana Road"],
  "jhansi": ["Civil Lines", "Sadar Bazar", "Elite Crossing", "Sipri Bazar", "Nandan Pura", "Gwalior Road", "Kanpur Road"],
  "mathura": ["Krishna Nagar", "Civil Lines", "Vrindavan Road", "Highway Plaza Area", "Dampier Nagar", "BSA College Road", "Govardhan Rd"],
  "ayodhya": ["Ram Janmabhoomi Area", "Naya Ghat", "Faizabad Civil Lines", "Rikabganj", "Devkali", "Hanuman Garhi Area", "Ayodhya Dham"],

  // Madhya Pradesh
  "indore": ["Vijay Nagar", "Palasia", "AB Road", "MG Road", "Saket Nagar", "Bhawar Kuan", "Rajwada", "Mahalaxmi Nagar", "Nipania", "Rau", "Annapurna", "Geeta Bhawan", "Scheme 54", "Scheme 78", "Khajrana", "LIG Colony", "Super Corridor", "Bypass Road"],
  "bhopal": ["MP Nagar Zone 1 & 2", "Arera Colony", "Gulmohar", "Shahpura", "Kolar Road", "TT Nagar", "Hoshangabad Road", "Chuna Bhatti", "Malviya Nagar", "Ayodhya Bypass", "Bawadiya Kalan", "Shyamla Hills"],
  "gwalior": ["City Centre", "Lashkar", "Morar", "Thatipur", "Phool Bagh", "Pinto Park", "Alkapuri", "Kampoo", "Maharaj Bada"],
  "jabalpur": ["Civil Lines", "Napier Town", "Wright Town", "Gorakhpur", "Vijay Nagar", "Madan Mahal", "Adhartal", "Tilhari"],
  "ujjain": ["Freeganj", "Nanakheda", "Mahakal Area", "Dewas Road", "Sethi Nagar", "Indore Road", "Tower Chowk"],
  "sagar": ["Civil Lines", "Makronia", "Gopal Ganj", "Tili Road", "Katra Bazar", "Cantt Area"],
  "ratlam": ["Station Road", "Do Batti", "Kasturba Nagar", "Alkapuri", "Shastri Nagar", "Sailana Road"],
  "rewa": ["Civil Lines", "Bodabag", "University Road", "Sirmour Chowk", "Nehru Nagar", "Kothi Compound"],
  "satna": ["Civil Lines", "Bharhut Nagar", "Pateri", "Rewa Road", "Uchehara Rd", "Mukhtiyar Ganj"],

  // Punjab & Chandigarh & Haryana
  "chandigarh": ["Sector 17", "Sector 35", "Sector 22", "Sector 8 & 9", "Sector 26", "Sector 43", "Sector 7", "Sector 10", "Industrial Area Phase 1 & 2", "Manimajra", "IT Park", "Sector 15", "Sector 34", "Sector 44"],
  "ludhiana": ["Sarabha Nagar", "Model Town", "Ferozepur Road", "Civil Lines", "Mall Road", "BRS Nagar", "South City", "Pakhowal Road", "Dugri", "Gill Road", "Ghumar Mandi", "Kitchlu Nagar"],
  "amritsar": ["Ranjit Avenue (A-D)", "Mall Road", "Lawrence Road", "Model Town", "Green Avenue", "Majitha Road", "Albert Road", "GT Road", "Circular Road", "Basant Avenue", "Airport Road"],
  "jalandhar": ["Model Town", "Civil Lines", "Jalandhar Cantt", "PPR Mall Area", "Rama Mandi", "BMC Chowk", "Urban Estate Phase 1 & 2", "Ladowali Road"],
  "patiala": ["Leela Bhawan", "Model Town", "Urban Estate Phase 1 & 2", "Mall Road", "Baradari", "Chhoti Baradari", "Sirhind Road"],
  "bathinda": ["Model Town Phase 1-3", "Civil Lines", "Mall Road", "100 Feet Road", "Goniana Road", "Thermal Colony"],
  "mohali": ["Sector 70", "Sector 71", "Phase 3B2", "Phase 7", "Phase 5", "Sector 82 (JLPL)", "Phase 10 & 11", "Kharar Road", "Airport Road Mohali"],
  "panipat": ["Model Town", "Sector 11 & 12", "GT Road", "Ansals Sushant City", "HUDA Sector 25", "Assandh Road"],
  "ambala": ["Ambala Cantt", "Ambala City", "Model Town", "Sector 7, 8, 9", "Cloth Market Area", "Jagadhri Road"],
  "karnal": ["Model Town", "Sector 13", "Sector 14", "Sector 6 & 7", "Kunjpura Road", "Mughal Canal", "GT Road"],
  "rohtak": ["Model Town", "Sector 1-4", "Civil Lines", "Delhi Road", "Subhash Nagar", "IMT Rohtak"],
  "hisar": ["Model Town", "Urban Estate 1 & 2", "Sector 13 & 14", "Delhi Road", "Camp Chowk", "PLA Complex"],
  "sonipat": ["Sector 14 & 15", "Model Town", "Kundli Industrial Area", "Omaxe City", "TDI City", "Murthal Road"],
  "panchkula": ["Sector 20", "Sector 4 & 5", "Sector 11 & 12", "Sector 21", "Mansa Devi Complex", "Sector 7 & 8", "Pinjore Kalka Road"],

  // Uttarakhand & Himachal & J&K
  "dehradun": ["Rajpur Road", "Jakhan", "Sahastradhara Road", "Clement Town", "Ballupur", "Chakrata Road", "Vasant Vihar", "Hathibarkala", "Dharampur", "Prem Nagar", "GMS Road", "ISBT Area"],
  "haridwar": ["Ranipur More", "BHEL Township", "Shivalik Nagar", "Har Ki Pauri", "Jwalapur", "Kankhal", "Sidcul Area"],
  "rishikesh": ["Tapovan", "Laxman Jhula Area", "Ram Jhula Area", "Muni Ki Reti", "AIIMS Area", "Barrage Road", "Dehradun Road"],
  "roorkee": ["Civil Lines", "IIT Roorkee Campus Area", "Delhi Road", "Malviya Chowk", "Solani Puram", "Ganeshpur"],
  "haldwani": ["Nainital Road", "Kaladhungi Road", "Mukhani", "Tikonia", "Bhotia Parao", "Kathgodam", "Kusumkhera"],
  "nainital": ["Mall Road", "Tallital", "Mallital", "Ayarpatta", "Bhowali", "Pangot", "Sukhatal"],
  "shimla": ["Mall Road", "The Ridge", "Sanjauli", "Chotta Shimla", "Kasumpti", "New Shimla", "Jakhu", "Kuftadhar", "Summer Hill"],
  "manali": ["Mall Road", "Old Manali", "Aleo", "Vashisht", "Naggar Road", "Solang Valley Road", "Prini", "Rangri"],
  "dharamshala": ["McLeod Ganj", "Bhagsunag", "Kotwali Bazar", "Dharamsala Cantt", "Dharamkot", "Yol Cantt", "Civil Lines"],
  "solan": ["Mall Road", "Kumarhatti", "Chambaghat", "Kandaghat", "Barog", "Saproon", "Oachghat"],
  "srinagar": ["Rajbagh", "Lal Chowk", "Boulevard Road (Dal Lake)", "Karan Nagar", "Jawahar Nagar", "Hyderpora", "Sanat Nagar", "Nishat"],
  "jammu": ["Gandhi Nagar", "Trikuta Nagar", "Channi Himmat", "Bahu Plaza", "Resham Ghar", "R.S. Pura Road", "Jewel Chowk"],

  // Karnataka
  "mysuru": ["Gokulam (1-3)", "Jayalakshmipuram", "Kuvempunagar", "Vijayanagar (1-4)", "Saraswathipuram", "Hebbal Industrial Area", "VV Mohalla", "Bannimantap", "Yadavagiri"],
  "mangaluru": ["Kadri", "Bejai", "Kodialbail", "Lalbagh", "Hampankatta", "Kankanady", "Bunder", "Surathkal", "Mannagudda", "Falnir"],
  "hubballi-dharwad": ["Vidyanagar", "Gokul Road", "Keshwapur", "Navanagar", "Shirur Park", "Koppikar Road", "Dharwad Toll Naka", "Sattur"],
  "belagavi": ["Tilakwadi", "Camp Area", "Khanapur Road", "Hindwadi", "Shastri Nagar", "Udyambag", "Khasbag", "Civil Hospital Area"],
  "kalaburagi": ["Sedam Road", "Aiwan-e-Shahi", "Super Market", "MSK Mill Area", "Brahampur", "Vikas Nagar", "Kuvempu Nagar"],
  "ballari": ["Cantonment", "Gandhi Nagar", "Infantry Road", "Brucepet", "Parvathi Nagar", "Anantapur Road", "Talur Road"],
  "davanagere": ["MCC 'A' & 'B' Block", "Vidyanagar", "Hadadi Road", "PB Road", "Shamanur Road", "Anjaneya Badavane"],
  "shivamogga": ["Gopala", "Vinoba Nagar", "Jayanagar", "Tilak Nagar", "Savalanga Road", "BH Road", "Kuvempu Road"],
  "tumakuru": ["SIT Main Road", "Batawadi", "Ashok Nagar", "Gubbi Gate", "Kyathsandra", "SS Puram"],
  "udupi": ["Manipal", "Kunjibettu", "Brahmagiri", "Ambagilu", "Malpe", "Santhekatte", "Diana Circle"],

  // Telangana & Andhra Pradesh
  "warangal": ["Hanamkonda", "Kazipet", "Subedari", "Nakkalagutta", "Waddepally", "Hunter Road", "Balasamudram", "Mandi Bazar"],
  "nizamabad": ["Khaleelwadi", "Bodhan Road", "Armoor Road", "Subhash Nagar", "Kanteshwar", "Pragathi Nagar"],
  "karimnagar": ["Collectorate Road", "Mukarampura", "Kashmirgadda", "Jyothinagar", "Vavilalapalli", "Kothirampur"],
  "khammam": ["Wyra Road", "Mamillagudem", "Balanagar", "Rotary Nagar", "Kaviraj Nagar", "Gandi Chowk"],
  "visakhapatnam": ["Beach Road", "Siripuram", "MVP Colony", "Dwaraka Nagar", "Madhurawada", "Gajuwaka", "Rushikonda", "Seethammadhara", "Jagadamba Centre", "Waltair Uplands", "Asilmetta", "Pendurthi", "Yendada"],
  "vijayawada": ["MG Road", "Benz Circle", "Governorpet", "Suryaraopet", "Auto Nagar", "Labbipet", "Bhavanipuram", "Moghalrajpuram", "Gannavaram"],
  "guntur": ["Brodipet", "Arundelpet", "Lakshmipuram", "Vidya Nagar", "Pattabhipuram", "Kothapet", "Amaravathi Road", "Old Club Road"],
  "nellore": ["Dargamitta", "Magunta Layout", "Vedayapalem", "Pogathota", "Balaji Nagar", "Stonehousepet", "Kavali Rd"],
  "kurnool": ["Nandyal Checkpost", "Mourya Inn Area", "Gayatri Estate", "Joharapuram", "Budhawarpet", "Collectorate Area"],
  "rajahmundry": ["Danavaipeta", "Kotipalli Bus Stand Area", "Morampudi", "Aryapuram", "Prakash Nagar", "Lalacheruvu", "Syndicate Bank Colony"],
  "tirupati": ["Alipiri", "Bhavani Nagar", "Korlagunta", "AIR Bypass Road", "MR Palli", "Renigunta Road", "Padmavathi Puram"],
  "kakinada": ["Bhanugudi", "Suryaraopeta", "Sarpavaram", "Cinema Road", "Ramanayyapeta", "Collectorate Road", "Jagannaickpur"],
  "kadapa": ["Nagarajupet", "RTC Bus Stand Area", "Yerramukkapalli", "Mariapuram", "Co-operative Colony", "Akkayapalli"],
  "anantapur": ["Subash Nagar", "Kamalanagar", "Sapthagiri Circle", "Rudrampeta", "Housing Board Colony", "Collectorate Road"],

  // Tamil Nadu
  "coimbatore": ["RS Puram", "Race Course", "Peelamedu", "Gandhipuram", "Saibaba Colony", "Saravanampatti", "Ganapathy", "Ramanathapuram", "Vadavalli", "Singanallur", "Avinashi Road", "Ukkadam", "Kovaipudur"],
  "madurai": ["Anna Nagar", "KK Nagar", "Goripalayam", "Tallakulam", "Mattuthavani", "Simmakkal", "Bypass Road", "Villapuram", "SS Colony"],
  "tiruchirappalli": ["Thillai Nagar", "Cantonment", "KK Nagar", "Srirangam", "Central Bus Stand Area", "Woraiyur", "Ponmalai", "Vasan Nagar"],
  "salem": ["Fairlands", "Alagapuram", "Hasthampatti", "Suramangalam", "Seelanaickenpatti", "Meyyanur", "Ammapet", "Junction Area"],
  "tiruppur": ["Avinashi Road", "Kumaran Road", "Dharapuram Road", "Veerapandi", "Rayapuram", "Anupparpalayam", "Palladam Road"],
  "erode": ["Perundurai Road", "Brough Road", "Sathy Road", "Moolapalayam", "Surampatti", "Collectorate Area", "Thindal"],
  "vellore": ["Katpadi", "Gandhi Nagar", "Sathuvachari", "Bagayam", "Thorapadi", "Salavanpet", "Arcot Road"],
  "tirunelveli": ["Palayamkottai", "Vannarpettai", "Town Area", "Tirunelveli Junction", "Perumalpuram", "High Ground", "Melapalayam"],
  "thoothukudi": ["Millerpuram", "Polpettai", "Beach Road", "Cruz Fernandez Puram", "Chidambara Nagar", "SIPCOT"],
  "dindigul": ["Nandavanapatti", "Palani Road", "Trichy Road", "GTN Salai", "Begambur", "Round Road"],
  "thanjavur": ["Medical College Road", "Yagappa Nagar", "New Bus Stand Area", "Pillaiyarpatti", "Srinivasapuram", "Karanthai"],
  "nagercoil": ["Court Road", "Vadasery", "Kottar", "Chettikulam", "Asaripallam", "Parvathipuram"],
  "hosur": ["SIPCOT 1 & 2", "Bagalur Road", "Rayakotta Road", "Mathigiri", "Mookandapalli", "Denkanikotta Road"],

  // Kerala
  "kochi": ["Marine Drive", "MG Road", "Kakkanad (Infopark)", "Edappally", "Panampilly Nagar", "Kaloor", "Vyttila", "Fort Kochi", "Kadavanthra", "Palarivattom", "Ravipuram", "Thevara", "Kalamassery", "Aluva", "Tripunithura", "Cherai"],
  "thiruvananthapuram": ["Kowdiar", "Vellayambalam", "Technopark (Kazhakkoottam)", "Pattom", "Vazhuthacaud", "Palayam", "Thampanoor", "Statue", "Sasthamangalam", "Sreekaryam", "Pettah", "Kovalam Beach"],
  "kozhikode": ["Beach Road", "Mavoor Road", "Calicut Bypass", "Nadakkavu", "Thondayad", "PT Usha Road", "Eranhipalam", "Mananchira", "Medical College Area"],
  "thrissur": ["Swaraj Round", "MG Road", "Poothole", "Puzhakkal", "Ayyanthole", "Mannuthy", "Kuriachira", "Ollur", "Ramavarmapuram"],
  "kollam": ["Asramam", "Chinnakada", "Beach Road", "Kavanad", "Tangasseri", "Kadappakada", "Polayathode", "Ayathil"],
  "kannur": ["Thana", "Payyambalam", "South Bazar", "Caltex", "Talap", "Pallikkunnu", "Mele Chovva"],
  "alappuzha": ["VCSB Road", "Mullakkal", "Alappuzha Beach", "Thathampally", "Punnamada", "Kalavoor"],
  "kottayam": ["Collectorate Area", "Nagampadam", "Kanjikuzhy", "Baker Junction", "Ettumanoor", "Changanassery Road"],
  "palakkad": ["Chandranagar", "Kalpathy", "Civil Station Area", "Stadium Bus Stand", "Kallekkad", "Pirayiri"],

  // West Bengal & Bihar & Jharkhand & Odisha
  "howrah": ["Shibpur", "Mandirtala", "Salkia", "Bally", "Liluah", "Santragachi", "Kadamtala", "Andul Road"],
  "siliguri": ["Sevoke Road", "Pradhan Nagar", "Matigara", "Hakim Para", "College Para", "City Centre Area", "Salugara", "Hill Cart Road"],
  "durgapur": ["City Centre", "Benachity", "Bidhannagar", "Muchipara", "Steel Township", "Fuljhore", "Amravati Colony"],
  "asansol": ["Burnpur", "Ushagram", "Hutton Road", "Kalyanpur", "SB Gorai Road", "Court Area", "Chelidanga"],
  "kharagpur": ["IIT Campus Area", "Prembazar", "Malancha", "Gole Bazar", "Chhota Tengra", "Kharida"],
  "bardhaman": ["Curzon Gate Area", "Badamtala", "Borehat", "Nutanganj", "Golapbag", "Ullhas"],
  "malda": ["English Bazar", "Mahanandapally", "Kutubpur", "Rathbari", "Singatala", "Mokdumpur"],
  "patna": ["Fraser Road", "Boring Road", "Bailey Road", "Kankarbagh", "Rajendra Nagar", "Patliputra Colony", "Danapur Cantt", "Exhibition Road", "Anisabad", "Ashiana Nagar", "Gola Road", "Raja Bazar", "Saguna More", "SK Puri"],
  "gaya": ["Civil Lines", "AP Colony", "Rampur", "Bodhgaya Area", "Station Road", "Anugrah Puri", "Delha"],
  "bhagalpur": ["Adampur", "Tilka Manjhi", "Zero Mile", "Ghantaghar", "Khanjarpur", "Naya Bazar", "Aliganj"],
  "muzaffarpur": ["Club Road", "Mithanpura", "Damuchak", "Aghoria Bazar", "Brahmpura", "Kalyani", "Bairiya"],
  "darbhanga": ["Laheriasarai", "Tower Chowk", "Benta", "Donar", "Allalpatti", "Darbhanga Fort Area"],
  "purnia": ["Line Bazar", "Bhatta Bazar", "Navratan Hatta", "Madhubani Bazar", "Gulabbagh", "Rambagh"],
  "ranchi": ["Harmu Housing Colony", "Kanke Road", "Lalpur", "Doranda", "Morabadi", "Hinoo", "Main Road", "Ashok Nagar", "Bariatu", "Ratu Road", "Namkum", "Argora", "Circular Road"],
  "jamshedpur": ["Bistupur", "Sakchi", "Kadma", "Sonari", "Telco Colony", "Baridih", "CH Area", "Adityapur", "Golmuri", "Jugsalai"],
  "dhanbad": ["Bank More", "Saraidhela", "Hirapur", "Bartand", "Steel Gate", "Dhaiya", "Koyla Nagar", "Park Market"],
  "bokaro-steel-city": ["Sector 4", "Sector 1", "Sector 9", "City Centre", "Chas", "Co-operative Colony", "Sector 12"],
  "deoghar": ["Tower Chowk", "Baidyanath Dham Area", "Castairs Town", "Bilasi Town", "Jasidih", "Kunda"],
  "bhubaneswar": ["Saheed Nagar", "Jaydev Vihar", "Patia", "Nayapalli", "Khandagiri", "Chandrasekharpur", "Master Canteen", "Infocity", "Rasulgarh", "KIIT Square", "Baramunda", "Old Town", "Bapuji Nagar"],
  "cuttack": ["CDA Sector 6-9", "Badambadi", "Link Road", "College Square", "Mangalabag", "Madhupatna", "Choudhury Bazar"],
  "rourkela": ["Civil Township", "Sector 5, 7, 19", "Koel Nagar", "Chhend Colony", "Panposh", "Udit Nagar"],
  "berhampur": ["Giri Road", "Courtpeta", "Bhavani Nagar", "Engineering School Road", "Gosaninuagaon", "Gandhi Nagar"],
  "sambalpur": ["Dhanupali", "Ainthapali", "Budharaja", "Bareipali", "Farm Road", "Khetrajpur"],
  "puri": ["VIP Road", "Sea Beach Road", "Grand Road (Bada Danda)", "Chakratirtha Road", "Baliapanda", "Swargadwar Area"],

  // Assam & Northeast States
  "guwahati": ["GS Road", "Christian Basti", "Paltan Bazaar", "Ganeshguri", "Dispur", "Zoo Road (R.G. Baruah Rd)", "Ulubari", "Beltola", "Six Mile", "Jalukbari", "Khanapara", "Bhangagarh", "Uzan Bazar", "Lachit Nagar"],
  "silchar": ["Tarapur", "Hospital Road", "Rangirkhari", "Link Road", "Hailakandi Road", "Ambicapatty", "Janiganj"],
  "dibrugarh": ["Graham Bazar", "Jalan Nagar", "Amolapatty", "Chowkidinghee", "Mancotta Road", "Naliapool"],
  "jorhat": ["Gar-Ali", "AT Road", "Tarajan", "Na-Ali", "Jail Road", "Kendu Guri", "Barbheta"],
  "shillong": ["Police Bazar", "Laitumkhrah", "Risa Colony", "Mawlai", "Nongthymmai", "Labran", "Polo Grounds"],
  "agartala": ["Kunjaban", "Akhaura Road", "Banamalipur", "Radhanagar", "Krishnanagar", "Melarmath", "Indranagar"],
  "imphal": ["Thangal Bazar", "Paona Bazar", "Kangla", "Lamphelpat", "Uripok", "Singjamei", "Babupara"],
  "aizawl": ["Zarkawt", "Chanmari", "Dawrpui", "Bawngkawn", "Khatla", "Tuikual", "Kulikawn"],
  "dimapur": ["Circular Road", "Nyamo Lotha Road", "Duncan Basti", "Purana Bazar", "Walford", "Chumukedima"],
  "gangtok": ["MG Marg", "Deorali", "Tadong", "Development Area", "Ranipool", "Sichey", "Kazi Road"],
  "itanagar": ["Ganga Market", "0-Point", "Bank Tinali", "Naharlagun", "Chandranagar", "Nirjuli", "E-Sector"],

  // Goa & UTs & Chhattisgarh
  "panaji": ["Miramar", "Campal", "Fontainhas (Latin Quarter)", "Altinho", "Dona Paula", "Caranzalem", "Ribandar", "Patto Centre"],
  "margao": ["Comba", "Pajifond", "Fatorda", "Borda", "Aquem", "Gogol", "Colva Road", "Navelim"],
  "calangute": ["Calangute Beach", "Tito's Lane Area", "Baga Road", "Candolim Road", "Naika Vaddo", "Umtav Vaddo", "Arpora Road"],
  "vasco-da-gama": ["Airport Road", "Baina", "Chicalim", "Dabolim", "Mangor Hill", "Vaddem", "Mormugao"],
  "raipur": ["Civil Lines", "Shankar Nagar", "VIP Road", "Pandri", "Devendra Nagar", "Telibandha", "Samta Colony", "Tatibandh", "Katora Talab", "Mowa", "Naya Raipur"],
  "bhilai": ["Sector 6, 7, 9", "Nehru Nagar", "Civic Centre", "Supela", "Smriti Nagar", "Kohka", "Power House"],
  "bilaspur": ["Vyapar Vihar", "Rajendra Nagar", "Rama Magneto Area", "Link Road", "Civil Lines", "Torwa", "Mangla"],
  "korba": ["Transport Nagar", "TP Nagar", "Niharika", "Balco Nagar", "Darri", "CSEB Colony", "Kosabadi"],
  "durg": ["Padmanabhpur", "Civil Lines", "Station Road", "Potia", "Ganjpara", "Adarsh Nagar"],
  "puducherry": ["White Town (French Quarter)", "Heritage Town", "MG Road", "Auroville Area", "ECR Road", "Lawspet", "Muthialpet", "Mission Street", "Beach Promenade"]
};

// Generic generator for any smaller regional town to guarantee rich local areas
function getAreasForCity(cityName, stateName) {
  if (cityAreasMapping[cityName.toLowerCase().replace(/\s+/g, '-')]) {
    return cityAreasMapping[cityName.toLowerCase().replace(/\s+/g, '-')];
  }
  return [
    "Civil Lines", "Station Road", "Main Market", "Model Town", 
    "Gandhi Nagar", "VIP Road", "Mall Road", "College Road"
  ];
}

async function run() {
  const citiesPath = path.join(__dirname, '../data/indian-cities.json');
  const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

  const updatedCities = cities.map((c) => {
    const key = c.slug;
    const areas = cityAreasMapping[key] || getAreasForCity(c.name, c.state);
    return {
      ...c,
      areas
    };
  });

  fs.writeFileSync(citiesPath, JSON.stringify(updatedCities, null, 2), 'utf8');
  console.log(`✓ Updated data/indian-cities.json with local areas for ${updatedCities.length} cities.`);

  await connectDatabase();
  console.log('Seeding updated cities with areas into MongoDB...');

  for (const c of updatedCities) {
    await City.updateOne(
      { slug: c.slug },
      { 
        $set: { 
          areas: c.areas,
          state: c.state,
          tier: c.tier
        } 
      },
      { upsert: true }
    );
  }

  console.log('✓ Successfully synced all city local areas to MongoDB.');
}

if (require.main === module) {
  run()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { cityAreasMapping, getAreasForCity };
